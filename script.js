// Tabela de preços
const PRECOS = {
"Higienização": { "Novo": 7, "Semi-novo": 7 },
"Polimento": { "Novo": 5, "Semi-novo": 10 }
};
let servico = "Higienização";
let tipo = "Semi-novo";
let cars = [];
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
// Data padrão = hoje
dataInput.valueAsDate = new Date();
function formatBRL(value) {
return "R$ " + value.toFixed(2).replace(".", ",");
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
function renderCarList() {
carList.innerHTML = "";
cars.forEach((c) => {
const item = document.createElement("div");
item.className = "car-item";
const dataFormatada = new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR");
item.innerHTML = `
<div>
<div class="info-title">${c.placa}${c.modelo ? " · " + c.modelo : ""}</div>
<div class="info-sub">${c.servico} · ${c.tipo} · ${dataFormatada}</div>
</div>
<div class="value">${formatBRL(c.valor)}</div>
`;
});
carList.appendChild(item);
}
function updateSummary() {
totalCars.textContent = cars.length;
const total = cars.reduce((sum, c) => sum + c.valor, 0);
totalCommission.textContent = formatBRL(total);
}
addBtn.addEventListener("click", () => {
const placa = placaInput.value.trim().toUpperCase();
if (!placa) return;
cars.push({
placa,
modelo: modeloInput.value.trim(),
servico,
tipo,
data: dataInput.value || new Date().toISOString().slice(0, 10),
valor: getComissao()
});
placaInput.value = "";
modeloInput.value = "";
renderCarList();
updateSummary();
});
placaInput.addEventListener("input", (e) => {
e.target.value = e.target.value.toUpperCase();
});
themeToggle.addEventListener("click", () => {
const isDark = document.body.classList.contains("dark");
document.body.classList.toggle("dark", !isDark);
document.body.classList.toggle("light", isDark);
themeToggle.textContent = isDark ? " " : " ";
});
updateCommissionDisplay();