import axiosClient from "./axiosClient";

// Primeiro acesso, passo 1: envia o código de 6 dígitos para o e-mail do usuário logado.
export async function enviarCodigoTrocaSenha() {
  const response = await axiosClient.post("/conta/senha/codigo");
  return response.data;
}

// Primeiro acesso, passo 2: nova senha + código recebido por e-mail.
export async function trocarSenhaTemporaria({ novaSenha, codigo }) {
  const response = await axiosClient.put("/conta/senha", { novaSenha, codigo });
  return response.data;
}