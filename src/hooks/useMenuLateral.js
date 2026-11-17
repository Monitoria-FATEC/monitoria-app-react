import { useEffect, useRef, useState } from 'react'

// Controla a gaveta do menu lateral no celular (abaixo do md, 768px).
// Com a gaveta aberta: trava a rolagem da página, leva o foco para dentro dela
// e fecha com Esc ou se a tela crescer até o tamanho em que o menu fica fixo.
// Ao fechar, o foco volta para o botão que abriu.
export default function useMenuLateral() {
  const [aberto, setAberto] = useState(false)
  const botaoAbrirRef = useRef(null)
  const botaoFecharRef = useRef(null)

  useEffect(() => {
    if (!aberto) return undefined

    const botaoAbrir = botaoAbrirRef.current
    const telaGrande = window.matchMedia('(min-width: 48rem)')
    const fechar = () => setAberto(false)
    const aoPressionar = (event) => {
      if (event.key === 'Escape') fechar()
    }

    document.body.style.overflow = 'hidden'
    botaoFecharRef.current?.focus()
    document.addEventListener('keydown', aoPressionar)
    telaGrande.addEventListener('change', fechar)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', aoPressionar)
      telaGrande.removeEventListener('change', fechar)
      botaoAbrir?.focus()
    }
  }, [aberto])

  return {
    aberto,
    abrir: () => setAberto(true),
    fechar: () => setAberto(false),
    botaoAbrirRef,
    botaoFecharRef,
  }
}
