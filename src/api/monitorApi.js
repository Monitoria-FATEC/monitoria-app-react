import axiosClient from "./axiosClient";

export async function cadastrarMonitor(dados) {
  const response = await axiosClient.post("/monitores", dados);
  return response.data;
}

export async function enviarTermoCompromisso(dados) {
  const response = await axiosClient.post("/termos-compromisso", dados);
  return response.data;
}