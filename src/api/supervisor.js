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