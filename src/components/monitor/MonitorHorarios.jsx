import { useCallback, useEffect, useState } from 'react'

import { adicionarHorario, atualizarHorario, listarMeusHorarios, removerHorario } from '../../api/horariosApi'
import { DIAS_SEMANA, agruparPorDia, formatarIntervalo, validarHorario } from '../../utils/horarios'
import FormField from './FormField'

const formularioInicial = { diaSemana: '', inicio: '', fim: '', local: '' }

// Aba "Horários": o monitor publica em que dias e horas ele atende.
// A supervisão usa esses horários para divulgar a monitoria na Fatec.
export default function MonitorHorarios() {
  const [form, setForm] = useState(formularioInicial)
  const [erros, setErros] = useState({})
  const [horarios, setHorarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [removendoId, setRemovendoId] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      setHorarios(await listarMeusHorarios())
    } catch {
      setErro('Não foi possível carregar seus horários.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => carregar(), 0)
    return () => window.clearTimeout(timer)
  }, [carregar])

  const dias = agruparPorDia(horarios)

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  async function publicar(event) {
    event.preventDefault()
    setMensagem('')
    setErro('')

    const encontrados = validarHorario(form, horarios, editandoId)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setSalvando(true)

    try {
      const dados = {
        diaSemana: Number(form.diaSemana),
        inicio: form.inicio,
        fim: form.fim,
        local: form.local.trim(),
      }

      if (editandoId) {
        await atualizarHorario(editandoId, dados)
        setMensagem('Horário atualizado.')
        setEditandoId(null)
        setForm(formularioInicial)
      } else {
        await adicionarHorario(dados)
        setMensagem('Horário adicionado.')
        setForm((atual) => ({ ...formularioInicial, local: atual.local }))
      }
      await carregar()
    } catch (requestError) {
      setErro(requestError.response?.data?.message ?? 'Não foi possível salvar o horário. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  function iniciarEdicao(horario) {
    setMensagem('')
    setErro('')
    setErros({})
    setRemovendoId(null)
    setEditandoId(horario.id)
    setForm({
      diaSemana: String(horario.diaSemana),
      inicio: horario.inicio,
      fim: horario.fim,
      local: horario.local,
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setErros({})
    setForm(formularioInicial)
  }

  async function confirmarRemocao(horarioId) {
    setMensagem('')
    setErro('')

    try {
      await removerHorario(horarioId)
      setRemovendoId(null)
      if (editandoId === horarioId) cancelarEdicao()
      setMensagem('Horário removido.')
      await carregar()
    } catch (requestError) {
      setErro(requestError.response?.data?.message ?? 'Não foi possível remover o horário.')
    }
  }

  if (carregando) return <p className="text-sm text-[#315c50]" role="status">Carregando seus horários...</p>

  return (
    <div className="grid gap-6">
      {erro && <div className="rounded-xl bg-[#fce8e5] px-4 py-3 text-sm text-[#a64e49]" role="alert">{erro}</div>}
      {mensagem && <div className="rounded-xl bg-[#e4f4e5] px-4 py-3 text-sm text-[#39734f]" role="status">{mensagem}</div>}

      <div className="flex flex-wrap items-start gap-6">
        <form onSubmit={publicar} noValidate className="grid min-w-72 max-w-105 flex-1 gap-4 rounded-2xl border border-[#e2e6df] bg-white p-6">
          <h3 className="m-0 text-lg font-semibold">{editandoId ? 'Editar horário' : 'Adicionar horário'}</h3>
          <p className="m-0 -mt-2 text-sm text-[#68766e]">Os horários se repetem toda semana.</p>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-[#39544c]">Dia da semana</span>
            <select
              value={form.diaSemana}
              onChange={(event) => alterar('diaSemana', event.target.value)}
              aria-invalid={Boolean(erros.diaSemana)}
              className={`w-full rounded-lg border bg-[#fbfcfa] px-3.5 py-3 text-sm text-[#243d38] outline-none focus:ring-4 ${
                erros.diaSemana
                  ? 'border-[#a34d46] focus:border-[#a34d46] focus:ring-[#a34d46]/15'
                  : 'border-[#d7e0d6] focus:border-[#769c8d] focus:ring-[#769c8d]/15'
              }`}
            >
              <option value="">Escolha o dia</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia.valor} value={dia.valor}>{dia.rotulo}</option>
              ))}
            </select>
            {erros.diaSemana && <span className="text-[11px] text-[#a34d46]" role="alert">{erros.diaSemana}</span>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Início" type="time" value={form.inicio} erro={erros.inicio} onChange={(event) => alterar('inicio', event.target.value)} />
            <FormField label="Fim" type="time" value={form.fim} erro={erros.fim} onChange={(event) => alterar('fim', event.target.value)} />
          </div>

          <FormField
            label="Local"
            placeholder="Ex.: Biblioteca, mesa 3"
            value={form.local}
            erro={erros.local}
            onChange={(event) => alterar('local', event.target.value)}
          />

          <button
            type="submit"
            disabled={salvando}
            className="min-h-12 cursor-pointer rounded-xl border-0 bg-[#315c50] px-6 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Adicionar horário'}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className="min-h-11 cursor-pointer border-0 bg-transparent text-sm font-semibold text-[#68766e]"
            >
              Cancelar edição
            </button>
          )}
        </form>

        <section aria-labelledby="meus-horarios" className="min-w-0 flex-[999_1_380px] rounded-2xl border border-[#e2e6df] bg-white p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="meus-horarios" className="m-0 text-lg font-semibold">Meus horários</h3>
            <p className="m-0 text-sm text-[#68766e]">{horarios.length === 1 ? '1 horário' : `${horarios.length} horários`}</p>
          </div>

          {dias.length === 0 ? (
            <p className="m-0 rounded-[10px] bg-[#f3f1ea] px-4 py-4 text-sm text-[#68766e]">Você ainda não publicou horários.</p>
          ) : (
            <div className="grid gap-5">
              {dias.map((dia) => (
                <div key={dia.valor}>
                  <h4 className="m-0 mb-1 text-sm font-bold uppercase tracking-[.8px] text-[#769c8d]">{dia.rotulo}</h4>

                  {dia.horarios.map((horario) => (
                    <div key={horario.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ece2] py-3">
                      <div>
                        <p className="m-0 text-base font-bold">{formatarIntervalo(horario)}</p>
                        <p className="m-0 mt-0.5 text-xs text-[#68766e]">{horario.local}</p>
                      </div>

                      {removendoId === horario.id ? (
                        <div className="flex flex-wrap items-center gap-x-3">
                          <span className="text-sm text-[#a34d46]">Remover este horário?</span>
                          <button type="button" onClick={() => confirmarRemocao(horario.id)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-bold text-[#a34d46]">
                            Sim, remover
                          </button>
                          <button type="button" onClick={() => setRemovendoId(null)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-semibold text-[#68766e]">
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-x-3">
                          <button type="button" onClick={() => iniciarEdicao(horario)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-bold text-[#315c50]">
                            Editar
                          </button>
                          <button type="button" onClick={() => setRemovendoId(horario.id)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-bold text-[#a34d46]">
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
