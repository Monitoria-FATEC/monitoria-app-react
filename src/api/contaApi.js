import axiosClient from "./axiosClient";

// Primeiro acesso com senha temporária: o usuário logado define a própria senha.
export async function trocarSenhaTemporaria(novaSenha) {
  const response = await axiosClient.put("/conta/senha", { novaSenha });
  return response.data;
}