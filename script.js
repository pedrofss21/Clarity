/* ── DATA ── */
const COMMISSION = {
  Higienização: { Novo: 7, "Semi-novo": 7 },
  Polimento:    { Novo: 5, "Semi-novo": 10 },
};

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

/* ── STATE ── */
const state = {
  svc: null,
  vtp: null,
  recs: JSON.parse(localStorage.getItem("hig_v4")) || [],
  yr: new Date().getFullYear(),
  mo: new Date().getMonth(),
  theme: localStorage.getItem("theme") || "dark",
  editingId: null
};

/* ── HELPERS ── */
const fmt = v => v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const mkKey = (y,m) => `${y}-${String(m+1).padStart(2,"0")}`;
const save = () => localStorage.setItem("hig_v4", JSON.stringify(state.recs));

/* ── THEME ── */
function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", state.theme);
  applyTheme();
  render();
}

/* ── TOAST ── */
function toast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";

  setTimeout(() => t.style.opacity = "1", 10);

  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.style.display = "none", 300);
  }, 2000);
}

/* ── NAV ── */
function prevMonth() {
  if (state.mo === 0) { state.mo = 11; state.yr--; }
  else state.mo--;
  render();
}

function nextMonth() {
  if (state.mo === 11) { state.mo = 0; state.yr++; }
  else state.mo++;
  render();
}

/* ── ADD / UPDATE ── */
function addRec() {
  const plate = document.getElementById("plateInput").value.trim().toUpperCase();
  const dateValue = document.getElementById("dateInput").value;

  if (!state.svc) return toast("Selecione o serviço");
  if (!state.vtp) return toast("Selecione o tipo");
  if (!plate) return toast("Digite a placa");

  const date = dateValue
    ? new Date(dateValue + "T12:00:00").toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  if (state.editingId) {
    const rec = state.recs.find(r => r.id === state.editingId);

    rec.plate = plate;
    rec.svc = state.svc;
    rec.vtp = state.vtp;
    rec.commission = COMMISSION[state.svc][state.vtp];
    rec.date = date;

    state.editingId = null;

    toast("Editado com sucesso");
  } else {
    state.recs.unshift({
      id: Date.now(),
      plate,
      svc: state.svc,
      vtp: state.vtp,
      commission: COMMISSION[state.svc][state.vtp],
      date,
      mk: mkKey(state.yr, state.mo),
    });

    toast("Adicionado com sucesso");
  }

  save();

  document.getElementById("plateInput").value = "";
  document.getElementById("dateInput").value = "";

  render();
}

/* ── EDIT ── */
function editRec(id) {
  const rec = state.recs.find(r => r.id === id);

  state.svc = rec.svc;
  state.vtp = rec.vtp;
  state.editingId = id;

  document.getElementById("plateInput").value = rec.plate;

  render();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* ── DELETE ── */
function delRec(id) {
  state.recs = state.recs.filter(r => r.id !== id);
  save();
  render();
}

/* ── REPORT ── */
function generateReport() {
  const mk = mkKey(state.yr, state.mo);
  const list = state.recs.filter(r => r.mk === mk);
  const total = list.reduce((s, r) => s + r.commission, 0);

  const content = `
RELATÓRIO - ${MONTHS[state.mo]} ${state.yr}

${list.map(r =>
`${r.date} - ${r.plate} - ${r.svc} - ${r.vtp} - ${fmt(r.commission)}`
).join("\n")}

Total: ${fmt(total)}
`;

  const w = window.open("", "_blank");
  w.document.write(`<pre>${content}</pre>`);
  w.print();
}

/* ── RENDER ── */
function render() {

  const mk = mkKey(state.yr, state.mo);
  const list = state.recs.filter(r => r.mk === mk);
  const total = list.reduce((s, r) => s + r.commission, 0);

  const commission =
    state.svc && state.vtp
      ? COMMISSION[state.svc][state.vtp]
      : null;

  const recordsHtml = list.length === 0
    ? `<div class="empty">Sem registros</div>`
    : list.map(r => `
      <div class="rec-item">
        <div>
          <div class="rec-plate">${r.plate}</div>
          <div class="rec-meta">
            ${r.date} • ${r.svc} • ${r.vtp}
          </div>
        </div>

        <div class="rec-right">
          <div class="rec-val">${fmt(r.commission)}</div>

          <button onclick="editRec(${r.id})">✏️</button>
          <button onclick="delRec(${r.id})">✕</button>
        </div>
      </div>
    `).join("");

  document.getElementById("app").innerHTML = `
    <div class="container">

      <div class="header">
        <div>
          <div class="app-label">Detailing Pro</div>
          <div class="title">Comissões</div>
        </div>

        <button onclick="toggleTheme()">
          ${state.theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div class="card">

        <select onchange="state.svc=this.value;render()">
          <option value="">Serviço</option>
          <option ${state.svc==="Higienização"?"selected":""}>Higienização</option>
          <option ${state.svc==="Polimento"?"selected":""}>Polimento</option>
        </select>

        <select onchange="state.vtp=this.value;render()">
          <option value="">Tipo</option>
          <option ${state.vtp==="Novo"?"selected":""}>Novo</option>
          <option ${state.vtp==="Semi-novo"?"selected":""}>Semi-novo</option>
        </select>

        <input type="date" id="dateInput">
        <input type="text" id="plateInput" placeholder="Placa">

        <button onclick="addRec()">
          ${state.editingId ? "Salvar edição" : "Adicionar"}
        </button>

      </div>

      <button onclick="generateReport()">Gerar relatório</button>

      <h3>Total: ${fmt(total)}</h3>

      ${recordsHtml}

    </div>
  `;

  applyTheme();
}

/* ── INIT ── */
applyTheme();
render(); 