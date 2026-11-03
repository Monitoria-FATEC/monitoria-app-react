// Leitor de texto em voz alta, usando a voz do próprio navegador (Web Speech API).
// - Clicar ou tocar num texto lê o trecho inteiro (parágrafo, título, botão, item de lista).
// - Passar o mouse sobre uma palavra lê a palavra (só se a opção estiver ligada).
// - Esc para a leitura.
// Não substitui um leitor de tela como NVDA, JAWS ou VoiceOver: é um apoio dentro do site.

const LIMITE_DO_TRECHO = 400
const ATRASO_DO_MOUSE_MS = 450
const BLOCOS = 'p, li, h1, h2, h3, h4, h5, h6, td, th, label, legend, dt, dd, button, a, summary, figcaption, blockquote, span, div'
const LETRA = /[\p{L}\p{N}]/u

export function leituraSuportada() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function escolherVoz() {
  const vozes = window.speechSynthesis.getVoices()
  return vozes.find((voz) => voz.lang === 'pt-BR') ?? vozes.find((voz) => voz.lang?.toLowerCase().startsWith('pt'))
}

export function falar(texto) {
  const limpo = String(texto ?? '').replace(/\s+/g, ' ').trim()
  if (!limpo || !leituraSuportada()) return

  window.speechSynthesis.cancel()

  const fala = new SpeechSynthesisUtterance(limpo.slice(0, LIMITE_DO_TRECHO))
  fala.lang = 'pt-BR'
  fala.rate = 0.95

  const voz = escolherVoz()
  if (voz) fala.voice = voz

  window.speechSynthesis.speak(fala)
}

export function pararDeFalar() {
  if (leituraSuportada()) window.speechSynthesis.cancel()
}

// Posição do texto sob o ponteiro: { no, posicao } ou null.
function pontoDeTexto(x, y) {
  if (document.caretPositionFromPoint) {
    const ponto = document.caretPositionFromPoint(x, y)
    return ponto ? { no: ponto.offsetNode, posicao: ponto.offset } : null
  }

  if (document.caretRangeFromPoint) {
    const faixa = document.caretRangeFromPoint(x, y)
    return faixa ? { no: faixa.startContainer, posicao: faixa.startOffset } : null
  }

  return null
}

// Palavra sob o ponteiro, só se o ponteiro estiver mesmo em cima dela (e não num espaço vazio).
function palavraSob(x, y) {
  const ponto = pontoDeTexto(x, y)
  if (!ponto || ponto.no?.nodeType !== Node.TEXT_NODE) return null

  const texto = ponto.no.textContent
  let inicio = Math.min(ponto.posicao, texto.length)
  let fim = inicio

  while (inicio > 0 && LETRA.test(texto[inicio - 1])) inicio -= 1
  while (fim < texto.length && LETRA.test(texto[fim])) fim += 1
  if (inicio === fim) return null

  const faixa = document.createRange()
  faixa.setStart(ponto.no, inicio)
  faixa.setEnd(ponto.no, fim)

  const estaEmCima = [...faixa.getClientRects()].some(
    (r) => x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2,
  )
  if (!estaEmCima) return null

  return { palavra: texto.slice(inicio, fim), no: ponto.no, inicio }
}

function textoDoCampo(elemento) {
  const rotulo = elemento.labels?.[0]?.innerText || elemento.getAttribute('aria-label') || elemento.placeholder
  return rotulo ? `Campo: ${rotulo}` : ''
}

// Trecho inteiro (parágrafo, título, botão...) do elemento sob o ponteiro.
function trechoSob(alvo) {
  if (!(alvo instanceof Element)) return ''

  if (alvo.matches('input, textarea, select')) return textoDoCampo(alvo)

  const rotulo = alvo.closest('[aria-label]')?.getAttribute('aria-label')
  const bloco = alvo.closest(BLOCOS)
  const texto = bloco?.innerText?.trim()

  return texto || rotulo || ''
}

function ehDaBarra(alvo) {
  return alvo instanceof Element && Boolean(alvo.closest('[data-acessibilidade], [vw]'))
}

// Liga a leitura na página inteira. Devolve a função que desliga tudo.
export function ativarLeitor({ mouse }) {
  let temporizador = null
  let ultimaPalavra = null

  function aoClicar(event) {
    if (ehDaBarra(event.target)) return
    falar(trechoSob(event.target))
  }

  function aoMover(event) {
    window.clearTimeout(temporizador)
    if (ehDaBarra(event.target)) return

    const { clientX, clientY } = event
    temporizador = window.setTimeout(() => {
      const achada = palavraSob(clientX, clientY)
      if (!achada) return

      const chave = `${achada.no.parentElement?.tagName}-${achada.inicio}-${achada.palavra}`
      if (chave === ultimaPalavra) return

      ultimaPalavra = chave
      falar(achada.palavra)
    }, ATRASO_DO_MOUSE_MS)
  }

  function aoPressionar(event) {
    if (event.key === 'Escape') pararDeFalar()
  }

  document.addEventListener('click', aoClicar, true)
  window.addEventListener('keydown', aoPressionar)
  if (mouse) document.addEventListener('mousemove', aoMover, { passive: true })

  return () => {
    window.clearTimeout(temporizador)
    document.removeEventListener('click', aoClicar, true)
    document.removeEventListener('mousemove', aoMover)
    window.removeEventListener('keydown', aoPressionar)
    pararDeFalar()
  }
}
