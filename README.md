# Rocket Launcher 🚀

Welcome to the **Rocket Simulation**! 🚀

This project is a fun, interactive web-based simulation where you can launch your own rocket and watch it soar through the sky. The goal? Reach the stars! 🌟

The simulation gives you control over the rocket's thrust and allows you to monitor its speed, altitude, and fuel consumption. As the rocket ascends, you'll see the atmospheric layers change, and the background will transition from sky blue to the deep blackness of space. Can you make it all the way to 550 km? Only one way to find out!

## Interactive Experience

- **Launch the Rocket**: Click the **Launch** button to send your rocket flying.
- **Increase Thrust**: Speed up the rocket by clicking the **Increase Thrust** button.
- **Switch Speed Units**: Toggle between meters per second (m/s) and kilometers per hour (km/h).
- **Monitor Fuel**: Watch as the fuel depletes as the rocket rises, and see how long it lasts before running out!

## Rocket Formula Equation ⚡

The rocket’s motion is governed by the basic principles of physics, and the simulation uses the following formula to update the rocket's altitude and velocity:

### Newton's Second Law of Motion:
\[
F = ma
\]
Where:
- \( F \) is the force (thrust) applied by the rocket.
- \( m \) is the mass of the rocket.
- \( a \) is the acceleration (which is constant in the simulation).

This formula helps calculate the rocket's acceleration, which in turn is used to update the velocity and altitude in real-time.

The fuel consumption is based on the altitude and time taken for the rocket to reach higher levels, and the simulation models the fuel usage until it reaches zero.

### Fuel Consumption Equation:
Fuel consumption per step is determined by:
\[
\text{Fuel per step} = \frac{\text{Initial Fuel}}{\text{Total Steps until Fuel Runs Out}}
\]

## Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.)

### Steps to run:
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/rocket-simulation.git
