import { createElement } from 'react'

// Regras do relatório do supervisor: classifica cada inscrição, calcula o resumo
// e gera os arquivos (Excel aqui; o PDF fica em RelatorioPdf.jsx).

// Grupos usados nos filtros e nos cartões do resumo.
export const GRUPOS = [
  { id: 'todas', titulo: 'Todas' },
  { id: 'entregues', titulo: 'Entregues' },
  { id: 'aguardando', titulo: 'Aguardando' },
  { id: 'atrasados', titulo: 'Atrasados' },
  { id: 'devolvidos', titulo: 'Devolvidos' },
]

// "2026-11-02T21:03:47" -> "02/11/2026"
export function formatarData(valor) {
  if (!valor) return '—'
  const [ano, mes, dia] = String(valor).split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

// Hoje no formato AAAA-MM-DD (horário local), para comparar com o prazo de correção.
function hojeIso() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

// Dias de atraso entre o prazo (AAAA-MM-DD) e hoje.
function diasDeAtraso(prazo, hoje) {
  const [a1, m1, d1] = prazo.split('-').map(Number)
  const [a2, m2, d2] = hoje.split('-').map(Number)
  const ms = Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)
  return Math.round(ms / 86400000)
}

// Define a situação de uma inscrição:
//  - entregue: homologada
//  - aguardando: com o supervisor ou em assinatura na Gestão
//  - atrasado: devolvida e o prazo de correção já venceu
//  - devolvido: devolvida e ainda dentro do prazo (ou sem prazo)
export function classificar(inscricao, hoje = hojeIso()) {
  const prazo = inscricao.dataLimiteCorrecao ? String(inscricao.dataLimiteCorrecao).split('T')[0] : null

  switch (inscricao.status) {
    case 'HOMOLOGADA':
      return { grupo: 'entregues', situacao: 'Entregue', atraso: 0 }
    case 'AGUARDANDO_SUPERVISOR':
      return { grupo: 'aguardando', situacao: 'Aguardando supervisor', atraso: 0 }
    case 'AGUARDANDO_GESTAO':
      return { grupo: 'aguardando', situacao: 'Em assinatura (Gestão)', atraso: 0 }
    case 'DEVOLVIDA': {
      if (prazo && prazo < hoje) {
        return { grupo: 'atrasados', situacao: 'Atrasado', atraso: diasDeAtraso(prazo, hoje) }
      }
      return { grupo: 'devolvidos', situacao: 'Devolvido', atraso: 0 }
    }
    default:
      return { grupo: 'outros', situacao: 'Recusada', atraso: 0 }
  }
}

// Monta as linhas do relatório. Inscrições cujo monitor não existe mais ficam de fora.
export function montarLinhas(inscricoes) {
  const hoje = hojeIso()
  let semMonitor = 0

  const linhas = inscricoes
    .filter((inscricao) => {
      if (inscricao.monitor) return true
      semMonitor += 1
      return false
    })
    .map((inscricao) => {
      const { grupo, situacao, atraso } = classificar(inscricao, hoje)
      return {
        id: inscricao.id,
        grupo,
        situacao,
        atraso,
        nome: inscricao.monitor.nome ?? '—',
        ra: inscricao.monitor.ra ?? '—',
        email: inscricao.monitor.email ?? '—',
        curso: inscricao.monitor.curso ?? '—',
        disciplina: inscricao.termo?.disciplina ?? '—',
        enviadoEm: formatarData(inscricao.dataSubmissao),
        prazo: formatarData(inscricao.dataLimiteCorrecao),
        atualizadoEm: formatarData(inscricao.dataAtualizacao),
        justificativa: inscricao.justificativaDevolucao ?? '',
      }
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return { linhas, semMonitor }
}

export function contar(linhas) {
  const total = { todas: linhas.length, entregues: 0, aguardando: 0, atrasados: 0, devolvidos: 0 }
  linhas.forEach((linha) => {
    if (total[linha.grupo] !== undefined) total[linha.grupo] += 1
  })
  return total
}

export function filtrar(linhas, grupo) {
  return grupo === 'todas' ? linhas : linhas.filter((linha) => linha.grupo === grupo)
}

export function nomeDoArquivo(grupo, extensao) {
  const data = hojeIso()
  return `relatorio-monitoria-${grupo}-${data}.${extensao}`
}

// Colunas na ordem em que aparecem no Excel e no PDF.
export const COLUNAS = [
  { chave: 'nome', titulo: 'Monitor' },
  { chave: 'ra', titulo: 'RA' },
  { chave: 'curso', titulo: 'Curso' },
  { chave: 'disciplina', titulo: 'Disciplina' },
  { chave: 'situacao', titulo: 'Situação' },
  { chave: 'enviadoEm', titulo: 'Enviado em' },
  { chave: 'prazo', titulo: 'Prazo de correção' },
  { chave: 'atualizadoEm', titulo: 'Última atualização' },
]

// A biblioteca do Excel é pesada, então só é carregada quando o supervisor clica em exportar.
export async function exportarExcel(linhas, grupo) {
  const XLSX = await import('xlsx')

  const dados = linhas.map((linha) => {
    const registro = {}
    COLUNAS.forEach(({ chave, titulo }) => {
      registro[titulo] = linha[chave]
    })
    registro['Dias de atraso'] = linha.atraso > 0 ? linha.atraso : ''
    registro['Motivo da devolução'] = linha.justificativa
    return registro
  })

  const planilha = XLSX.utils.json_to_sheet(dados)
  planilha['!cols'] = [
    { wch: 32 }, { wch: 16 }, { wch: 38 }, { wch: 28 }, { wch: 24 },
    { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 40 },
  ]

  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, 'Relatório')
  XLSX.writeFile(livro, nomeDoArquivo(grupo, 'xlsx'))
}

// O PDF usa o mesmo @react-pdf/renderer do termo e também é carregado só na hora.
export async function exportarPdf(linhas, grupo, tituloDoGrupo) {
  const [{ pdf }, { default: RelatorioPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/supervisor/RelatorioPdf'),
  ])

  const documento = createElement(RelatorioPdf, {
    linhas,
    titulo: tituloDoGrupo,
    geradoEm: formatarData(hojeIso()),
  })
  const blob = await pdf(documento).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeDoArquivo(grupo, 'pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}