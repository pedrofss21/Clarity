// ===========================================
// SISTEMA DE HIGIENIZAÇÕES - VERSÃO 2.0
// ===========================================

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(
    "https://kknauyvxqbdtbsbrcsqt.supabase.co",
    "sb_publishable_gFfjyvLrrGKxZJNi3sOyGg_taig6Pl5"
  );
}

// ---------- Tabela de preços ----------
const PRECOS = {
"Higienização": {
"Novo": 7,
"Semi-novo": 7
},
"Polimento": {
"Novo": 5,
"Semi-novo": 10
}
};
// ---------- Estado da aplicação ----------
let servico = "Higienização";
let tipo = "Semi-novo";
let editandoId = null;
let cars = JSON.parse(localStorage.getItem("cars")) || [];
// ---------- Elementos ----------
const servicoControl = document.getElementById("servicoControl");
const tipoControl = document.getElementById("tipoControl");
const commissionValue = document.getElementById("commissionValue");
const modeloInput = document.getElementById("modeloInput");
const placaInput = document.getElementById("placaInput");
const dataInput = document.getElementById("dataInput");
const addBtn = document.getElementById("addBtn");
const carList = document.getElementById("carList");
const totalCars = document.getElementById("totalCars");
const totalCommission = document.getElementById("totalCommission");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");
const pdfBtn = document.getElementById("pdfBtn");
// ---------- Inicialização ----------
if (dataInput) {
dataInput.valueAsDate = new Date();
}
// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================
function formatBRL(valor) {
return valor.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});
}
function getComissao() {
return PRECOS[servico][tipo];
}
function updateCommissionDisplay() {
commissionValue.textContent = formatBRL(getComissao());
}
function setActiveSegment(control, value) {
[...control.children].forEach((btn) => {
btn.classList.toggle("active", btn.dataset.value === value);
});
}
function salvarDados() {
localStorage.setItem("cars", JSON.stringify(cars));
}
function buscarCarro(id) {
return cars.find((carro) => carro.id === id);
}
function limparFormulario() {
modeloInput.value = "";
placaInput.value = "";
dataInput.valueAsDate = new Date();
servico = "Higienização";
tipo = "Semi-novo";
setActiveSegment(servicoControl, servico);
setActiveSegment(tipoControl, tipo);
updateCommissionDisplay();
editandoId = null;
addBtn.textContent = "Adicionar veículo";
}
// Única função de resumo (aceita uma lista opcional, usa cars por padrão)
function updateSummary(lista = cars) {
totalCars.textContent = lista.length;
const total = lista.reduce((soma, carro) => soma + carro.valor, 0);
totalCommission.textContent = formatBRL(total);
}
function renderCarList(lista = cars) {

    carList.innerHTML = "";

    if (lista.length === 0) {

        carList.innerHTML = `
            <div class="car-item">
                <div class="info-sub">
                    Nenhum veículo encontrado.
                </div>
            </div>
        `;

        updateSummary(lista);
        return;
    }

    lista.forEach((car) => {

        const item = document.createElement("div");

        item.className = "car-item";

        const data = new Date(car.data + "T00:00:00")
            .toLocaleDateString("pt-BR");

        item.innerHTML = `
            <div>

                <div class="info-title">
                    🚗 ${car.placa}${car.modelo ? " • " + car.modelo : ""}
                </div>

                <div class="info-sub">
                    ${car.servico} • ${car.tipo}
                </div>

                <div class="info-sub">
                    📅 ${data}
                </div>

            </div>

            <div style="text-align:right;">

                <div class="value">
                    ${formatBRL(car.valor)}
                </div>

                <div class="car-actions">

                    <button class="edit-btn" onclick="editarVeiculo(${car.id})">
                        ✏️
                    </button>

                    <button class="delete-btn" onclick="excluirVeiculo(${car.id})">
                        🗑
                    </button>

                </div>

            </div>
        `;

        carList.appendChild(item);

    });

    updateSummary(lista);

}
function editarVeiculo(id) {
const carro = buscarCarro(id);
if (!carro) return;
modeloInput.value = carro.modelo;
placaInput.value = carro.placa;
dataInput.value = carro.data;
servico = carro.servico;
tipo = carro.tipo;
setActiveSegment(servicoControl, servico);
setActiveSegment(tipoControl, tipo);
updateCommissionDisplay();
editandoId = id;
addBtn.textContent = "Salvar alterações";
window.scrollTo({ top: 0, behavior: "smooth" });
}
function excluirVeiculo(id) {
if (!confirm("Deseja excluir este veículo?")) return;
cars = cars.filter((carro) => carro.id !== id);
salvarDados();
renderCarList();
}
function pesquisarVeiculos(texto) {
texto = texto.trim().toLowerCase();
if (texto === "") {
renderCarList();
return;
}
const resultado = cars.filter((carro) => {
const data = new Date(carro.data + "T00:00:00").toLocaleDateString("pt-BR");
return (
carro.placa.toLowerCase().includes(texto) ||
carro.modelo.toLowerCase().includes(texto) ||
carro.servico.toLowerCase().includes(texto) ||
carro.tipo.toLowerCase().includes(texto) ||
data.includes(texto)
);
});
renderCarList(resultado);
}
function gerarPDF() {
const mes = prompt("Digite o mês (1-12):");
if (!mes) return;
const ano = prompt("Digite o ano:");
if (!ano) return;
const lista = cars.filter((carro) => {
const data = new Date(carro.data);
return (
data.getMonth() + 1 === Number(mes) &&
data.getFullYear() === Number(ano)
);
});
if (lista.length === 0) {
alert("Nenhum veículo encontrado.");
return;
}
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.setFontSize(20);
doc.text("RELATÓRIO DE COMISSÃO", 14, 20);
doc.setFontSize(12);
doc.text(`Período: ${mes}/${ano}`, 14, 30);
const tabela = [];
let total = 0;
let higienizacoes = 0;
let polimentos = 0;
lista.forEach((carro) => {
tabela.push([
new Date(carro.data + "T00:00:00").toLocaleDateString("pt-BR"),
carro.placa,
carro.modelo,
carro.servico,
carro.tipo,
formatBRL(carro.valor)
]);
total += carro.valor;
if (carro.servico === "Higienização") {
higienizacoes++;
} else {
polimentos++;
}
});
doc.autoTable({
startY: 40,
head: [["Data", "Placa", "Modelo", "Serviço", "Tipo", "Comissão"]],
body: tabela
});
let y = doc.lastAutoTable.finalY + 15;
doc.text(`Total de veículos: ${lista.length}`, 14, y);
y += 8;
doc.text(`Higienizações: ${higienizacoes}`, 14, y);
y += 8;
doc.text(`Polimentos: ${polimentos}`, 14, y);
y += 8;
doc.text(`Comissão total: ${formatBRL(total)}`, 14, y);
y += 20;
doc.text("Assinatura", 14, y);
doc.line(14, y + 12, 90, y + 12);
doc.save(`Relatorio-${mes}-${ano}.pdf`);
}
// ===========================================
// EVENTOS
// ===========================================
servicoControl.addEventListener("click", (e) => {
const btn = e.target.closest(".segment");
if (!btn) return;
servico = btn.dataset.value;
setActiveSegment(servicoControl, servico);
updateCommissionDisplay();
});
tipoControl.addEventListener("click", (e) => {
const btn = e.target.closest(".segment");
if (!btn) return;
tipo = btn.dataset.value;
setActiveSegment(tipoControl, tipo);
updateCommissionDisplay();
});
addBtn.addEventListener("click", () => {
const placa = placaInput.value.trim().toUpperCase();
const modelo = modeloInput.value.trim();
const data = dataInput.value;
if (placa === "") {
alert("Digite a placa.");
return;
}
const carro = {
id: editandoId ?? Date.now(),
placa,
modelo,
servico,
tipo,
data,
valor: getComissao()
};
if (editandoId === null) {
cars.push(carro);
} else {
const index = cars.findIndex((c) => c.id === editandoId);
cars[index] = carro;
}
salvarDados();
limparFormulario();
renderCarList();
});
placaInput.addEventListener("input", (e) => {
e.target.value = e.target.value.toUpperCase();
});
if (searchInput) {
searchInput.addEventListener("input", (e) => {
pesquisarVeiculos(e.target.value);
});
}
if (pdfBtn) {
pdfBtn.addEventListener("click", gerarPDF);
}
themeToggle.addEventListener("click", () => {
const isDark = document.body.classList.contains("dark");
document.body.classList.toggle("dark", !isDark);
document.body.classList.toggle("light", isDark);
themeToggle.textContent = isDark ? "☀️" : "🌙";
});
// ===========================================
// INÍCIO
// ===========================================
updateCommissionDisplay();
renderCarList();