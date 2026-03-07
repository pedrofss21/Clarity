function abrirModal(){

document.getElementById("modal").style.display="flex"

}

function salvarTransacao(){

let nome = document.getElementById("nome").value
let valor = Number(document.getElementById("valor").value)
let tipo = document.getElementById("tipo").value

let transacao = {

id: Date.now(),
nome,
valor,
tipo

}

transacoes.push(transacao)

salvarBanco()

atualizarTela()

document.getElementById("modal").style.display="none"

}

function atualizarTela(){

let lista = document.getElementById("listaTransacoes")

lista.innerHTML=""

let receitas = 0
let despesas = 0

transacoes.forEach(t=>{

let div = document.createElement("div")

div.className="item"

div.innerHTML=`
<span>${t.nome}</span>
<span class="${t.tipo}">
R$ ${t.valor}
</span>
`

lista.appendChild(div)

if(t.tipo=="receita"){

receitas += t.valor

}else{

despesas += t.valor

}

})

let saldo = receitas - despesas

document.getElementById("saldo").innerText = saldo.toFixed(2)

document.getElementById("receitas").innerText = receitas.toFixed(2)

document.getElementById("despesas").innerText = despesas.toFixed(2)

atualizarGraficos(receitas,despesas)

}

atualizarTela()