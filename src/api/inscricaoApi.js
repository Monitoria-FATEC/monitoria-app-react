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
// dataLimite (opcional, "AAAA-MM-DD"): prazo para o monitor corrigir.
export async function devolverInscricao(id, justificativa, dataLimite) {
  const response = await axiosClient.patch(`/inscricoes/${id}/devolver`, {
    justificativa,
    ...(dataLimite ? { dataLimite } : {}),
  });
  return response.data;
}

// Gestão: marca que o PDF foi baixado e enviado para assinatura
// (para o aluno continua AGUARDANDO_GESTAO).
export async function enviarInscricaoParaAssinatura(id) {
  const response = await axiosClient.patch(`/inscricoes/${id}/enviar-assinatura`);
  return response.data;
}

// Gestão: homologa depois de assinado fora do sistema.
export async function homologarInscricao(id) {
  const response = await axiosClient.patch(`/inscricoes/${id}/homologar`);
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