import axiosClient from "./axiosClient";

// Supervisor: monitores que já enviaram conta/agência.
// status opcional: AGUARDANDO | APROVADO | DEVOLVIDO
export async function listarContasAgencia(status) {
  const response = await axiosClient.get("/monitores/conta-agencia", {
    params: status ? { status } : {},
  });
  return response.data;
}

export async function aprovarContaAgencia(idMonitor) {
  const response = await axiosClient.patch(
    `/monitores/${idMonitor}/conta-agencia/aprovar`
  );
  return response.data;
}

// dataLimite opcional, "AAAA-MM-DD".
export async function devolverContaAgencia(idMonitor, justificativa, dataLimite) {
  const response = await axiosClient.patch(
    `/monitores/${idMonitor}/conta-agencia/devolver`,
    {
      justificativa,
      ...(dataLimite ? { dataLimite } : {}),
    }
  );
  return response.data;
}