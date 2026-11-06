// Funções de apoio da ficha de atendimentos do monitor.

// Data de hoje no formato AAAA-MM-DD, no fuso do navegador.
export function hojeEmIso() {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
}

function paraMinutos(hora) {
  const [horas, minutos] = String(hora ?? '').split(':').map(Number)
  return Number.isFinite(horas) && Number.isFinite(minutos) ? horas * 60 + minutos : NaN
}

export function minutosEntre(inicio, termino) {
  const total = paraMinutos(termino) - paraMinutos(inicio)
  return Number.isFinite(total) && total > 0 ? total : 0
}

// Ex.: 45 -> "45 min", 60 -> "1h", 90 -> "1h30"
export function formatarDuracao(minutos) {
  if (!minutos) return '0 min'
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60

  if (horas === 0) return `${resto} min`
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`
}

// "2026-11-04" -> "04/11/2026"
export function formatarDataBr(data) {
  const [ano, mes, dia] = String(data ?? '').split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : ''
}

export const LIMITE_ATIVIDADE = 500


// Devolve uma mensagem por campo inválido (objeto vazio = tudo certo).
export function validarRegistro({ aluno, atividade, data, inicio, termino }) {
  const erros = {}

  if (aluno.trim().length < 3) erros.aluno = 'Informe o nome do aluno atendido.'

  if (atividade.trim().length < 10) erros.atividade = 'Descreva a atividade realizada (mínimo de 10 caracteres).'
  else if (atividade.trim().length > LIMITE_ATIVIDADE) erros.atividade = `Use no máximo ${LIMITE_ATIVIDADE} caracteres.`

  if (!data) erros.data = 'Informe o dia do atendimento.'
  else if (data > hojeEmIso()) erros.data = 'O atendimento não pode estar no futuro.'

  if (!inicio) erros.inicio = 'Informe o início.'
  if (!termino) erros.termino = 'Informe o término.'
  else if (inicio && termino <= inicio) erros.termino = 'O término precisa ser depois do início.'

  return erros
}
