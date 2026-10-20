const CHAVE_SESSAO = 'monitoria.auth'
const CHAVE_CADASTRO_PENDENTE = 'monitoria.cadastroPendente'

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

// Dados do aluno (nome, RA, e-mail, curso) guardados enquanto o e-mail não foi confirmado.
// A senha NUNCA entra aqui.
export function salvarCadastroPendente(dados) {
  try {
    localStorage.setItem(CHAVE_CADASTRO_PENDENTE, JSON.stringify(dados))
  } catch {
    // sem armazenamento disponível: o aluno perde só o atalho depois da confirmação
  }
}

// Só devolve os dados se forem do mesmo e-mail que está confirmando.
export function lerCadastroPendente(email) {
  try {
    const bruto = localStorage.getItem(CHAVE_CADASTRO_PENDENTE)
    const dados = bruto ? JSON.parse(bruto) : null

    if (dados && String(dados.email).toLowerCase() === String(email).trim().toLowerCase()) {
      return dados
    }

    return null
  } catch {
    return null
  }
}

export function limparCadastroPendente() {
  localStorage.removeItem(CHAVE_CADASTRO_PENDENTE)
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
      return '/monitor'
    default:
      return '/'
  }
}