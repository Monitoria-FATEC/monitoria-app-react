import { formatarDataBr, formatarDuracao, formatarIntervaloBr, hojeEmIso, minutosEntre } from './ficha'

const COR_TITULO = 'FF315C50'
const COR_CABECALHO = 'FFE4EDE7'
const COR_TEXTO = 'FF243D38'
const BORDA = { style: 'thin', color: { argb: 'FFB8C4BC' } }
const BORDAS = { top: BORDA, left: BORDA, bottom: BORDA, right: BORDA }

// Ex.: "Larissa Teixeira" -> "larissa-teixeira"
function paraNomeDeArquivo(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// sufixo: "2026-11" (mês) ou "periodo-completo"
export function nomeDoArquivoRegistro(nomeMonitor, sufixo, extensao = 'xlsx') {
  const nome = paraNomeDeArquivo(nomeMonitor) || 'monitor'
  return `registro-atendimentos-${nome}-${sufixo || hojeEmIso()}.${extensao}`
}

// Linhas do bloco de informações (usadas na planilha e no PDF).
// dados.referencia: { rotulo: "Mês de referência" | "Período completo", inicio, fim }
export function linhasDeInformacao(dados = {}) {
  const referencia = dados.referencia ?? {}
  return [
    ['Monitor(a)', dados.nomeMonitor],
    ['RA do monitor', dados.raMonitor],
    ['Curso', dados.curso],
    ['Disciplina', dados.disciplina],
    ['Professor(a)', dados.professor],
    ['Período de vigência', formatarIntervaloBr(dados.vigenciaInicio, dados.vigenciaFim)],
    [referencia.rotulo || 'Período de referência', formatarIntervaloBr(referencia.inicio, referencia.fim)],
  ]
}

// Monta a planilha. Recebe a classe do ExcelJS para poder ser testada fora do navegador.
// dados: { nomeMonitor, raMonitor, curso, disciplina, professor, periodoInicio, periodoFim }
export function montarPlanilha(ExcelJS, registros, dados = {}) {
  const livro = new ExcelJS.Workbook()
  livro.creator = 'Monitoria Acadêmica - Fatec Zona Leste'
  livro.created = new Date()

  const folha = livro.addWorksheet('Registro de atendimentos', {
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    },
    views: [{ showGridLines: false }],
  })

  folha.columns = [
    { width: 13 }, // Data
    { width: 9 }, // Início
    { width: 10 }, // Término
    { width: 11 }, // Duração
    { width: 30 }, // Aluno atendido
    { width: 18 }, // RA do aluno
    { width: 62 }, // Atividade realizada
  ]
  const ULTIMA = 'G'

  // ---------- cabeçalho ----------
  folha.mergeCells(`A1:${ULTIMA}1`)
  const titulo = folha.getCell('A1')
  titulo.value = 'Controle de Registro de Monitoria Acadêmica'
  titulo.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COR_TITULO } }
  titulo.alignment = { vertical: 'middle', horizontal: 'center' }
  folha.getRow(1).height = 34

  folha.mergeCells(`A2:${ULTIMA}2`)
  const unidade = folha.getCell('A2')
  unidade.value = 'Fatec Zona Leste'
  unidade.font = { name: 'Calibri', size: 11, italic: true, color: { argb: COR_TEXTO } }
  unidade.alignment = { horizontal: 'center' }

  const info = linhasDeInformacao(dados)
  info.forEach(([rotulo, valor], indice) => {
    const linha = 4 + indice
    folha.mergeCells(`A${linha}:B${linha}`)
    folha.mergeCells(`C${linha}:${ULTIMA}${linha}`)
    const celulaRotulo = folha.getCell(`A${linha}`)
    celulaRotulo.value = rotulo
    celulaRotulo.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COR_TEXTO } }
    celulaRotulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COR_CABECALHO } }
    celulaRotulo.border = BORDAS
    celulaRotulo.alignment = { vertical: 'middle', indent: 1 }
    const celulaValor = folha.getCell(`C${linha}`)
    celulaValor.value = valor || ''
    celulaValor.font = { name: 'Calibri', size: 11, color: { argb: COR_TEXTO } }
    celulaValor.border = BORDAS
    celulaValor.alignment = { vertical: 'middle', indent: 1 }
    folha.getRow(linha).height = 20
  })

  // ---------- tabela ----------
  const linhaCabecalho = 4 + info.length + 1
  const cabecalho = ['Data', 'Início', 'Término', 'Duração', 'Aluno atendido', 'RA do aluno (opcional)', 'Atividade realizada']
  cabecalho.forEach((texto, indice) => {
    const celula = folha.getCell(linhaCabecalho, indice + 1)
    celula.value = texto
    celula.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COR_TITULO } }
    celula.border = BORDAS
    celula.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  })
  folha.getRow(linhaCabecalho).height = 26

  const ordenados = [...registros].sort((a, b) => `${a.data}T${a.inicio}`.localeCompare(`${b.data}T${b.inicio}`))
  const totalMinutos = ordenados.reduce((soma, item) => soma + minutosEntre(item.inicio, item.termino), 0)

  ordenados.forEach((item, indice) => {
    const linha = linhaCabecalho + 1 + indice
    const valores = [
      formatarDataBr(item.data),
      item.inicio,
      item.termino,
      formatarDuracao(minutosEntre(item.inicio, item.termino)),
      item.aluno,
      item.raAluno || '',
      item.atividade,
    ]
    valores.forEach((valor, coluna) => {
      const celula = folha.getCell(linha, coluna + 1)
      celula.value = valor
      celula.font = { name: 'Calibri', size: 11, color: { argb: COR_TEXTO } }
      celula.border = BORDAS
      celula.alignment = {
        vertical: 'top',
        horizontal: coluna <= 3 || coluna === 5 ? 'center' : 'left',
        wrapText: true,
      }
      if (indice % 2 === 1) {
        celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F9F4' } }
      }
    })
    // o RA é texto: evita virar número e perder zeros
    folha.getCell(linha, 6).numFmt = '@'
  })

  const linhaTotal = linhaCabecalho + 1 + ordenados.length
  folha.mergeCells(`A${linhaTotal}:C${linhaTotal}`)
  folha.mergeCells(`E${linhaTotal}:${ULTIMA}${linhaTotal}`)
  const rotuloTotal = folha.getCell(`A${linhaTotal}`)
  rotuloTotal.value = 'Total'
  const valorTotal = folha.getCell(`D${linhaTotal}`)
  valorTotal.value = formatarDuracao(totalMinutos)
  const quantidade = folha.getCell(`E${linhaTotal}`)
  quantidade.value = `${ordenados.length} atendimento(s) registrado(s)`
  ;[rotuloTotal, valorTotal, quantidade].forEach((celula) => {
    celula.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COR_TEXTO } }
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COR_CABECALHO } }
    celula.alignment = { vertical: 'middle', horizontal: celula === quantidade ? 'left' : 'center', indent: celula === quantidade ? 1 : 0 }
  })
  for (let coluna = 1; coluna <= 7; coluna += 1) folha.getCell(linhaTotal, coluna).border = BORDAS
  folha.getRow(linhaTotal).height = 22

  // ---------- assinaturas ----------
  const linhaAssinatura = linhaTotal + 4
  const linhaLegenda = linhaAssinatura + 1
  const linhaNome = linhaAssinatura + 2

  const blocos = [
    { inicio: 'A', fim: 'E', legenda: 'Assinatura do(a) professor(a)', nome: dados.professor || '' },
    { inicio: 'G', fim: 'G', legenda: 'Assinatura do(a) monitor(a)', nome: dados.nomeMonitor || '' },
  ]
  blocos.forEach((bloco) => {
    if (bloco.inicio !== bloco.fim) {
      folha.mergeCells(`${bloco.inicio}${linhaAssinatura}:${bloco.fim}${linhaAssinatura}`)
      folha.mergeCells(`${bloco.inicio}${linhaLegenda}:${bloco.fim}${linhaLegenda}`)
      folha.mergeCells(`${bloco.inicio}${linhaNome}:${bloco.fim}${linhaNome}`)
    }
    const linhaDaAssinatura = folha.getCell(`${bloco.inicio}${linhaAssinatura}`)
    linhaDaAssinatura.border = { bottom: { style: 'thin', color: { argb: 'FF243D38' } } }
    const legenda = folha.getCell(`${bloco.inicio}${linhaLegenda}`)
    legenda.value = bloco.legenda
    legenda.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COR_TEXTO } }
    legenda.alignment = { horizontal: 'center' }
    const nome = folha.getCell(`${bloco.inicio}${linhaNome}`)
    nome.value = bloco.nome
    nome.font = { name: 'Calibri', size: 10, color: { argb: COR_TEXTO } }
    nome.alignment = { horizontal: 'center' }
  })
  // a linha de assinatura precisa cobrir o bloco inteiro
  for (const coluna of ['A', 'B', 'C', 'D', 'E']) {
    folha.getCell(`${coluna}${linhaAssinatura}`).border = { bottom: { style: 'thin', color: { argb: 'FF243D38' } } }
  }
  folha.getRow(linhaAssinatura).height = 38

  const emitido = folha.getCell(`A${linhaNome + 2}`)
  folha.mergeCells(`A${linhaNome + 2}:${ULTIMA}${linhaNome + 2}`)
  emitido.value = `Documento gerado pelo sistema em ${formatarDataBr(hojeEmIso())}.`
  emitido.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF68766E' } }

  return livro
}

function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Gera o .xlsx e baixa no navegador. sufixoArquivo: "2026-11" ou "periodo-completo".
export async function exportarFichaExcel(registros, dados) {
  const ExcelJS = (await import('exceljs')).default
  const livro = montarPlanilha(ExcelJS, registros, dados)
  const buffer = await livro.xlsx.writeBuffer()

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  baixarArquivo(blob, nomeDoArquivoRegistro(dados?.nomeMonitor, dados?.sufixoArquivo, 'xlsx'))
}

// Mesmo conteúdo da planilha, em PDF (A4 paisagem).
export async function exportarFichaPdf(registros, dados) {
  const [{ pdf }, { default: RegistroPdf }, { createElement }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/monitor/RegistroPdf'),
    import('react'),
  ])

  const blob = await pdf(createElement(RegistroPdf, { registros, dados })).toBlob()
  baixarArquivo(blob, nomeDoArquivoRegistro(dados?.nomeMonitor, dados?.sufixoArquivo, 'pdf'))
}