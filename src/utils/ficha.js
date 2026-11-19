// Funções de apoio do registro de atendimentos do monitor.

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
export function validarRegistro({ aluno, raAluno, atividade, data, inicio, termino }) {
  const erros = {}

  if (aluno.trim().length < 3) erros.aluno = 'Informe o nome do aluno atendido.'

  // RA do aluno é opcional: vazio ou 13 números
  const ra = String(raAluno ?? '').trim()
  if (ra && !/^\d{13}$/.test(ra)) erros.raAluno = 'O RA deve ter 13 números (ou deixe em branco).'

  if (atividade.trim().length < 10) erros.atividade = 'Descreva a atividade realizada (mínimo de 10 caracteres).'
  else if (atividade.trim().length > LIMITE_ATIVIDADE) erros.atividade = `Use no máximo ${LIMITE_ATIVIDADE} caracteres.`

  if (!data) erros.data = 'Informe o dia do atendimento.'
  else if (data > hojeEmIso()) erros.data = 'O atendimento não pode estar no futuro.'

  if (!inicio) erros.inicio = 'Informe o início.'
  if (!termino) erros.termino = 'Informe o término.'
  else if (inicio && termino <= inicio) erros.termino = 'O término precisa ser depois do início.'

  return erros
}


// ---------- períodos (mês de referência e vigência) ----------

function doisDigitos(numero) {
  return String(numero).padStart(2, '0')
}

// "2026-11" -> { inicio: "2026-11-01", fim: "2026-11-30" }
export function intervaloDoMes(anoMes) {
  const [ano, mes] = String(anoMes ?? '').split('-').map(Number)
  if (!ano || !mes) return null

  const ultimoDia = new Date(ano, mes, 0).getDate()
  return { inicio: `${ano}-${doisDigitos(mes)}-01`, fim: `${ano}-${doisDigitos(mes)}-${doisDigitos(ultimoDia)}` }
}

// Mês atual no formato AAAA-MM.
export function mesAtualEmIso() {
  return hojeEmIso().slice(0, 7)
}

// Registros com data dentro do intervalo (inclusive). Sem limite = não filtra por aquele lado.
export function registrosNoIntervalo(registros, inicio, fim) {
  return registros.filter((registro) => (!inicio || registro.data >= inicio) && (!fim || registro.data <= fim))
}

// "2026-11-01", "2026-11-30" -> "01/11/2026 a 30/11/2026"
export function formatarIntervaloBr(inicio, fim) {
  const de = formatarDataBr(inicio)
  const ate = formatarDataBr(fim)
  if (de && ate) return `${de} a ${ate}`
  return de || ate || ''
}