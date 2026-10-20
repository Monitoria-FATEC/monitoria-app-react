// Lê os erros que o back devolve: { status, message, campos: { campo: "mensagem" } }.

// Erros por campo (400 de validação ou 409 de repetido). Vazio se não houver.
export function camposDoErro(error) {
  return error?.response?.data?.campos ?? {}
}

// Mensagem geral do back, ou a padrão quando o servidor não respondeu.
export function mensagemDoErro(error, padrao) {
  return error?.response?.data?.message ?? padrao
}

// Fica só com os campos que existem no formulário.
export function filtrarCampos(campos, permitidos) {
  return Object.fromEntries(
    Object.entries(campos).filter(([nome]) => permitidos.includes(nome))
  )
}