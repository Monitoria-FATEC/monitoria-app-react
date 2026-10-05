const CHAVE_SESSAO = 'monitoria.auth'

export function salvarSessao({ token, usuario }) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ token, usuario }))
}

export function lerSessao() {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function obterToken() {
  return lerSessao()?.token ?? null
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_SESSAO)
}

// Para onde cada perfil vai depois do login.
// Atualize quando as telas de Gestão e Monitor existirem.
export function rotaInicialPorPerfil(role) {
  switch (role) {
    case 'SUPERVISOR':
    case 'ADMIN':
      return '/supervisor'
    case 'GESTAO':
    case 'MONITOR':
    default:
      return '/'
  }
}