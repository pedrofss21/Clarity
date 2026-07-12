// ===========================
// Tabela de preços
// ===========================

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

// ===========================
// Estado da aplicação
// ===========================

let servico = "Higienização";
let tipo = "Semi-novo";

let cars = JSON.parse(localStorage.getItem("cars")) || [];

// ===========================
// Elementos
// ===========================

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

// ===========================
// Data atual
// ===========================

dataInput.valueAsDate = new Date();

// ===========================
// Funções
// ===========================

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
  [...control.children].forEach(btn => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
}

function salvar() {
  localStorage.setItem("cars", JSON.stringify(cars));
}

function renderCarList() {

  carList.innerHTML = "";

  cars.forEach((car) => {

    const item = document.createElement("div");
    item.className = "car-item";

    const data = new Date(car.data + "T00:00:00")
      .toLocaleDateString("pt-BR");

    item.innerHTML = `
      <div>
        <div class="info-title">
          ${car.placa}${car.modelo ? " • " + car.modelo : ""}
        </div>

        <div class="info-sub">
          ${car.servico} • ${car.tipo} • ${data}
        </div>
      </div>

      <div class="value">
        ${formatBRL(car.valor)}
      </div>
    `;

    carList.appendChild(item);

  });

}

function updateSummary() {

  totalCars.textContent = cars.length;

  const total = cars.reduce((soma, carro) => soma + carro.valor, 0);

  totalCommission.textContent = formatBRL(total);

}

// ===========================
// Eventos
// ===========================

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

  if (placa === "") {
    alert("Digite a placa do veículo.");
    return;
  }

  cars.push({

    placa,

    modelo: modeloInput.value.trim(),

    servico,

    tipo,

    data: dataInput.value || new Date().toISOString().slice(0,10),

    valor: getComissao()

  });

  placaInput.value = "";
  modeloInput.value = "";

  salvar();

  renderCarList();

  updateSummary();

});

placaInput.addEventListener("input", () => {

  placaInput.value = placaInput.value.toUpperCase();

});

themeToggle.addEventListener("click", () => {

  const dark = document.body.classList.contains("dark");

  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");

  themeToggle.textContent = dark ? "☀️" : "🌙";

});

// ===========================
// Inicialização
// ===========================

updateCommissionDisplay();
renderCarList();
updateSummary();