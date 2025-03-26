const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fogueteImg = new Image();
fogueteImg.src = "./images/rocket.png";

// Ajusta o tamanho do canvas para preencher a tela inteira
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Posição fixa do foguete: centralizado horizontalmente e perto do rodapé
  foguete.x = canvas.width / 2 - 50;
  foguete.y = canvas.height - 160; // 150 de altura + 10px de margem
}
window.addEventListener("resize", ajustarCanvas);

// Parâmetros da simulação
let altitude = 0;         // em km
let velocidade = 0;       // em m/s
const aceleracao = 83.33; // m/s² para que, partindo do repouso, em 120s a altitude seja ~600 km (antes do limite de 550 km)
let combustivel = 100;    // combustível em porcentagem
let lançado = false;
const velocidadeMax = 8000; // limite máximo da velocidade em m/s
const altitudeMax = 550;    // limite máximo da altitude em km

// Unidade de velocidade: "m/s" ou "km/h"
let velUnidade = "m/s";

// Combustível total em kg
const initialFuelKg = 729000;

// O foguete permanece fixo na tela
let foguete = { x: 0, y: 0 };

ajustarCanvas();

// Função de interpolação entre duas cores (formato hexadecimal)
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

// Atualiza o fundo com um gradiente contínuo
function atualizarFundo() {
  // f varia de 0 (solo) até 1 (200 km ou mais, definindo o espaço)
  let f = Math.min(altitude / 200, 1);
  const corInferiorSolo = "#87CEEB"; // azul céu (solo)
  const corSuperiorSolo = "#00BFFF"; // azul profundo (próximo ao topo do céu)
  const corInferior = interpolateColor(corInferiorSolo, "#000000", f);
  const corSuperior = interpolateColor(corSuperiorSolo, "#000000", f);
  let gradiente = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradiente.addColorStop(0, corSuperior);
  gradiente.addColorStop(1, corInferior);
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Desenha o foguete (posição fixa)
function desenharFoguete() {
  ctx.drawImage(fogueteImg, foguete.x, foguete.y, 100, 150);
}

// Atualiza as informações exibidas na tela
function atualizarInfo() {
// Atualiza a altitude, arredondada para um número inteiro
document.getElementById("altitude").textContent = Math.floor(altitude); // Remover casas decimais

let velocidadeExibida = velocidade;
if (velUnidade === "km/h") {
velocidadeExibida = velocidade * 3.6;
}
// Formata velocidade com vírgula como separador de milhar e sem casas decimais
document.getElementById("velocidade").textContent = Math.floor(velocidadeExibida).toLocaleString('en');

// Formata o combustível com vírgula como separador de milhar e sem casas decimais
document.getElementById("combustivel").textContent = Math.floor(combustivel).toLocaleString('en') + "%";

// Atualiza o combustível em kg (baseado no percentual)
const fuelKg = (combustivel / 100) * initialFuelKg;
document.getElementById("fuelKg").textContent = "Combustível: " + Math.floor(fuelKg).toLocaleString('en') + " kg";
}


// Atualiza a camada atmosférica conforme a altitude, exibindo apenas a faixa atual.
function atualizarCamada() {
  let camada = "";
  if (altitude < 12) {
    camada = "Troposfera";
  } else if (altitude < 50) {
    camada = "Estratosfera";
  } else if (altitude < 85) {
    camada = "Mesosfera";
  } else {
    // Altitude >=80 km: usa a Termosfera como base.
    if (altitude < 100) {
      camada = "Termosfera";
    } else if (altitude >= 100 && altitude < 110) {
      camada = "Termosfera - Linha de Kármán";
    } else if (altitude >= 110 && altitude < 200) {
        camada = "Termosfera";
    } else if (altitude >= 200 && altitude < 300) {
      camada = "Termosfera - Auroras";
    } else if (altitude < 400) {
        camada = "Termosfera";
    } else if (altitude >= 400 && altitude < 450) {
      camada = "Termosfera - International Space Station - ISS";
    } else { (altitude = 550)
      camada = "Termosfera - Órbita do Telescópio Espacial Hubble";
    }
  }
  document.getElementById("camada").innerHTML = camada;
}

// Intervalo de tempo da simulação (dt em segundos: 50ms = 0.05 s)
const dt = 0.05;
// Para que o combustível acabe em 600 km (120s = 2400 passos) antes do limite de 550 km,
// o consumo por passo permanece 100/2400.
const consumoPorPasso = 100 / 2400;

// Atualiza os parâmetros da simulação (aceleração constante)
function atualizarSimulacao() {
  if (!lançado || combustivel <= 0) return;
  
  // Atualiza a velocidade (limitada a velocidadeMax)
  velocidade += aceleracao * dt;
  if (velocidade > velocidadeMax) {
    velocidade = velocidadeMax;
  }
  
  // Atualiza a altitude (converte de metros para km)
  altitude += (velocidade * dt) / 1000;
  if (altitude > altitudeMax) {
    altitude = altitudeMax;
    combustivel = 0;
  }
  
  // Diminui o combustível
  combustivel -= consumoPorPasso;
  if (combustivel < 0) combustivel = 0;
  
  atualizarInfo();
  atualizarCamada();
}

// Função de animação que redesenha o fundo e o foguete
function animar() {
  atualizarFundo();
  desenharFoguete();
  requestAnimationFrame(animar);
}

// Função que controla a simulação (atualiza os parâmetros a cada 50ms)
function simular() {
  if (!lançado || combustivel <= 0) return;
  atualizarSimulacao();
  setTimeout(simular, 50);
}

// Botão "Lançar"
function lançar() {
  if (!lançado) {
    lançado = true;
    simular();
  }
}

// Botão "Aumentar Empuxo" (aumenta a velocidade para efeito visual)
function aumentarEmpuxo() {
  if (lançado && combustivel > 0) {
    velocidade += 5;
    if (velocidade > velocidadeMax) velocidade = velocidadeMax;
  }
}

// Toggle para unidade de velocidade: m/s ou km/h
function toggleUnidade() {
  velUnidade = (velUnidade === "m/s") ? "km/h" : "m/s";
  document.getElementById("toggleUnit").textContent = velUnidade;
  atualizarInfo();
}

// Inicia a animação quando a imagem do foguete carregar
fogueteImg.onload = () => {
  animar();
};