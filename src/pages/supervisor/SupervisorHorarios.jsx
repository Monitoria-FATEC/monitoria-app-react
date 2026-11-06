import { useCallback, useEffect, useMemo, useState } from 'react'

import { listarHorariosDosMonitores } from '../../api/horariosApi'
import { exportarHorariosPdf } from '../../utils/exportarHorarios'
import { agruparPorDia, formatarIntervalo } from '../../utils/horarios'

// Ignora maiúsculas e acentos: "matematica" encontra "Matemática Discreta".
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function formatarData(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function textoVigencia(horario) {
  if (!horario.vigenciaFim) return 'Vigência não informada'
  return `Vigência: ${formatarData(horario.vigenciaInicio)} a ${formatarData(horario.vigenciaFim)}`
}

const estiloCampo =
  'w-full rounded-lg border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-sm text-[#243d38] outline-none focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15'

// Aba do supervisor: todos os horários dos monitores, com PDF para expor na Fatec.
export default function SupervisorHorarios() {
  const [horarios, setHorarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [incluirEncerrados, setIncluirEncerrados] = useState(false)
  const [gerando, setGerando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      setHorarios(await listarHorariosDosMonitores())
    } catch {
      setErro('Não foi possível carregar os horários dos monitores.')
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

    return horarios.filter(
      (horario) =>
        (incluirEncerrados || horario.vigente) &&
        (!termo || normalizar(horario.disciplina).includes(termo) || normalizar(horario.nome).includes(termo)),
    )
  }, [horarios, busca, incluirEncerrados])

  // O PDF é para expor na Fatec: só entra quem está com a vigência em dia.
  const paraPdf = useMemo(() => filtrados.filter((horario) => horario.vigente), [filtrados])

  const dias = agruparPorDia(filtrados)
  const monitoresNaLista = new Set(filtrados.map((horario) => horario.monitorId)).size

  async function baixarPdf() {
    setErro('')
    setGerando(true)

    try {
      await exportarHorariosPdf(paraPdf, busca.trim() ? `Busca: ${busca.trim()}` : '')
    } catch {
      setErro('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  if (carregando) return <p className="text-sm text-[#315c50]" role="status">Carregando horários...</p>

  return (
    <div className="grid gap-5 px-6">
      {erro && <div className="rounded-xl bg-[#fce8e5] px-4 py-3 text-sm text-[#a64e49]" role="alert">{erro}</div>}

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-[#e2e6df] bg-white p-5">
        <label className="grid min-w-64 flex-1 gap-1.5">
          <span className="text-xs font-bold text-[#39544c]">Buscar por disciplina ou monitor</span>
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Ex.: matemática, banco de dados, Ana"
            className={estiloCampo}
          />
        </label>

        <label className="flex min-h-12 items-center gap-2 text-sm text-[#39544c]">
          <input
            type="checkbox"
            checked={incluirEncerrados}
            onChange={(event) => setIncluirEncerrados(event.target.checked)}
            className="h-5 w-5 accent-[#315c50]"
          />
          Incluir vigência encerrada
        </label>

        <button
          type="button"
          onClick={baixarPdf}
          disabled={gerando || paraPdf.length === 0}
          className="min-h-12 cursor-pointer rounded-xl border-0 bg-[#315c50] px-6 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {gerando ? 'Gerando PDF...' : 'Baixar PDF'}
        </button>
      </div>

      <p className="m-0 text-sm text-[#68766e]" role="status">
        {filtrados.length === 1 ? '1 horário' : `${filtrados.length} horários`} de{' '}
        {monitoresNaLista === 1 ? '1 monitor' : `${monitoresNaLista} monitores`}. O PDF usa a busca aplicada e só traz monitores com vigência em dia.
      </p>

      {dias.length === 0 ? (
        <p className="m-0 rounded-xl bg-[#f3f1ea] px-4 py-4 text-sm text-[#68766e]">Nenhum horário encontrado.</p>
      ) : (
        dias.map((dia) => (
          <section key={dia.valor} className="overflow-x-auto rounded-xl border border-[#e2e6df] bg-white">
            <table className="w-full min-w-135 border-collapse text-sm">
              <caption className="sr-only">Horários de {dia.rotulo}</caption>
              <thead>
                <tr className="bg-[#E9F0E5] text-left text-xs uppercase tracking-[.8px] text-[#39544c]">
                  <th scope="col" className="px-4 py-3" colSpan={4}>{dia.rotulo}</th>
                </tr>
              </thead>
              <tbody>
                {dia.horarios.map((horario) => (
                  <tr key={horario.id} className="border-t border-[#e6ece2]">
                    <th scope="row" className="w-40 px-4 py-3 text-left font-bold">{formatarIntervalo(horario)}</th>
                    <td className="px-4 py-3">
                      {horario.nome}
                      <span className="block text-xs text-[#68766e]">{textoVigencia(horario)}</span>
                      {!horario.vigente && (
                        <span className="mt-1 inline-block rounded-full bg-[#fce8e5] px-2 py-0.5 text-xs font-bold text-[#a64e49]">
                          Vigência encerrada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#68766e]">
                      {horario.disciplina}
                      {horario.professor && <span className="block text-xs">{horario.professor}</span>}
                    </td>
                    <td className="px-4 py-3 text-[#68766e]">{horario.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}
    </div>
  )
}
