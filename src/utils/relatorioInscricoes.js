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

// Colunas do Excel: as mesmas do PDF, mais o atraso e o motivo da devolução. Largura em caracteres.
const COLUNAS_EXCEL = [
  ...COLUNAS.map((coluna) => ({ ...coluna, largura: 0 })),
  { chave: 'atraso', titulo: 'Dias de atraso', largura: 0 },
  { chave: 'justificativa', titulo: 'Motivo da devolução', largura: 0 },
]
const LARGURAS_EXCEL = [30, 16, 36, 26, 24, 14, 18, 20, 14, 44]

const VERDE = 'FF315C50'
const VERDE_CLARO = 'FFE9F0E5'
const BORDA = 'FFD5E2D2'
const TEXTO = 'FF2E4039'

function bordaFina(cor = BORDA) {
  const lado = { style: 'thin', color: { argb: cor } }
  return { top: lado, left: lado, bottom: lado, right: lado }
}

// Monta a planilha com o mesmo visual do PDF: título, resumo, tabela com cabeçalho,
// linhas zebradas e o total no fim. Recebe o ExcelJS para poder ser testada sem o navegador.
export function montarPlanilhaRelatorio(ExcelJS, linhas, tituloDoGrupo, geradoEm) {
  const livro = new ExcelJS.Workbook()
  livro.creator = 'Sistema de Monitoria e Frequência Acadêmica'
  const aba = livro.addWorksheet('Relatório', {
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ showGridLines: false }],
  })

  const ultima = COLUNAS_EXCEL.length
  LARGURAS_EXCEL.forEach((largura, indice) => {
    aba.getColumn(indice + 1).width = largura
  })

  // título
  aba.mergeCells(1, 1, 1, ultima)
  const titulo = aba.getCell(1, 1)
  titulo.value = `Relatório de monitoria — ${tituloDoGrupo}`
  titulo.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE } }
  titulo.alignment = { horizontal: 'center', vertical: 'middle' }
  aba.getRow(1).height = 30

  // subtítulo
  aba.mergeCells(2, 1, 2, ultima)
  const subtitulo = aba.getCell(2, 1)
  subtitulo.value = `Fatec Zona Leste · gerado em ${geradoEm} · ${linhas.length} ${linhas.length === 1 ? 'registro' : 'registros'}`
  subtitulo.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF68766E' } }
  subtitulo.alignment = { horizontal: 'center', vertical: 'middle' }
  aba.getRow(2).height = 20

  // cabeçalho da tabela
  const linhaCabecalho = 4
  const cabecalho = aba.getRow(linhaCabecalho)
  COLUNAS_EXCEL.forEach((coluna, indice) => {
    const celula = cabecalho.getCell(indice + 1)
    celula.value = coluna.titulo
    celula.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE } }
    celula.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    celula.border = bordaFina(VERDE)
  })
  cabecalho.height = 24

  // linhas
  linhas.forEach((linha, indice) => {
    const excel = aba.getRow(linhaCabecalho + 1 + indice)
    COLUNAS_EXCEL.forEach((coluna, posicao) => {
      const celula = excel.getCell(posicao + 1)
      const valor = coluna.chave === 'atraso' ? (linha.atraso > 0 ? linha.atraso : '') : linha[coluna.chave]
      celula.value = valor
      celula.font = { name: 'Calibri', size: 10, color: { argb: TEXTO }, bold: coluna.chave === 'nome' }
      celula.border = bordaFina()
      celula.alignment = {
        vertical: 'middle',
        wrapText: true,
        horizontal: ['ra', 'enviadoEm', 'prazo', 'atualizadoEm', 'atraso'].includes(coluna.chave) ? 'center' : 'left',
      }
      if (indice % 2 === 1) {
        celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F9F4' } }
      }
    })
  })

  // total no fim (acompanha o filtro escolhido)
  const contagem = contar(linhas)
  const linhaTotal = linhaCabecalho + linhas.length + 1
  aba.mergeCells(linhaTotal, 1, linhaTotal, 4)
  aba.getCell(linhaTotal, 1).value = `Total de inscrições: ${linhas.length}`
  aba.mergeCells(linhaTotal, 5, linhaTotal, ultima)
  aba.getCell(linhaTotal, 5).value =
    `Entregues: ${contagem.entregues} · Aguardando: ${contagem.aguardando} · Devolvidos: ${contagem.devolvidos} · Atrasados: ${contagem.atrasados}`
  for (let coluna = 1; coluna <= ultima; coluna += 1) {
    const celula = aba.getCell(linhaTotal, coluna)
    celula.font = { name: 'Calibri', size: 11, bold: true, color: { argb: TEXTO } }
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE_CLARO } }
    celula.alignment = { vertical: 'middle', horizontal: 'left' }
    celula.border = { ...bordaFina(), top: { style: 'medium', color: { argb: VERDE } } }
  }
  aba.getRow(linhaTotal).height = 24

  // cabeçalho fixo ao rolar, filtro nas colunas e cabeçalho repetido ao imprimir
  aba.views = [{ state: 'frozen', ySplit: linhaCabecalho, showGridLines: false }]
  aba.autoFilter = { from: { row: linhaCabecalho, column: 1 }, to: { row: linhaCabecalho, column: ultima } }
  aba.pageSetup.printTitlesRow = `${linhaCabecalho}:${linhaCabecalho}`

  return livro
}

// A biblioteca do Excel é pesada, então só é carregada quando o supervisor clica em exportar.
export async function exportarExcel(linhas, grupo, tituloDoGrupo) {
  const ExcelJS = (await import('exceljs')).default
  const livro = montarPlanilhaRelatorio(ExcelJS, linhas, tituloDoGrupo ?? 'Todas', formatarData(hojeIso()))
  const buffer = await livro.xlsx.writeBuffer()

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeDoArquivo(grupo, 'xlsx')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
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