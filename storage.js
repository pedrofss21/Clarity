let transacoes = JSON.parse(localStorage.getItem("transacoes")) || []

function salvarBanco(){

localStorage.setItem("transacoes", JSON.stringify(transacoes))

}