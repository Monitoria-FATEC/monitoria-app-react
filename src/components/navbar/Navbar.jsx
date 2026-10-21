import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import logo from '../../assets/img/logo/logo.png'
import {
  lerSessaoValida,
  limparSessao,
  rotaInicialPorPerfil,
} from '../../services/authStorage'

// Depois de rolar esta distância (em pixels), aparece o botão "Topo".
const DISTANCIA_PARA_BOTAO_TOPO = 500

export default function Navbar({ buttonBase }) {
  const navigate = useNavigate()
  const barra = useRef(null)
  const [sessao, setSessao] = useState(() => lerSessaoValida())
  const [rolou, setRolou] = useState(false)
  const [mostrarTopo, setMostrarTopo] = useState(false)

  const logado = Boolean(sessao?.token)
  const primeiroNome = sessao?.usuario?.nome?.trim().split(' ')[0]
  const painel = rotaInicialPorPerfil(sessao?.usuario?.role)

  // Sombra na barra e botão "Topo" conforme a página rola.
  useEffect(() => {
    function aoRolar() {
      setRolou(window.scrollY > 8)
      setMostrarTopo(window.scrollY > DISTANCIA_PARA_BOTAO_TOPO)
    }

    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })

    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Rola até a seção descontando a altura da barra fixa (o título não fica escondido).
  function irPara(event, id) {
    event.preventDefault()

    const alvo = id === 'inicio' ? null : document.getElementById(id)
    const alturaBarra = barra.current?.offsetHeight ?? 0
    const topo = alvo
      ? alvo.getBoundingClientRect().top + window.scrollY - alturaBarra
      : 0

    window.scrollTo({ top: Math.max(topo, 0), behavior: 'smooth' })
  }

  function voltarAoTopo() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function sair() {
    limparSessao()
    setSessao(null)
    navigate('/', { replace: true })
  }

  return (
    <>
      <div
        ref={barra}
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow duration-200 ${
          rolou ? 'shadow-[0_2px_12px_rgba(36,61,56,0.10)]' : ''
        }`}
      >
        <header className="mx-auto flex min-h-23 w-[calc(100%-3rem)] max-w-255 items-center justify-between gap-6 max-[760px]:min-h-20.5 max-[760px]:gap-3">
          <a
            className="inline-flex shrink-0 items-center gap-3 text-[#243d38] no-underline"
            href="#inicio"
            onClick={(event) => irPara(event, 'inicio')}
            aria-label="Monitoria FATEC - voltar ao início da página"
          >
            <img
              className="h-14.5 w-14.5 object-contain"
              src={logo}
              alt="Logo da Monitoria"
            />

            <span className="flex flex-col leading-tight">
              <strong className="text-lg font-semibold tracking-[-.3px] max-[380px]:text-base">
                Nome do site
              </strong>

              <small className="mt-1 text-[10px] tracking-[.5px] max-[380px]:text-[9px]">
                MONITORIA ACADÊMICA
              </small>
            </span>
          </a>

          <nav
            className="ml-auto flex gap-8 max-[900px]:gap-4 max-[760px]:hidden"
            aria-label="Navegação principal"
          >
            <a
              className="text-sm text-[#5f6964] no-underline hover:text-[#243d38]"
              href="#encontrar"
              onClick={(event) => irPara(event, 'encontrar')}
            >
              Encontrar monitoria
            </a>

            <a
              className="text-sm text-[#5f6964] no-underline hover:text-[#243d38]"
              href="#como-funciona"
              onClick={(event) => irPara(event, 'como-funciona')}
            >
              Como funciona
            </a>

            <a
              className="text-sm text-[#5f6964] no-underline hover:text-[#243d38]"
              href="#sobre"
              onClick={(event) => irPara(event, 'sobre')}
            >
              Sobre o projeto
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-5 max-[900px]:gap-3 max-[760px]:ml-auto">
            {logado ? (
              <>
                {primeiroNome && (
                  <span className="text-sm text-[#5f6964] max-[900px]:hidden">
                    Olá, <strong className="text-[#243d38]">{primeiroNome}</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={sair}
                  className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-[#a34d46]"
                >
                  Sair
                </button>

                <Link
                  className={`${buttonBase} bg-[#315c50] px-5 py-3 text-white max-[380px]:px-3 max-[380px]:text-xs`}
                  to={painel}
                >
                  Meu painel
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="text-sm text-[#5f6964] no-underline max-[760px]:hidden"
                  to="/entrar"
                >
                  Entrar
                </Link>

                <Link
                  className={`${buttonBase} bg-[#315c50] px-5 py-3 text-white max-[380px]:px-3 max-[380px]:text-xs`}
                  to="/cadastro"
                >
                  Sou Monitor
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      <button
        type="button"
        onClick={voltarAoTopo}
        aria-label="Voltar ao topo da página"
        className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-[#315c50] text-lg text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${
          mostrarTopo
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2 opacity-0'
        }`}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </>
  )
}