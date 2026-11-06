import { formatarDataBr, formatarDuracao, hojeEmIso, minutosEntre } from './ficha'

// Ex.: "Larissa Teixeira" -> "larissa-teixeira"
function paraNomeDeArquivo(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function nomeDoArquivoFicha(nomeMonitor) {
  const nome = paraNomeDeArquivo(nomeMonitor) || 'monitor'
  return `ficha-atendimentos-${nome}-${hojeEmIso()}.xlsx`
}

// Gera a planilha (.xlsx) com todos os atendimentos da ficha, em ordem de data.
export async function exportarFichaExcel(registros, nomeMonitor) {
  const XLSX = await import('xlsx')

  const ordenados = [...registros].sort((a, b) => `${a.data}T${a.inicio}`.localeCompare(`${b.data}T${b.inicio}`))
  const totalMinutos = ordenados.reduce((soma, item) => soma + minutosEntre(item.inicio, item.termino), 0)

  const linhas = [
    ['Ficha de atendimentos'],
    [`Monitor: ${nomeMonitor || ''}`],
    [`Gerada em: ${formatarDataBr(hojeEmIso())}`],
    [],
    ['Data', 'Início', 'Término', 'Duração', 'Aluno atendido', 'Atividade realizada'],
    ...ordenados.map((item) => [
      formatarDataBr(item.data),
      item.inicio,
      item.termino,
      formatarDuracao(minutosEntre(item.inicio, item.termino)),
      item.aluno,
      item.atividade,
    ]),
    [],
    ['Total', '', '', formatarDuracao(totalMinutos), `${ordenados.length} atendimento(s)`],
  ]

  const planilha = XLSX.utils.aoa_to_sheet(linhas)
  planilha['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 9 }, { wch: 10 }, { wch: 28 }, { wch: 60 }]

  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, 'Atendimentos')
  XLSX.writeFile(livro, nomeDoArquivoFicha(nomeMonitor))
}
