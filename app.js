let data = carregarDados();

function atualizarDashboard() {
  const saldo = calcularSaldo(data);
  document.getElementById("saldo").innerText =
    "R$ " + saldo.toFixed(2);

  document.getElementById("statusMeta").innerText =
    analisarMeta(data);
}

function adicionarReceita() {
  const valor = parseFloat(
    document.getElementById("receitaValor").value
  );
  if (!valor) return;

  data.receitas.push(valor);
  salvarDados(data);
  atualizarDashboard();
}

function adicionarDespesa() {
  const valor = parseFloat(
    document.getElementById("despesaValor").value
  );
  if (!valor) return;

  data.despesas.push(valor);
  salvarDados(data);
  atualizarDashboard();
}

atualizarDashboard();