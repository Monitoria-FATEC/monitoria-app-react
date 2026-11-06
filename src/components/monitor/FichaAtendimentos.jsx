import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { atualizarRegistro, criarRegistro, excluirRegistro, listarRegistros } from '../../api/fichaApi'
import { exportarFichaExcel } from '../../utils/exportarFicha'
import { LIMITE_ATIVIDADE, formatarDataBr, formatarDuracao, hojeEmIso, minutosEntre, validarRegistro } from '../../utils/ficha'
import FormField from './FormField'

const formularioVazio = { aluno: '', atividade: '', data: '', inicio: '', termino: '' }

// Aba "Ficha de atendimentos": o monitor registra cada atendimento que fez.
// Serve de comprovação do atendimento enquanto não existe o QR Code de presença.
export default function FichaAtendimentos({ nomeMonitor }) {
  const [registros, setRegistros] = useState([])
  const [form, setForm] = useState(formularioVazio)
  const [erros, setErros] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [excluindoId, setExcluindoId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const cartaoDoFormulario = useRef(null)

  const carregar = useCallback(async () => {
    try {
      setRegistros(await listarRegistros())
    } catch {
      setErro('Não foi possível carregar a sua ficha de atendimentos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => carregar(), 0)
    return () => window.clearTimeout(timer)
  }, [carregar])

  // Mais recentes primeiro.
  const ordenados = useMemo(
    () => [...registros].sort((a, b) => `${b.data}T${b.inicio}`.localeCompare(`${a.data}T${a.inicio}`)),
    [registros],
  )
  const totalMinutos = registros.reduce((soma, item) => soma + minutosEntre(item.inicio, item.termino), 0)
  const duracaoDoForm = minutosEntre(form.inicio, form.termino)

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  function limpar() {
    setForm(formularioVazio)
    setErros({})
    setEditandoId(null)
  }

  function editar(registro) {
    setMensagem('')
    setErro('')
    setExcluindoId(null)
    setErros({})
    setEditandoId(registro.id)
    setForm({
      aluno: registro.aluno,
      atividade: registro.atividade,
      data: registro.data,
      inicio: registro.inicio,
      termino: registro.termino,
    })
    cartaoDoFormulario.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function salvar(event) {
    event.preventDefault()
    setMensagem('')
    setErro('')

    const encontrados = validarRegistro(form)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const dados = {
      aluno: form.aluno.trim(),
      atividade: form.atividade.trim(),
      data: form.data,
      inicio: form.inicio,
      termino: form.termino,
    }

    setSalvando(true)

    try {
      if (editandoId) {
        await atualizarRegistro(editandoId, dados)
        setMensagem('Registro atualizado.')
      } else {
        await criarRegistro(dados)
        setMensagem('Atendimento registrado na ficha.')
      }

      limpar()
      await carregar()
    } catch (requestError) {
      setErro(requestError.response?.data?.message ?? 'Não foi possível salvar o registro. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function baixarPlanilha() {
    setMensagem('')
    setErro('')
    setExportando(true)

    try {
      await exportarFichaExcel(registros, nomeMonitor)
    } catch {
      setErro('Não foi possível gerar a planilha. Tente novamente.')
    } finally {
      setExportando(false)
    }
  }

  async function confirmarExclusao(id) {
    setMensagem('')
    setErro('')

    try {
      await excluirRegistro(id)
      if (editandoId === id) limpar()
      setExcluindoId(null)
      setMensagem('Registro excluído.')
      await carregar()
    } catch (requestError) {
      setErro(requestError.response?.data?.message ?? 'Não foi possível excluir o registro.')
    }
  }

  if (carregando) return <p className="text-sm text-[#315c50]" role="status">Carregando sua ficha...</p>

  return (
    <div className="grid gap-6">
      {erro && <div className="rounded-xl bg-[#fce8e5] px-4 py-3 text-sm text-[#a64e49]" role="alert">{erro}</div>}
      {mensagem && <div className="rounded-xl bg-[#e4f4e5] px-4 py-3 text-sm text-[#39734f]" role="status">{mensagem}</div>}

      <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
        <div className="rounded-2xl border border-[#e2e6df] bg-[#f6f9f4] p-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[.8px] text-[#769c8d]">Atendimentos registrados</p>
          <p className="m-0 mt-1 text-3xl font-bold text-[#2E4039]">{registros.length}</p>
        </div>
        <div className="rounded-2xl border border-[#e2e6df] bg-[#f6f9f4] p-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[.8px] text-[#769c8d]">Tempo total de atendimento</p>
          <p className="m-0 mt-1 text-3xl font-bold text-[#2E4039]">{formatarDuracao(totalMinutos)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <form
          ref={cartaoDoFormulario}
          onSubmit={salvar}
          noValidate
          className="grid min-w-72 max-w-120 flex-1 gap-4 rounded-2xl border border-[#e2e6df] bg-white p-6"
        >
          <h3 className="m-0 text-lg font-semibold">{editandoId ? 'Editar registro' : 'Novo registro'}</h3>

          <FormField
            label="Nome do aluno atendido"
            placeholder="Nome e sobrenome"
            value={form.aluno}
            erro={erros.aluno}
            onChange={(event) => alterar('aluno', event.target.value)}
          />

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-[#39544c]">Atividade realizada (resumo)</span>
            <textarea
              rows={4}
              maxLength={LIMITE_ATIVIDADE}
              value={form.atividade}
              onChange={(event) => alterar('atividade', event.target.value)}
              aria-invalid={Boolean(erros.atividade)}
              placeholder="Ex.: revisão de normalização de tabelas e resolução de exercícios."
              className={`w-full resize-y rounded-lg border bg-[#fbfcfa] px-3.5 py-3 text-sm text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:ring-4 ${
                erros.atividade
                  ? 'border-[#a34d46] focus:border-[#a34d46] focus:ring-[#a34d46]/15'
                  : 'border-[#d7e0d6] focus:border-[#769c8d] focus:ring-[#769c8d]/15'
              }`}
            />
            {erros.atividade ? (
              <span className="text-[11px] text-[#a34d46]" role="alert">{erros.atividade}</span>
            ) : (
              <span className="text-[11px] text-[#88958d]">{form.atividade.length}/{LIMITE_ATIVIDADE} caracteres</span>
            )}
          </label>

          <FormField label="Dia do atendimento" type="date" max={hojeEmIso()} value={form.data} erro={erros.data} onChange={(event) => alterar('data', event.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Início" type="time" value={form.inicio} erro={erros.inicio} onChange={(event) => alterar('inicio', event.target.value)} />
            <FormField label="Término" type="time" value={form.termino} erro={erros.termino} onChange={(event) => alterar('termino', event.target.value)} />
          </div>

          {duracaoDoForm > 0 && <p className="m-0 text-sm text-[#68766e]" aria-live="polite">Duração: {formatarDuracao(duracaoDoForm)}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="min-h-12 cursor-pointer rounded-xl border-0 bg-[#315c50] px-6 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Registrar atendimento'}
            </button>
            {editandoId && (
              <button type="button" onClick={limpar} className="min-h-12 cursor-pointer border-0 bg-transparent px-2 text-sm font-semibold text-[#315c50]">
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <section aria-labelledby="registros" className="min-w-0 flex-[999_1_380px] rounded-2xl border border-[#e2e6df] bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 id="registros" className="m-0 text-lg font-semibold">Minha ficha</h3>
            <button
              type="button"
              onClick={baixarPlanilha}
              disabled={registros.length === 0 || exportando}
              className="min-h-11 cursor-pointer rounded-lg border-[1.5px] border-[#315c50] bg-white px-4 text-sm font-bold text-[#315c50] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportando ? 'Gerando...' : 'Baixar planilha (Excel)'}
            </button>
          </div>

          {ordenados.length === 0 ? (
            <p className="m-0 rounded-[10px] bg-[#f3f1ea] px-4 py-4 text-sm text-[#68766e]">
              Você ainda não registrou nenhum atendimento.
            </p>
          ) : (
            <ul className="m-0 grid list-none gap-3 p-0">
              {ordenados.map((registro) => (
                <li
                  key={registro.id}
                  className={`grid gap-2 rounded-xl border p-4 ${registro.id === editandoId ? 'border-[#769c8d] bg-[#f6f9f4]' : 'border-[#e6ece2] bg-[#fbfcfa]'}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="m-0 text-base font-bold text-[#2E4039]">{registro.aluno}</p>
                    <p className="m-0 text-sm font-bold text-[#315c50]">
                      {formatarDataBr(registro.data)} · {registro.inicio} às {registro.termino} ({formatarDuracao(minutosEntre(registro.inicio, registro.termino))})
                    </p>
                  </div>

                  <p className="m-0 text-sm leading-relaxed text-[#4a5850]">{registro.atividade}</p>

                  <div className="flex flex-wrap items-center gap-4">
                    {excluindoId === registro.id ? (
                      <>
                        <span className="text-sm text-[#a34d46]">Excluir este registro?</span>
                        <button type="button" onClick={() => confirmarExclusao(registro.id)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-bold text-[#a34d46]">
                          Sim, excluir
                        </button>
                        <button type="button" onClick={() => setExcluindoId(null)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-semibold text-[#68766e]">
                          Não
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => editar(registro)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-bold text-[#315c50]">
                          Editar
                        </button>
                        <button type="button" onClick={() => setExcluindoId(registro.id)} className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-bold text-[#a34d46]">
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
