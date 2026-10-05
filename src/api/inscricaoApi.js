import axiosClient from "./axiosClient";

// Lista as inscrições com monitor e termo, filtradas por status.
// status: AGUARDANDO_SUPERVISOR | AGUARDANDO_GESTAO | DEVOLVIDA | HOMOLOGADA | RECUSADA
export async function listarInscricoes(status) {
  const response = await axiosClient.get("/inscricoes", {
    params: status ? { status } : {},
  });
  return response.data;
}

// Supervisor aprova: a inscrição vai para a Gestão.
export async function aprovarInscricao(id) {
  const response = await axiosClient.patch(`/inscricoes/${id}/aprovar`);
  return response.data;
}

// Supervisor devolve ao monitor, com a justificativa.
export async function devolverInscricao(id, justificativa) {
  const response = await axiosClient.patch(`/inscricoes/${id}/devolver`, {
    justificativa,
  });
  return response.data;
}

// Monitor envia a inscrição depois de assinar o termo.
export async function criarInscricao({ idMonitor, idTermoCompromisso }) {
  const response = await axiosClient.post("/inscricoes", {
    idMonitor,
    idTermoCompromisso,
  });
  return response.data;
}