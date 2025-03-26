const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const rocketImg = new Image();
rocketImg.src = "./images/rocket.png";

// Adjust canvas size to fill the entire screen
function adjustCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Fixed rocket position: horizontally centered and near the bottom
  rocket.x = canvas.width / 2 - 50;
  rocket.y = canvas.height - 160; // 150 height + 10px margin
}
window.addEventListener("resize", adjustCanvas);

// Simulation parameters
let altitude = 0;         // in km
let velocity = 0;         // in m/s
const acceleration = 83.33; // m/s² so that, starting from rest, in 120s the altitude is ~600 km (before the 550 km limit)
let fuel = 100;           // fuel in percentage
let launched = false;
const maxSpeed = 8500;    // maximum velocity in m/s
const maxAltitude = 550;  // maximum altitude in km

// Velocity unit: "m/s" or "km/h"
let speedUnit = "m/s";

// Total fuel in kg
const initialFuelKg = 729000;

// The rocket remains fixed on the screen
let rocket = { x: 0, y: 0 };

adjustCanvas();

// Function to interpolate between two colors (hex format)
function interpolateColor(color1, color2, factor) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Updates the background with a continuous gradient
function updateBackground() {
  // f ranges from 0 (ground) to 1 (200 km or higher, defining space)
  let f = Math.min(altitude / 300, 1);
  const groundColorLower = "#87CEEB"; // sky blue (ground)
  const groundColorUpper = "#00BFFF"; // deep blue (near the top of the sky)
  const lowerColor = interpolateColor(groundColorLower, "#000000", f);
  const upperColor = interpolateColor(groundColorUpper, "#000000", f);
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, upperColor);
  gradient.addColorStop(1, lowerColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draws the rocket (fixed position)
function drawRocket() {
  ctx.drawImage(rocketImg, rocket.x, rocket.y, 100, 150);
}

function updateInfo() {
  // Updates the altitude, showing decimals
  document.getElementById("altitude").textContent = altitude.toFixed(1); // Show 1 decimal place

  let displayedSpeed = velocity;
  if (speedUnit === "km/h") {
    displayedSpeed = velocity * 3.6;
  }
  // Formats velocity with commas as thousands separators and no decimals
  document.getElementById("velocity").textContent = Math.floor(displayedSpeed).toLocaleString('en');

  // Formats fuel with commas as thousands separators and no decimals
  document.getElementById("fuel").textContent = Math.floor(fuel).toLocaleString('en') + "%";

  // Updates the fuel in kg (based on percentage)
  const fuelKg = (fuel / 100) * initialFuelKg;
  document.getElementById("fuelKg").textContent = "Fuel: " + Math.floor(fuelKg).toLocaleString('en') + " kg";
}

// Updates the atmospheric layer based on the altitude, displaying only the current range
function updateLayer() {
  let layer = "";
  if (altitude < 12) {
    layer = "Troposphere";
  } else if (altitude < 50) {
    layer = "Stratosphere";
  } else if (altitude < 85) {
    layer = "Mesosphere";
  } else {
    // Altitude >=80 km: uses Thermosphere as base
    if (altitude < 100) {
      layer = "Thermosphere";
    } else if (altitude >= 100 && altitude < 110) {
      layer = "Thermosphere - Kármán Line";
    } else if (altitude >= 110 && altitude < 200) {
        layer = "Thermosphere";
    } else if (altitude >= 200 && altitude < 300) {
      layer = "Thermosphere - Auroras";
    } else if (altitude < 400) {
        layer = "Thermosphere";
    } else if (altitude >= 400 && altitude < 450) {
      layer = "Thermosphere - International Space Station - ISS";
    } else { (altitude = 550)
      layer = "Thermosphere - Hubble Space Telescope Orbit";
    }
  }
  document.getElementById("layer").innerHTML = layer;
}

// Time interval for simulation (dt in seconds: 50ms = 0.05 s)
const dt = 0.05;
// To make the fuel run out at 600 km (120s = 2400 steps) before the 550 km limit,
// the fuel consumption per step remains 100/2400.
const consumptionPerStep = 100 / 2400;

// Updates the simulation parameters (constant acceleration)
function updateSimulation() {
  if (!launched || fuel <= 0) return;
  
  // Updates velocity (limited to maxSpeed)
  velocity += acceleration * dt;
  if (velocity > maxSpeed) {
    velocity = maxSpeed;
  }
  
  // Updates altitude (converts from meters to km)
  altitude += (velocity * dt) / 1000;
  if (altitude > maxAltitude) {
    altitude = maxAltitude;
    fuel = 0;
  }
  
  // Decreases fuel
  fuel -= consumptionPerStep;
  if (fuel < 0) fuel = 0;
  
  updateInfo();
  updateLayer();
}

// Animation function that redraws the background and rocket
function animate() {
  updateBackground();
  drawRocket();
  requestAnimationFrame(animate);
}

// Function that controls the simulation (updates parameters every 50ms)
function simulate() {
  if (!launched || fuel <= 0) return;
  updateSimulation();
  setTimeout(simulate, 50);
}

// "Launch" button
function launch() {
  if (!launched) {
    launched = true;
    simulate();
  }
}

// "Increase Thrust" button (increases velocity for visual effect)
function increaseThrust() {
  if (launched && fuel > 0) {
    velocity += 5;
    if (velocity > maxSpeed) velocity = maxSpeed;
  }
}

// Toggle for speed unit: m/s or km/h
function toggleUnit() {
  speedUnit = (speedUnit === "m/s") ? "km/h" : "m/s";
  document.getElementById("toggleUnit").textContent = speedUnit;
  updateInfo();
}

// Starts the animation when the rocket image is loaded
rocketImg.onload = () => {
  animate();
};
