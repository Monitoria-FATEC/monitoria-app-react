import { useCallback, useEffect, useMemo, useState } from 'react'

import Footer from '../../components/footer/Footer'
import Navbar from '../../components/navbar/Navbar'
import { listarHorariosPublicos } from '../../api/horariosApi'
import { agruparPorDia, formatarIntervalo } from '../../utils/horarios'

const buttonBase =
  'inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium no-underline transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(39,70,59,0.12)]'

// Ignora maiúsculas e acentos: "matematica" encontra "Matemática Discreta".
function normalizar(texto) {
  return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// Só links https viram botão (o back já valida, aqui é uma segunda trava).
function linkSeguro(link) {
  return typeof link === 'string' && /^https:\/\//i.test(link.trim())
}

// Página pública: o aluno busca a disciplina e vê quando e onde o monitor atende.
export default function HorariosPublicos() {
  const [horarios, setHorarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [contatoAbertoId, setContatoAbertoId] = useState(null)

  const carregar = useCallback(async () => {
    try {
      // "id" só serve de chave na lista; a API pública não envia ids
      const lista = await listarHorariosPublicos()
      setHorarios(lista.map((horario, indice) => ({ ...horario, id: `${indice}-${horario.nome}-${horario.inicio}` })))
    } catch {
      setErro('Não foi possível carregar os horários agora. Tente novamente em instantes.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => carregar(), 0)
    return () => window.clearTimeout(timer)
  }, [carregar])

  const filtrados = useMemo(() => {
    const termo = normalizar(busca)
    if (!termo) return horarios

    return horarios.filter(
      (horario) => normalizar(horario.disciplina).includes(termo) || normalizar(horario.nome).includes(termo),
    )
  }, [horarios, busca])

  const dias = agruparPorDia(filtrados)

  return (
    <main className="min-h-screen bg-white font-sans text-left text-[#243d38]">
      <Navbar buttonBase={buttonBase} />

      <section className="mx-auto w-[calc(100%-3rem)] max-w-255 py-12 pb-16">
        <h1 className="m-0 mb-3 font-serif text-[40px] font-normal leading-[1.05] tracking-[-1.2px] max-[760px]:text-[34px]">
          Encontre sua <em className="text-[#769c8d]">monitoria.</em>
        </h1>
        <p className="m-0 mb-7 max-w-xl text-base leading-[1.65] text-[#68766e]">
          Digite a disciplina para ver quem atende, em quais dias e horários e em que local. Não precisa de cadastro.
        </p>

        <label className="mb-2 block max-w-xl">
          <span className="mb-1.5 block text-xs font-bold text-[#39544c]">Disciplina ou monitor</span>
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Ex.: matemática, banco de dados, Ana"
            className="w-full rounded-full border border-[#d7e0d6] bg-[#fbfcfa] px-5 py-3.5 text-base text-[#243d38] outline-none focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15"
          />
        </label>

        {carregando ? (
          <p className="mt-8 text-sm text-[#315c50]" role="status">Carregando horários...</p>
        ) : erro ? (
          <p className="mt-8 rounded-xl bg-[#fce8e5] px-4 py-3 text-sm text-[#a64e49]" role="alert">{erro}</p>
        ) : (
          <>
            <p className="mt-4 mb-6 text-sm text-[#68766e]" role="status">
              {filtrados.length === 1 ? '1 horário encontrado.' : `${filtrados.length} horários encontrados.`}
            </p>

            {dias.length === 0 ? (
              <p className="m-0 rounded-xl bg-[#f3f1ea] px-4 py-4 text-sm text-[#68766e]">
                {horarios.length === 0
                  ? 'Ainda não há horários publicados. Volte em breve.'
                  : 'Nenhuma monitoria encontrada para essa busca. Tente outra disciplina.'}
              </p>
            ) : (
              <div className="grid gap-5">
                {dias.map((dia) => (
                  <section key={dia.valor} aria-labelledby={`dia-${dia.valor}`}>
                    <h2 id={`dia-${dia.valor}`} className="m-0 mb-2 font-serif text-xl font-normal">{dia.rotulo}</h2>

                    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                      {dia.horarios.map((horario) => (
                        <li key={horario.id} className="rounded-xl border border-[#e2e6df] bg-[#f7f9f4] p-4">
                          <p className="m-0 text-lg font-bold">{formatarIntervalo(horario)}</p>
                          <p className="m-0 mt-1 text-sm font-semibold text-[#315c50]">{horario.disciplina}</p>
                          {horario.professor && (
                            <p className="m-0 text-xs text-[#68766e]">Professor(a): {horario.professor}</p>
                          )}
                          <p className="m-0 mt-2 text-sm">{horario.nome}</p>
                          <p className="m-0 mt-0.5 text-sm text-[#68766e]">{horario.local}</p>

                          <button
                            type="button"
                            aria-expanded={contatoAbertoId === horario.id}
                            aria-controls={`contato-${horario.id}`}
                            onClick={() => setContatoAbertoId(contatoAbertoId === horario.id ? null : horario.id)}
                            className="mt-3 min-h-11 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-[#315c50]"
                          >
                            {contatoAbertoId === horario.id ? 'Ocultar contato' : 'Ver contato'}
                          </button>

                          {contatoAbertoId === horario.id && (
                            <div id={`contato-${horario.id}`} className="mt-1 flex flex-wrap gap-2">
                              {linkSeguro(horario.linkWhatsapp) && (
                                <a
                                  href={horario.linkWhatsapp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-11 items-center rounded-full bg-[#315c50] px-4 text-sm font-medium text-white no-underline"
                                >
                                  Chamar no WhatsApp
                                </a>
                              )}
                              {linkSeguro(horario.linkTeams) && (
                                <a
                                  href={horario.linkTeams}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-11 items-center rounded-full bg-[#f3efdf] px-4 text-sm font-medium text-[#315c50] no-underline"
                                >
                                  Abrir no Teams
                                </a>
                              )}
                              {!linkSeguro(horario.linkWhatsapp) && !linkSeguro(horario.linkTeams) && (
                                <p className="m-0 text-sm text-[#68766e]">
                                  Este monitor não divulgou um canal de contato. Vá até o local no horário indicado.
                                </p>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  )
}
