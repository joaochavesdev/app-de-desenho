const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");

const corEl = document.getElementById("cor");
const espessuraEl = document.getElementById("espessura");
const valorEspessuraEl = document.getElementById("valor-espessura");
const btnPincel = document.getElementById("btn-pincel");
const btnBorracha = document.getElementById("btn-borracha");
const btnDesfazer = document.getElementById("btn-desfazer");
const btnLimpar = document.getElementById("btn-limpar");
const btnSalvar = document.getElementById("btn-salvar");

const MAX_HISTORICO = 30;
const historico = [];

let desenhando = false;
let ferramenta = "pincel"; // "pincel" ou "borracha"
let ultimoX = 0;
let ultimoY = 0;

// Fundo branco (sem isso o PNG salvo sai com fundo transparente)
function preencherFundo() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ---------- Histórico (desfazer) ----------
function salvarEstado() {
  historico.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (historico.length > MAX_HISTORICO) historico.shift();
}

function desfazer() {
  if (historico.length === 0) return;
  ctx.putImageData(historico.pop(), 0, 0);
}

// ---------- Posição do mouse/dedo dentro do canvas ----------
// O canvas tem 1000x600 "pixels internos", mas pode aparecer menor na tela.
// Esta conta converte a posição da tela para a posição interna.
function posicao(evento) {
  const retangulo = canvas.getBoundingClientRect();
  return {
    x: (evento.clientX - retangulo.left) * (canvas.width / retangulo.width),
    y: (evento.clientY - retangulo.top) * (canvas.height / retangulo.height),
  };
}

// ---------- Desenho ----------
function desenharLinha(x, y) {
  ctx.strokeStyle = ferramenta === "borracha" ? "#ffffff" : corEl.value;
  ctx.lineWidth = Number(espessuraEl.value);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(ultimoX, ultimoY);
  ctx.lineTo(x, y);
  ctx.stroke();

  ultimoX = x;
  ultimoY = y;
}

function iniciarTraco(evento) {
  desenhando = true;
  canvas.setPointerCapture(evento.pointerId); // continua desenhando se o mouse sair do canvas
  salvarEstado();

  const { x, y } = posicao(evento);
  ultimoX = x;
  ultimoY = y;
  desenharLinha(x, y); // linha de um ponto só desenha uma bolinha (clique simples)
}

function continuarTraco(evento) {
  if (!desenhando) return;
  const { x, y } = posicao(evento);
  desenharLinha(x, y);
}

function terminarTraco() {
  desenhando = false;
}

// ---------- Ferramentas e botões ----------
function escolherFerramenta(nome) {
  ferramenta = nome;
  btnPincel.classList.toggle("ativo", nome === "pincel");
  btnBorracha.classList.toggle("ativo", nome === "borracha");
}

function limparTela() {
  if (!confirm("Limpar o desenho? Você ainda pode desfazer.")) return;
  salvarEstado();
  preencherFundo();
}

function salvarImagem() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "desenho.png";
  link.click();
}

// ---------- Eventos ----------
canvas.addEventListener("pointerdown", iniciarTraco);
canvas.addEventListener("pointermove", continuarTraco);
canvas.addEventListener("pointerup", terminarTraco);
canvas.addEventListener("pointercancel", terminarTraco);

btnPincel.addEventListener("click", () => escolherFerramenta("pincel"));
btnBorracha.addEventListener("click", () => escolherFerramenta("borracha"));
btnDesfazer.addEventListener("click", desfazer);
btnLimpar.addEventListener("click", limparTela);
btnSalvar.addEventListener("click", salvarImagem);

espessuraEl.addEventListener("input", () => {
  valorEspessuraEl.textContent = espessuraEl.value;
});

// Ctrl+Z para desfazer
document.addEventListener("keydown", (evento) => {
  if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "z") {
    evento.preventDefault();
    desfazer();
  }
});

// ---------- Início ----------
preencherFundo();