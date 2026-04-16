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

const fmt = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const mkKey = (y,m)=>`${y}-${String(m+1).padStart(2,"0")}`;

function applyTheme(){
  document.body.classList.toggle("dark", state.theme==="dark");
}

function toggleTheme(){
  state.theme = state.theme==="dark"?"light":"dark";
  localStorage.setItem("theme",state.theme);
  render();
}

function toast(msg){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.style.display="block";
  setTimeout(()=>t.style.display="none",2000);
}

function addRec(){
  const plate=document.getElementById("plateInput").value;
  if(!plate) return toast("Digite a placa");

  state.recs.unshift({
    id:Date.now(),
    plate,
    svc:state.svc,
    vtp:state.vtp,
    commission:COMMISSION[state.svc][state.vtp],
    date:new Date().toLocaleDateString("pt-BR"),
    mk:mkKey(state.yr,state.mo)
  });

  localStorage.setItem("hig_v4",JSON.stringify(state.recs));
  render();
}

function delRec(id){
  state.recs=state.recs.filter(r=>r.id!=id);
  localStorage.setItem("hig_v4",JSON.stringify(state.recs));
  render();
}

function render(){
  const list=state.recs.filter(r=>r.mk===mkKey(state.yr,state.mo));

  document.getElementById("app").innerHTML=`
  <div class="container">

    <h1>Higienizações</h1>

    <button onclick="toggleTheme()">Tema</button>

    <div class="card">
      <button onclick="state.svc='Higienização';render()">Higienização</button>
      <button onclick="state.svc='Polimento';render()">Polimento</button>

      <button onclick="state.vtp='Novo';render()">Novo</button>
      <button onclick="state.vtp='Semi-novo';render()">Semi-novo</button>

      <input id="plateInput" placeholder="Placa">

      <button onclick="addRec()">Adicionar</button>
    </div>

    ${list.map(r=>`
      <div class="item">
        ${r.plate} - ${fmt(r.commission)}
        <button onclick="delRec('${r.id}')">X</button>
      </div>
    `).join("")}

  </div>
  `;
}

applyTheme();
render();