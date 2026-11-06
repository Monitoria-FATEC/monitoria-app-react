import axiosClient from './axiosClient'
import { ordenarHorarios } from '../utils/horarios'

// ---------------------------------------------------------------------------
// Enquanto o back-end não tem as rotas dos horários, USAR_MOCK = true deixa a
// tela funcionando só no front, com dados de exemplo guardados na memória da
// página. Quando as rotas existirem, troque para false: o resto não muda.
// ---------------------------------------------------------------------------
export const USAR_MOCK = false

// No mock, o monitor logado é sempre o m1.
const MONITOR_LOGADO = 'm1'

const monitoresMock = {
  m1: { nome: 'Ana Souza', curso: 'Desenvolvimento de Software Multiplataforma', disciplina: 'Banco de Dados', professor: 'Prof. Carlos Ribeiro', linkWhatsapp: 'https://wa.me/5511999990000', linkTeams: 'https://teams.microsoft.com/l/channel/exemplo' },
  m2: { nome: 'Bruno Lima', curso: 'Desenvolvimento de Software Multiplataforma', disciplina: 'Algoritmos e Lógica', professor: 'Profa. Marina Costa', linkWhatsapp: 'https://chat.whatsapp.com/exemplo', linkTeams: '' },
  m3: { nome: 'Carla Mendes', curso: 'Desenvolvimento de Software Multiplataforma', disciplina: 'Matemática Discreta', professor: 'Prof. Paulo Nogueira' },
  m4: { nome: 'Diego Alves', curso: 'Desenvolvimento de Software Multiplataforma', disciplina: 'Engenharia de Software', professor: 'Profa. Helena Prado' },
}

let proximoId = 8

const horariosMock = [
  { id: 'h1', monitorId: 'm1', diaSemana: 1, inicio: '14:00', fim: '17:00', local: 'Biblioteca, mesa de estudos 3' },
  { id: 'h2', monitorId: 'm1', diaSemana: 3, inicio: '13:00', fim: '15:00', local: 'Biblioteca, mesa de estudos 3' },
  { id: 'h3', monitorId: 'm2', diaSemana: 2, inicio: '18:30', fim: '20:30', local: 'Sala de monitoria' },
  { id: 'h4', monitorId: 'm2', diaSemana: 4, inicio: '18:30', fim: '20:30', local: 'Sala de monitoria' },
  { id: 'h5', monitorId: 'm3', diaSemana: 4, inicio: '12:00', fim: '13:00', local: 'Laboratório 2' },
  { id: 'h6', monitorId: 'm4', diaSemana: 1, inicio: '15:00', fim: '17:00', local: 'Sala de monitoria' },
  { id: 'h7', monitorId: 'm4', diaSemana: 5, inicio: '15:00', fim: '17:00', local: 'Sala de monitoria' },
]

// No mock, vigência fixa por monitor (m3 já encerrada, para mostrar o efeito).
const vigenciasMock = {
  m1: { vigenciaInicio: '2026-08-01', vigenciaFim: '2026-12-15' },
  m2: { vigenciaInicio: '2026-08-01', vigenciaFim: '2026-12-15' },
  m3: { vigenciaInicio: '2026-02-01', vigenciaFim: '2026-06-30' },
  m4: { vigenciaInicio: '2026-08-01', vigenciaFim: '2026-12-15' },
}

function estaVigente(monitorId) {
  const { vigenciaInicio, vigenciaFim } = vigenciasMock[monitorId]
  const hoje = new Date().toISOString().slice(0, 10)
  return hoje >= vigenciaInicio && hoje <= vigenciaFim
}

function responder(valor) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(JSON.parse(JSON.stringify(valor))), 250)
  })
}

function falhar(status, message) {
  return Promise.reject({ response: { status, data: { message } } })
}

// ---------- monitor (precisa de login) ----------

// GET /monitores/me/horarios -> [{ id, diaSemana, inicio, fim, local }]   (diaSemana: 1 = segunda ... 6 = sábado)
export async function listarMeusHorarios() {
  if (USAR_MOCK) {
    return responder(horariosMock.filter((h) => h.monitorId === MONITOR_LOGADO).sort(ordenarHorarios))
  }

  const resposta = await axiosClient.get('/monitores/me/horarios')
  return resposta.data
}

// POST /monitores/me/horarios  { diaSemana, inicio, fim, local }  -> 409 se já houver horário no mesmo intervalo
export async function adicionarHorario(dados) {
  if (USAR_MOCK) {
    const diaSemana = Number(dados.diaSemana)
    const conflita = horariosMock.some(
      (h) => h.monitorId === MONITOR_LOGADO && h.diaSemana === diaSemana && dados.inicio < h.fim && dados.fim > h.inicio,
    )
    if (conflita) return falhar(409, 'Já existe um horário seu neste intervalo.')

    const horario = { id: `h${proximoId}`, monitorId: MONITOR_LOGADO, ...dados, diaSemana }
    proximoId += 1
    horariosMock.push(horario)
    return responder(horario)
  }

  const resposta = await axiosClient.post('/monitores/me/horarios', { ...dados, diaSemana: Number(dados.diaSemana) })
  return resposta.data
}

// PUT /monitores/me/horarios/{id}  { diaSemana, inicio, fim, local }  -> 409 se conflitar com outro horário seu
export async function atualizarHorario(horarioId, dados) {
  if (USAR_MOCK) {
    const horario = horariosMock.find((h) => h.id === horarioId && h.monitorId === MONITOR_LOGADO)
    if (!horario) return falhar(404, 'Horário não encontrado.')

    const diaSemana = Number(dados.diaSemana)
    const conflita = horariosMock.some(
      (h) =>
        h.id !== horarioId && h.monitorId === MONITOR_LOGADO && h.diaSemana === diaSemana &&
        dados.inicio < h.fim && dados.fim > h.inicio,
    )
    if (conflita) return falhar(409, 'Já existe um horário seu neste intervalo.')

    Object.assign(horario, dados, { diaSemana })
    return responder(horario)
  }

  const resposta = await axiosClient.put(`/monitores/me/horarios/${horarioId}`, { ...dados, diaSemana: Number(dados.diaSemana) })
  return resposta.data
}

// DELETE /monitores/me/horarios/{id}
export async function removerHorario(horarioId) {
  if (USAR_MOCK) {
    const posicao = horariosMock.findIndex((h) => h.id === horarioId && h.monitorId === MONITOR_LOGADO)
    if (posicao === -1) return falhar(404, 'Horário não encontrado.')

    horariosMock.splice(posicao, 1)
    return responder({})
  }

  await axiosClient.delete(`/monitores/me/horarios/${horarioId}`)
  return {}
}

// ---------- supervisor ----------

// GET /horarios -> horários de todos os monitores ativos, já com os dados do monitor:
// [{ id, monitorId, nome, curso, disciplina, professor, diaSemana, inicio, fim, local, vigenciaInicio, vigenciaFim, vigente }]
export async function listarHorariosDosMonitores() {
  if (USAR_MOCK) {
    return responder(
      horariosMock
        .map((h) => ({ ...h, ...monitoresMock[h.monitorId], ...vigenciasMock[h.monitorId], vigente: estaVigente(h.monitorId) }))
        .sort(ordenarHorarios),
    )
  }

  const resposta = await axiosClient.get('/horarios')
  return resposta.data
}

// ---------- público (aluno, sem login) ----------

// GET /horarios/publico -> só o que o aluno precisa para achar o atendimento (sem e-mail, telefone ou ids):
// [{ nome, curso, disciplina, professor, diaSemana, inicio, fim, local, linkWhatsapp, linkTeams }]  (links podem ser null)
export async function listarHorariosPublicos() {
  if (USAR_MOCK) {
    const lista = (await listarHorariosDosMonitores()).filter((h) => h.vigente)
    return lista.map((h) => ({
      nome: h.nome,
      curso: h.curso,
      disciplina: h.disciplina,
      professor: h.professor,
      diaSemana: h.diaSemana,
      inicio: h.inicio,
      fim: h.fim,
      local: h.local,
      linkWhatsapp: h.linkWhatsapp || null,
      linkTeams: h.linkTeams || null,
    }))
  }

  const resposta = await axiosClient.get('/horarios/publico')
  return resposta.data
}
