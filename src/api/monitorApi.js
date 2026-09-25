import axiosClient from "./axiosClient";

export async function cadastrarMonitor(dados) {
  const response = await axiosClient.post("/monitores", dados);
  return response.data;
}