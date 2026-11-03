import { useEffect, useRef, useState } from 'react'

import {
  PADRAO,
  TAMANHOS,
  aplicarPreferencias,
  lerPreferencias,
  salvarPreferencias,
} from '../../utils/acessibilidade'
import { ativarLeitor, leituraSuportada } from '../../utils/leitorDeTexto'

function Interruptor({ rotulo, descricao, ligado, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={onChange}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-gray-400"
    >
      <span>
        <span className="block text-sm font-bold text-[#2E4039]">{rotulo}</span>
        <span className="block text-xs text-[#68766e]">{descricao}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors ${
          ligado ? 'bg-[#2F5146]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            ligado ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

// Botão fixo no canto da tela, em todas as páginas. Abre o painel de acessibilidade
// para quem tem baixa visão: letra maior, alto contraste e links destacados.
export default function BarraAcessibilidade() {
  const [aberto, setAberto] = useState(false)
  const [preferencias, setPreferencias] = useState(lerPreferencias)
  const botaoRef = useRef(null)

  // Aplica na página e guarda sempre que algo muda.
  useEffect(() => {
    aplicarPreferencias(preferencias)
    salvarPreferencias(preferencias)
  }, [preferencias])

  // Leitor de texto: clicar ou tocar lê o trecho; com a opção do mouse, passar o mouse lê a palavra.
  useEffect(() => {
    if (!preferencias.leitor || !leituraSuportada()) return undefined
    return ativarLeitor({ mouse: preferencias.leitorMouse })
  }, [preferencias.leitor, preferencias.leitorMouse])

  // Esc fecha o painel e devolve o foco ao botão.
  useEffect(() => {
    if (!aberto) return undefined

    function aoPressionar(event) {
      if (event.key === 'Escape') {
        setAberto(false)
        botaoRef.current?.focus()
      }
    }

    window.addEventListener('keydown', aoPressionar)
    return () => window.removeEventListener('keydown', aoPressionar)
  }, [aberto])

  function mudarTamanho(passo) {
    setPreferencias((atual) => ({
      ...atual,
      tamanho: Math.min(Math.max(atual.tamanho + passo, 0), TAMANHOS.length - 1),
    }))
  }

  const naMinima = preferencias.tamanho === 0
  const naMaxima = preferencias.tamanho === TAMANHOS.length - 1
  const emPadrao =
    preferencias.tamanho === PADRAO.tamanho &&
    preferencias.contraste === PADRAO.contraste &&
    preferencias.links === PADRAO.links &&
    preferencias.leitor === PADRAO.leitor &&
    preferencias.leitorMouse === PADRAO.leitorMouse

  const botaoTamanho =
    'h-10 min-w-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 font-bold text-[#2E4039] hover:border-[#2F5146] disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div data-acessibilidade className="fixed bottom-4 right-4 z-[100] flex flex-col items-end font-sans">
      {aberto && (
        <section
          id="painel-acessibilidade"
          role="dialog"
          aria-label="Opções de acessibilidade"
          className="mb-3 w-72 rounded-2xl border border-gray-200 bg-[#FAF9F6] p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2E4039]">Acessibilidade</h2>
            <button
              type="button"
              onClick={() => {
                setAberto(false)
                botaoRef.current?.focus()
              }}
              aria-label="Fechar opções de acessibilidade"
              className="cursor-pointer p-1 text-lg text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-sm font-bold text-[#2E4039]">Tamanho da letra</p>
            <p className="mb-2 text-xs text-[#68766e]" aria-live="polite">
              Atual: {TAMANHOS[preferencias.tamanho]}%
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={botaoTamanho}
                onClick={() => mudarTamanho(-1)}
                disabled={naMinima}
                aria-label="Diminuir letra"
              >
                A−
              </button>
              <button
                type="button"
                className={botaoTamanho}
                onClick={() => setPreferencias((atual) => ({ ...atual, tamanho: 0 }))}
                disabled={naMinima}
                aria-label="Tamanho padrão da letra"
              >
                A
              </button>
              <button
                type="button"
                className={botaoTamanho}
                onClick={() => mudarTamanho(1)}
                disabled={naMaxima}
                aria-label="Aumentar letra"
              >
                A+
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Interruptor
              rotulo="Alto contraste"
              descricao="Fundo preto com letras claras"
              ligado={preferencias.contraste}
              onChange={() => setPreferencias((atual) => ({ ...atual, contraste: !atual.contraste }))}
            />
            <Interruptor
              rotulo="Destacar links"
              descricao="Sublinha e engrossa os links"
              ligado={preferencias.links}
              onChange={() => setPreferencias((atual) => ({ ...atual, links: !atual.links }))}
            />
            {leituraSuportada() ? (
              <>
                <Interruptor
                  rotulo="Ler texto em voz alta"
                  descricao="Clique ou toque num texto para ouvir. Esc para parar"
                  ligado={preferencias.leitor}
                  onChange={() => setPreferencias((atual) => ({ ...atual, leitor: !atual.leitor }))}
                />
                {preferencias.leitor && (
                  <Interruptor
                    rotulo="Ler ao passar o mouse"
                    descricao="Lê a palavra sob o ponteiro (computador)"
                    ligado={preferencias.leitorMouse}
                    onChange={() => setPreferencias((atual) => ({ ...atual, leitorMouse: !atual.leitorMouse }))}
                  />
                )}
              </>
            ) : (
              <p className="m-0 rounded-lg border border-gray-200 bg-white p-3 text-xs text-[#68766e]">
                Este navegador não tem leitura em voz alta.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setPreferencias({ ...PADRAO })}
            disabled={emPadrao}
            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-[#2E4039] hover:border-[#2F5146] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Restaurar padrão
          </button>
        </section>
      )}

      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-expanded={aberto}
        aria-controls="painel-acessibilidade"
        aria-label="Acessibilidade: tamanho da letra e contraste"
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#2F5146] text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="4.5" r="2" />
          <path d="M5 8.5h14" />
          <path d="M12 8.5v5" />
          <path d="m9 21 3-7.5 3 7.5" />
        </svg>
      </button>
    </div>
  )
}