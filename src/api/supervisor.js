import axiosClient from "./axiosClient";

// Supervisor: lista todos os monitores (ativos e inativos) com conta e agência.
export async function listarMonitores() {
  const response = await axiosClient.get("/monitores/gestao");
  return response.data;
}

// Cadastro manual: cria a conta de acesso e o monitor.
// Devolve { monitor, senhaTemporaria } (a senha só aparece nesta resposta).
export async function criarMonitor({ nome, ra, email, curso }) {
  const response = await axiosClient.post("/monitores/gestao", {
    nome,
    ra,
    email,
    curso,
  });
  return response.data;
}

// Gera outra senha temporária para o monitor. Devolve { email, senhaTemporaria }.
export async function gerarSenhaTemporariaMonitor(id) {
  const response = await axiosClient.post(`/monitores/${id}/senha-temporaria`);
  return response.data;
}

// Edita todos os dados do monitor (cadastro e perfil). O RA não muda.
// Se algo mudar, o monitor recebe um aviso no sistema.
export async function atualizarMonitor(
  id,
  { nome, email, curso, numeroConta, agencia, telefone, linkWhatsapp, linkTeams, compartilharContato, vigenciaInicio, vigenciaFim }
) {
  const response = await axiosClient.put(`/monitores/${id}/gestao`, {
    nome,
    email,
    curso,
    numeroConta,
    agencia,
    telefone,
    linkWhatsapp,
    linkTeams,
    compartilharContato: Boolean(compartilharContato),
    vigenciaInicio: vigenciaInicio || null,
    vigenciaFim: vigenciaFim || null,
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