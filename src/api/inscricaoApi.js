import axiosClient from "./axiosClient";

// Lista as inscrições com monitor e termo, filtradas por status.
// status: AGUARDANDO_SUPERVISOR | AGUARDANDO_GESTAO | DEVOLVIDA | HOMOLOGADA | RECUSADA
export async function listarInscricoes(status) {
  const response = await axiosClient.get("/inscricoes", {
    params: status ? { status } : {},
  });
  return response.data;
}

// Supervisor aprova a ficha: ela passa para a fase de assinatura da Gestão
// (AGUARDANDO_GESTAO, aba "Em assinatura").
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

// Supervisor marca que enviou o PDF do termo à Gestão (por e-mail, fora do sistema).
// Para o aluno continua AGUARDANDO_GESTAO.
export async function enviarInscricaoParaAssinatura(id) {
  const response = await axiosClient.patch(`/inscricoes/${id}/enviar-assinatura`);
  return response.data;
}

// Supervisor homologa depois que a Gestão assinou fora do sistema.
// Libera o envio de conta e agência para o monitor.
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