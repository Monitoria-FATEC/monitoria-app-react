// Funções de apoio dos horários de atendimento dos monitores (agenda semanal).

// 1 = segunda ... 6 = sábado
export const DIAS_SEMANA = [
  { valor: 1, rotulo: 'Segunda-feira' },
  { valor: 2, rotulo: 'Terça-feira' },
  { valor: 3, rotulo: 'Quarta-feira' },
  { valor: 4, rotulo: 'Quinta-feira' },
  { valor: 5, rotulo: 'Sexta-feira' },
  { valor: 6, rotulo: 'Sábado' },
]

export function rotuloDia(valor) {
  return DIAS_SEMANA.find((dia) => dia.valor === Number(valor))?.rotulo ?? ''
}

export function formatarIntervalo(horario) {
  return `${horario.inicio} às ${horario.fim}`
}

// Dia da semana primeiro, depois o horário de início.
export function ordenarHorarios(a, b) {
  return a.diaSemana - b.diaSemana || a.inicio.localeCompare(b.inicio)
}

// Agrupa por dia da semana, só os dias que têm horário: [{ valor, rotulo, horarios }]
export function agruparPorDia(horarios) {
  const ordenados = [...horarios].sort(ordenarHorarios)

  return DIAS_SEMANA.map((dia) => ({
    ...dia,
    horarios: ordenados.filter((horario) => horario.diaSemana === dia.valor),
  })).filter((dia) => dia.horarios.length > 0)
}

// Devolve uma mensagem por campo inválido (objeto vazio = tudo certo).
// "existentes" são os horários que o monitor já publicou, para não cadastrar dois no mesmo intervalo.
// "ignorarId" é o horário que está sendo editado (ele não conflita consigo mesmo).
export function validarHorario({ diaSemana, inicio, fim, local }, existentes = [], ignorarId = null) {
  const erros = {}

  if (!diaSemana) erros.diaSemana = 'Escolha o dia da semana.'
  if (!inicio) erros.inicio = 'Informe o início.'
  if (!fim) erros.fim = 'Informe o fim.'
  else if (inicio && fim <= inicio) erros.fim = 'O fim precisa ser depois do início.'

  if (!local.trim()) erros.local = 'Informe o local do atendimento.'

  if (!erros.diaSemana && !erros.inicio && !erros.fim) {
    const conflita = existentes.some(
      (horario) => horario.id !== ignorarId && horario.diaSemana === Number(diaSemana) && inicio < horario.fim && fim > horario.inicio,
    )
    if (conflita) erros.fim = 'Já existe um horário seu neste intervalo.'
  }

  return erros
}

export function dataDeHojeBr() {
  const agora = new Date()
  const dia = String(agora.getDate()).padStart(2, '0')
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${agora.getFullYear()}`
}
