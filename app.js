const COMMISSION = {
  Higienização: { Novo: 7, "Semi-novo": 7 },
  Polimento: { Novo: 5, "Semi-novo": 10 },
};

let service = null;
let type = null;

const load = () => {
  try {
    return JSON.parse(localStorage.getItem("data")) || [];
  } catch {
    return [];
  }
};

let records = load();

function save() {
  localStorage.setItem("data", JSON.stringify(records));
}

function setService(s) {
  service = s;
}

function setType(t) {
  type = t;
}

function addRecord() {
  const plate = document.getElementById("plate").value;

  if (!service || !type || !plate) {
    alert("Preencha tudo");
    return;
  }

  records.unshift({
    id: Date.now(),
    service,
    type,
    plate,
    commission: COMMISSION[service][type],
    date: new Date().toLocaleDateString("pt-BR"),
  });

  save();
  document.getElementById("plate").value = "";
  render();
}

function deleteRecord(id) {
  records = records.filter(r => r.id !== id);
  save();
  render();
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  let total = 0;

  records.forEach(r => {
    total += r.commission;

    const div = document.createElement("div");
    div.className = "record";

    div.innerHTML = `
      <div>
        <strong>${r.plate}</strong><br/>
        ${r.service} - ${r.type}
      </div>
      <div>
        R$ ${r.commission}
        <button class="delete" onclick="deleteRecord(${r.id})">X</button>
      </div>
    `;

    list.appendChild(div);
  });

  document.getElementById("totalCars").innerText = `${records.length} veículos`;
  document.getElementById("totalComm").innerText = 
    total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function exportHTML() {
  let rows = records.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${r.service}</td>
      <td>${r.type}</td>
      <td>${r.plate}</td>
      <td>R$ ${r.commission}</td>
    </tr>
  `).join("");

  const html = `
    <html>
    <body>
      <h1>Relatório</h1>
      <table border="1">
        <tr>
          <th>Data</th>
          <th>Serviço</th>
          <th>Tipo</th>
          <th>Placa</th>
          <th>Comissão</th>
        </tr>
        ${rows}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "relatorio.html";
  a.click();
}

render();