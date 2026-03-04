function calcularSaldo(data) {
  const totalReceitas = data.receitas.reduce((a,b)=>a+b,0);
  const totalDespesas = data.despesas.reduce((a,b)=>a+b,0);
  return totalReceitas - totalDespesas;
}

function analisarMeta(data) {
  if (!data.meta) return "Sem meta";

  const saldo = calcularSaldo(data);
  const necessario = data.meta.valor - saldo;

  if (necessario <= 0) return "🟢 Meta atingida";

  const mesesRestantes = data.meta.meses;
  const precisaPorMes = necessario / mesesRestantes;

  if (precisaPorMes <= saldo * 0.3) return "🟢 Fácil";
  if (precisaPorMes <= saldo * 0.6) return "🟡 Possível";
  if (precisaPorMes <= saldo) return "🟠 Difícil";
  return "🔴 Irreal";
}

function calcularSaude(data){
  const receitas = totalReceitas(data);
  const despesas = totalDespesas(data);

  if(receitas === 0) return 0;

  const taxaPoupanca = (receitas - despesas) / receitas;

  let score = taxaPoupanca * 100;

  if(score > 100) score = 100;
  if(score < 0) score = 0;

  return Math.round(score);
}