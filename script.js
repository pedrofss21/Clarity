/* ── LOGIN SIMPLES ── */
function checkAuth(){
  if(!localStorage.getItem("user")){
    renderLogin();
  } else {
    renderApp();
  }
}

function login(){
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  if(user && pass){
    localStorage.setItem("user", user);
    location.reload();
  } else {
    alert("Preencha os dados");
  }
}

function logout(){
  localStorage.removeItem("user");
  location.reload();
}

/* ── STATE ── */
let recs = JSON.parse(localStorage.getItem("recs")) || [];
let editingId = null;
let dark = true;

/* ── HELPERS ── */
const fmt = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function save(){
  localStorage.setItem("recs", JSON.stringify(recs));
}

function toast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display="block";
  setTimeout(()=>t.style.display="none",2000);
}

/* ── CRUD ── */
function addOrEdit(){
  const plate = document.getElementById("plate").value;
  const date  = document.getElementById("date").value;
  const svc   = document.getElementById("svc").value;
  const vtp   = document.getElementById("vtp").value;

  const commission =
    svc==="Higienização"
      ? 7
      : (vtp==="Novo" ? 5 : 10);

  if(!plate) return toast("Digite a placa");

  if(editingId){
    const r = recs.find(r=>r.id===editingId);
    r.plate=plate;
    r.date=date;
    r.svc=svc;
    r.vtp=vtp;
    r.commission=commission;
    editingId=null;
    toast("Editado!");
  } else {
    recs.unshift({
      id:Date.now(),
      plate, date, svc, vtp, commission
    });
    toast("Adicionado!");
  }

  save();
  renderApp();
}

function editRec(id){
  const r = recs.find(r=>r.id===id);
  editingId = id;

  document.getElementById("plate").value = r.plate;
  document.getElementById("date").value  = r.date;
  document.getElementById("svc").value   = r.svc;
  document.getElementById("vtp").value   = r.vtp;
}

function delRec(id){
  recs = recs.filter(r=>r.id!==id);
  save();
  renderApp();
}

/* ── REPORT ── */
function generateReport(){
  let total=0;

  const rows = recs.map(r=>{
    total+=r.commission;
    return `${r.date} | ${r.plate} | ${r.svc} | ${r.vtp} | ${fmt(r.commission)}`
  }).join("\n");

  const w = window.open("");
  w.document.write(`<pre>${rows}\n\nTOTAL: ${fmt(total)}</pre>`);
  w.print();
}

/* ── UI ── */
function renderLogin(){
  document.getElementById("app").innerHTML = `
    <div class="container">
      <h2>Login</h2>
      <input id="user" placeholder="Usuário">
      <input id="pass" type="password" placeholder="Senha">
      <button class="btn-main" onclick="login()">Entrar</button>
    </div>
  `;
}

function renderApp(){

  document.body.className = dark ? "" : "light";

  document.getElementById("app").innerHTML = `
    <div class="container">

      <button onclick="logout()">Sair</button>
      <button onclick="toggleTheme()">Tema</button>

      <div class="card">
        <input id="date" type="date">
        <input id="plate" placeholder="Placa">

        <select id="svc">
          <option>Higienização</option>
          <option>Polimento</option>
        </select>

        <select id="vtp">
          <option>Novo</option>
          <option>Semi-novo</option>
        </select>

        <button class="btn-main" onclick="addOrEdit()">
          ${editingId ? "Salvar edição" : "Adicionar"}
        </button>
      </div>

      <button class="btn-report" onclick="generateReport()">Gerar relatório</button>

      ${recs.map(r=>`
        <div class="card">
          ${r.plate} - ${r.svc} - ${fmt(r.commission)}
          <button class="btn-edit" onclick="editRec('${r.id}')">Editar</button>
          <button class="btn-del" onclick="delRec('${r.id}')">Excluir</button>
        </div>
      `).join("")}

    </div>
  `;
}

/* ── THEME ── */
function toggleTheme(){
  dark=!dark;
  renderApp();
}

/* ── INIT ── */
checkAuth();