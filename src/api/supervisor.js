import axiosClient from "./axiosClient";

// Supervisor: lista todos os monitores (ativos e inativos) com conta e agência.
export async function listarMonitores() {
  const response = await axiosClient.get("/monitores/gestao");
  return response.data;
}

// Edita nome, e-mail, curso, conta e agência. O RA não muda.
export async function atualizarMonitor(id, { nome, email, curso, numeroConta, agencia }) {
  const response = await axiosClient.put(`/monitores/${id}/gestao`, {
    nome,
    email,
    curso,
    numeroConta,
    agencia,
  });
  return response.data;
}

// Ativa ou desativa o perfil (não apaga o monitor).
export async function alterarAtivoMonitor(id, ativo) {
  const response = await axiosClient.patch(`/monitores/${id}/ativo`, { ativo });
  return response.data;
}

// Mostra o que a exclusão vai apagar (não apaga nada): conta de acesso, termos e inscrições.
export async function resumirExclusaoMonitor(id) {
  const response = await axiosClient.get(`/monitores/${id}/exclusao`);
  return response.data;
}

// Exclusão definitiva do monitor, da conta de acesso, dos termos e das inscrições.
export async function excluirMonitor(id) {
  const response = await axiosClient.delete(`/monitores/${id}`);
  return response.data;
}