import axiosClient from './axiosClient'

// ---------------------------------------------------------------------------
// Enquanto o back-end não tem as rotas da ficha, USAR_MOCK = true deixa a tela
// funcionando só no front, com dados de exemplo guardados na memória da página.
// Quando as rotas existirem, troque para false: o resto do código não muda.
// ---------------------------------------------------------------------------
export const USAR_MOCK = false

function diaAtras(dias) {
  const data = new Date()
  data.setDate(data.getDate() - dias)
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

let proximoId = 4

const registrosMock = [
  { id: 'r1', aluno: 'João Pereira', atividade: 'Revisão de normalização de tabelas (1FN a 3FN) com exemplos.', data: diaAtras(1), inicio: '14:00', termino: '15:00' },
  { id: 'r2', aluno: 'Maria Oliveira', atividade: 'Consultas com JOIN e GROUP BY; resolução de lista de exercícios.', data: diaAtras(3), inicio: '13:00', termino: '14:30' },
  { id: 'r3', aluno: 'Pedro Santos', atividade: 'Modelagem do diagrama entidade-relacionamento do projeto da disciplina.', data: diaAtras(6), inicio: '16:00', termino: '16:45' },
]

function responder(valor) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(JSON.parse(JSON.stringify(valor))), 250)
  })
}

function falhar(status, message) {
  return Promise.reject({ response: { status, data: { message } } })
}

// GET /monitores/me/atendimentos -> [{ id, aluno, atividade, data, inicio, termino }]
export async function listarRegistros() {
  if (USAR_MOCK) return responder(registrosMock)

  const resposta = await axiosClient.get('/monitores/me/atendimentos')
  return resposta.data
}

// POST /monitores/me/atendimentos  { aluno, atividade, data, inicio, termino }
export async function criarRegistro(dados) {
  if (USAR_MOCK) {
    const registro = { id: `r${proximoId}`, ...dados }
    proximoId += 1
    registrosMock.push(registro)
    return responder(registro)
  }

  const resposta = await axiosClient.post('/monitores/me/atendimentos', dados)
  return resposta.data
}

// PUT /monitores/me/atendimentos/{id}
export async function atualizarRegistro(id, dados) {
  if (USAR_MOCK) {
    const registro = registrosMock.find((item) => item.id === id)
    if (!registro) return falhar(404, 'Registro não encontrado.')

    Object.assign(registro, dados)
    return responder(registro)
  }

  const resposta = await axiosClient.put(`/monitores/me/atendimentos/${id}`, dados)
  return resposta.data
}

// DELETE /monitores/me/atendimentos/{id}
export async function excluirRegistro(id) {
  if (USAR_MOCK) {
    const posicao = registrosMock.findIndex((item) => item.id === id)
    if (posicao === -1) return falhar(404, 'Registro não encontrado.')

    registrosMock.splice(posicao, 1)
    return responder({})
  }

  await axiosClient.delete(`/monitores/me/atendimentos/${id}`)
  return {}
}
