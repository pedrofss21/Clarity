const STORAGE_KEY = "clarity_data";

function carregarDados() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {
    receitas: [],
    despesas: [],
    meta: null
  };
}

function salvarDados(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}