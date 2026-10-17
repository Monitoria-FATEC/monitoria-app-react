import axiosClient from "./axiosClient";

export async function cadastrarMonitor(dados) {
  const response = await axiosClient.post("/monitores", dados);
  return response.data;
}

export async function enviarTermoCompromisso(dados) {
  const response = await axiosClient.post("/termos-compromisso", dados);
  return response.data;
}

export async function autenticarMonitor(dados) {
  const response = await axiosClient.post("/auth/login", dados);
  return response.data;
}

// Recuperação de senha (rotas públicas em /auth).
export async function solicitarRecuperacaoSenha({ email }) {
  const response = await axiosClient.post("/auth/esqueci-senha", { email });
  return response.data;
}

export async function verificarCodigoRecuperacao({ email, codigo }) {
  const response = await axiosClient.post("/auth/esqueci-senha/verificar", {
    email,
    codigo,
  });
  return response.data;
}

export async function redefinirSenha({ email, codigo, novaSenha }) {
  const response = await axiosClient.post("/auth/esqueci-senha/redefinir", {
    email,
    codigo,
    novaSenha,
  });
  return response.data;
}

// Cria a conta de acesso (e-mail + senha). Perfil inicial: MONITOR.
export async function cadastrarConta({ nome, email, senha }) {
  const response = await axiosClient.post("/auth/cadastro", {
    nome,
    email,
    senha,
  });
  return response.data;
}

export async function buscarDashboardMonitor() {
  const response = await axiosClient.get('/monitores/me/dashboard')
  return response.data
}

export async function salvarContaAgencia(dados) {
  const response = await axiosClient.put('/monitores/me/conta-agencia', dados)
  return response.data
}

export async function salvarPerfilMonitor(dados) {
  const response = await axiosClient.put('/monitores/me/perfil', dados)
  return response.data
}

export async function desativarPerfilMonitor() {
  await axiosClient.patch('/monitores/me/desativar')
}

export async function atualizarTermoCompromisso(id, dados) {
  const response = await axiosClient.put(`/termos-compromisso/${id}`, dados)
  return response.data
}