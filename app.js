const COMMISSION = {
  Higienização: { Novo: 7, "Semi-novo": 7 },
  Polimento: { Novo: 5, "Semi-novo": 10 },
};

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const state = {
  svc: null,
  vtp: null,
  recs: JSON.parse(localStorage.getItem("hig_v4")) || [],
  yr: new Date().getFullYear(),
  mo: new Date().getMonth(),
  theme: localStorage.getItem("theme") || "dark"
};

const fmt = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const mkKey = (y,m) => `${y}-${String(m+1).padStart(2,"0")}`;

function setState(obj) {
  Object.assign(state, obj);
  render();
}

function applyTheme() {
  document.body.classList.toggle("light", state.theme === "light");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", state.theme);
  applyTheme();
  render();
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(() => t.style.display = "none", 2000);
}

// ADD
function addRec() {
  const plateInput = document.getElementById("plateInput");
  const dateInput = document.getElementById("dateInput");

  const plate = plateInput.value;

  if (!state.svc) return toast("Selecione o serviço");
  if (!state.vtp) return toast("Selecione o tipo");
  if (!plate) return toast("Digite a placa");

  let dateValue = dateInput.value;
  if (!dateValue) {
    dateValue = new Date().toLocaleDateString("pt-BR");
  } else {
    dateValue = new Date(dateValue).toLocaleDateString("pt-BR");
  }

  state.recs.unshift({
    id: Date.now(),
    plate: plate.toUpperCase(),
    svc: state.svc,
    vtp: state.vtp,
    commission: COMMISSION[state.svc][state.vtp],
    date: dateValue,
    mk: mkKey(state.yr, state.mo),
  });

  localStorage.setItem("hig_v4", JSON.stringify(state.recs));

  plateInput.value = "";
  dateInput.value = "";

  setState({ svc:null, vtp:null });
  toast("Veículo adicionado!");
}

// DELETE
function delRec(id) {
  state.recs = state.recs.filter(r => r.id != id);
  localStorage.setItem("hig_v4", JSON.stringify(state.recs));
  render();
}

// EDIT
function editRec(id) {
  const r = state.recs.find(x => x.id == id);

  const plate = prompt("Placa:", r.plate);
  if (!plate) return;

  const svc = prompt("Serviço (Higienização/Polimento):", r.svc);
  if (!svc) return;

  const vtp = prompt("Tipo (Novo/Semi-novo):", r.vtp);
  if (!vtp) return;

  r.plate = plate.toUpperCase();
  r.svc = svc;
  r.vtp = vtp;
  r.commission = COMMISSION[svc][vtp];

  localStorage.setItem("hig_v4", JSON.stringify(state.recs));
  render();
  toast("Editado!");
}

// PDF
function exportPDF() {
  const mk = mkKey(state.yr, state.mo);
  const mRecs = state.recs.filter(r => r.mk === mk);

  if (!mRecs.length) return toast("Sem registros");

  const total = mRecs.reduce((s,r)=>s+r.commission,0);

  const rows = mRecs.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${r.svc}</td>
      <td>${r.vtp}</td>
      <td>${r.plate}</td>
      <td>${fmt(r.commission)}</td>
    </tr>
  `).join("");

  const html = `
    <html>
    <body>
      <h2>${MONTHS[state.mo]} ${state.yr}</h2>
      <table border="1" style="width:100%;border-collapse:collapse">
        <tr>
          <th>Data</th><th>Serviço</th><th>Tipo</th><th>Placa</th><th>Valor</th>
        </tr>
        ${rows}
      </table>
      <h3>Total: ${fmt(total)}</h3>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.print();
}

// RENDER
function render() {
  const mk = mkKey(state.yr, state.mo);
  const mRecs = state.recs.filter(r => r.mk === mk);
  const total = mRecs.reduce((s,r)=>s+r.commission,0);
  const comm = state.svc && state.vtp ? COMMISSION[state.svc][state.vtp] : null;

  document.getElementById("app").innerHTML = `
    <div class="container">

      <button onclick="toggleTheme()">
        ${state.theme === "dark" ? "☀️ Claro" : "🌙 Escuro"}
      </button>

      <div class="title">Higienizações</div>

      <div class="card">

        <div class="row">
          ${["Higienização","Polimento"].map(s=>`
            <button class="${state.svc===s?"active":""}"
              onclick="setState({svc:'${state.svc===s?"":s}'})">${s}</button>
          `).join("")}
        </div>

        <div class="row" style="margin-top:10px">
          ${["Novo","Semi-novo"].map(t=>`
            <button class="${state.vtp===t?"active":""}"
              onclick="setState({vtp:'${state.vtp===t?"":t}'})">${t}</button>
          `).join("")}
        </div>

        <div style="margin-top:10px">
          Comissão: ${comm ? fmt(comm) : "R$ —"}
        </div>

        <input type="date" id="dateInput">
        <input id="plateInput" placeholder="Placa ou Chassi">

        <button class="primary" onclick="addRec()">+ Adicionar</button>

      </div>

      <div class="card">
        ${MONTHS[state.mo]} ${state.yr}
      </div>

      <div class="stats">
        <div>🚘 ${mRecs.length}</div>
        <div>💰 ${fmt(total)}</div>
      </div>

      <button class="primary" onclick="exportPDF()">📄 Gerar Relatório</button>

      ${mRecs.map(r=>`
        <div class="item">
          <div>
            <strong>${r.plate}</strong><br>
            <small>${r.date} · ${r.svc} · ${r.vtp}</small>
          </div>
          <div>
            ${fmt(r.commission)}
            <button onclick="editRec('${r.id}')">✏️</button>
            <button onclick="delRec('${r.id}')">✕</button>
          </div>
        </div>
      `).join("")}

    </div>
  `;
}

applyTheme();
render();