import { createElement } from 'react'

import { agruparPorDia, dataDeHojeBr } from './horarios'

function hojeIso() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

// Gera o PDF dos horários (já filtrados) e baixa no navegador.
// "filtro" é um texto opcional que aparece no cabeçalho, ex.: "Disciplina: Banco de Dados".
export async function exportarHorariosPdf(horarios, filtro = '') {
  const [{ pdf }, { default: HorariosPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/supervisor/HorariosPdf'),
  ])

  const documento = createElement(HorariosPdf, {
    dias: agruparPorDia(horarios),
    atualizadoEm: dataDeHojeBr(),
    filtro,
  })
  const blob = await pdf(documento).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `horarios-monitoria-${hojeIso()}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
