import axios from "axios";

import { limparSessao, obterToken } from "../services/authStorage";

const axiosClient = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const ehRotaDeAuth = (url = "") => url.startsWith("/auth");

// Anexa o token JWT em toda chamada (menos login/cadastro/recuperação).
axiosClient.interceptors.request.use((config) => {
  const token = obterToken();

  if (token && !ehRotaDeAuth(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Token expirado ou inválido: limpa a sessão e manda para o login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !ehRotaDeAuth(error.config?.url)) {
      limparSessao();

      if (window.location.pathname !== "/entrar") {
        window.location.assign("/entrar");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;