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
  plate: "",
  recs: JSON.parse(localStorage.getItem("hig_v4")) || [],
  yr: new Date().getFullYear(),
  mo: new Date().getMonth(),
};

const fmt = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const mkKey = (y,m) => `${y}-${String(m+1).padStart(2,"0")}`;

function setState(obj) {
  Object.assign(state, obj);
  render();
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(() => t.style.display = "none", 2000);
}

function addRec() {
  if (!state.svc) return toast("Selecione o serviço");
  if (!state.vtp) return toast("Selecione o tipo");
  if (!state.plate) return toast("Digite a placa");

  state.recs.unshift({
    id: Date.now(),
    plate: state.plate.toUpperCase(),
    svc: state.svc,
    vtp: state.vtp,
    commission: COMMISSION[state.svc][state.vtp],
    date: new Date().toLocaleDateString("pt-BR"),
    mk: mkKey(state.yr, state.mo),
  });

  localStorage.setItem("hig_v4", JSON.stringify(state.recs));

  setState({ plate:"", svc:null, vtp:null });
  toast("Veículo adicionado!");
}

function delRec(id) {
  state.recs = state.recs.filter(r => r.id != id);
  localStorage.setItem("hig_v4", JSON.stringify(state.recs));
  render();
}

function prevMo() {
  state.mo--;
  if (state.mo < 0) { state.mo = 11; state.yr--; }
  render();
}

function nextMo() {
  state.mo++;
  if (state.mo > 11) { state.mo = 0; state.yr++; }
  render();
}

function render() {
  const mk = mkKey(state.yr, state.mo);
  const mRecs = state.recs.filter(r => r.mk === mk);
  const total = mRecs.reduce((s,r)=>s+r.commission,0);
  const comm = state.svc && state.vtp ? COMMISSION[state.svc][state.vtp] : null;

  document.getElementById("app").innerHTML = `
    <div class="container">

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

        <input 
          value="${state.plate}"
          oninput="setState({plate:this.value})"
          placeholder="Placa ou Chassi"
        />

        <button class="primary" onclick="addRec()">+ Adicionar</button>

      </div>

      <div class="card">
        <button onclick="prevMo()">‹</button>
        ${MONTHS[state.mo]} ${state.yr}
        <button onclick="nextMo()">›</button>
      </div>

      <div class="stats">
        <div>🚘 ${mRecs.length}</div>
        <div>💰 ${fmt(total)}</div>
      </div>

      ${mRecs.map(r=>`
        <div class="item">
          <div>
            <strong>${r.plate}</strong><br>
            <small>${r.date}</small>
          </div>
          <div>
            ${fmt(r.commission)}
            <button onclick="delRec('${r.id}')">✕</button>
          </div>
        </div>
      `).join("")}

    </div>
  `;
}

render();