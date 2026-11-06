// Preferências de acessibilidade (tamanho da letra, alto contraste, links destacados e leitor de texto).
// Ficam salvas no navegador e valem para todas as telas, de qualquer perfil.

const CHAVE = 'monitoria.acessibilidade'

// Tamanhos da letra, em % do tamanho padrão do navegador.
export const TAMANHOS = [100, 115, 130, 150]

export const PADRAO = { tamanho: 0, contraste: false, links: false, leitor: false, leitorMouse: false }

export function lerPreferencias() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? 'null')
    if (!salvo || typeof salvo !== 'object') return { ...PADRAO }

    const tamanho = Number.isInteger(salvo.tamanho) ? salvo.tamanho : 0
    return {
      tamanho: Math.min(Math.max(tamanho, 0), TAMANHOS.length - 1),
      contraste: salvo.contraste === true,
      links: salvo.links === true,
      leitor: salvo.leitor === true,
      leitorMouse: salvo.leitorMouse === true,
    }
  } catch {
    // navegador sem armazenamento (janela anônima, por exemplo): usa o padrão
    return { ...PADRAO }
  }
}

export function salvarPreferencias(preferencias) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias))
  } catch {
    // sem armazenamento: a escolha vale só até recarregar a página
  }
}

// Aplica as preferências na página. O tamanho muda a fonte da raiz, e o Tailwind
// (que usa rem) aumenta junto os textos, botões e espaçamentos. O painel de acessibilidade
// recebe o zoom inverso (veja index.css) para manter sempre o mesmo tamanho.
export function aplicarPreferencias({ tamanho, contraste, links }) {
  const raiz = document.documentElement
  const porcentagem = TAMANHOS[tamanho] ?? 100
  raiz.style.fontSize = `${porcentagem}%`
  raiz.style.setProperty('--zoom-acessibilidade', 100 / porcentagem)
  raiz.classList.toggle('alto-contraste', contraste)
  raiz.classList.toggle('destacar-links', links)
}