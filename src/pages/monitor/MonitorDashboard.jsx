import { useEffect, useMemo, useState } from 'react'
import {
  atualizarTermoCompromisso,
  buscarDashboardMonitor,
  desativarPerfilMonitor,
  salvarContaAgencia,
  salvarPerfilMonitor,
} from '../../api/monitorApi'
import { lerSessao } from '../../services/authStorage'
import ContaAgenciaForm from '../../components/monitor/ContaAgenciaForm'
import MonitorOverview from '../../components/monitor/MonitorOverview'
import MonitorSidebar from '../../components/monitor/MonitorSidebar'
import PerfilMonitorForm from '../../components/monitor/PerfilMonitorForm'
import StatusBadge from '../../components/monitor/StatusBadge'
import TermoForm from '../../components/monitor/TermoForm'

const dashboardInicial = {
  nome: '',
  email: '',
  statusTermo: 'AGUARDANDO',
  statusContaAgencia: 'AGUARDANDO',
  perfilAtivo: true,
}

const contaInicial = { numeroConta: '', agencia: '' }
const perfilInicial = { telefone: '', localAtendimento: '', horariosAtendimento: '', linkWhatsapp: '', linkTeams: '' }
const termoInicial = { disciplina: '', oferta: '', cargaHoraria: '', periodoInicio: '', periodoFim: '' }

export default function MonitorDashboard() {
  const sessao = lerSessao()
  const [dashboard, setDashboard] = useState(dashboardInicial)
  const [conta, setConta] = useState(contaInicial)
  const [perfil, setPerfil] = useState(perfilInicial)
  const [termo, setTermo] = useState(termoInicial)
  const [aba, setAba] = useState('visao-geral')
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  async function carregarDashboard() {
    try {
      const dados = await buscarDashboardMonitor()
      setDashboard(dados)
      setConta({ numeroConta: dados.numeroConta ?? '', agencia: dados.agencia ?? '' })
      setPerfil({
        telefone: dados.telefone ?? '',
        localAtendimento: dados.localAtendimento ?? '',
        horariosAtendimento: dados.horariosAtendimento ?? '',
        linkWhatsapp: dados.linkWhatsapp ?? '',
        linkTeams: dados.linkTeams ?? '',
      })
    } catch (requestError) {
      console.error(requestError)
      setErro('Não foi possível carregar os dados do seu dashboard.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => carregarDashboard(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const hoje = useMemo(
    () => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
    [],
  )
  const nomeMonitor = dashboard.nome || sessao?.usuario?.nome || 'Monitor'
  const emailMonitor = dashboard.email || sessao?.usuario?.email || ''
  const contaLiberada = dashboard.statusTermo === 'APROVADO'
  const perfilLiberado = dashboard.statusContaAgencia === 'APROVADO'

  async function executarAcao(acao, sucesso) {
    setErro('')
    setMensagem('')
    try {
      const dados = await acao()
      if (dados) setDashboard(dados)
      setMensagem(sucesso)
      if (!dados) await carregarDashboard()
    } catch (requestError) {
      setErro(requestError.response?.data?.message ?? 'Não foi possível salvar. Tente novamente.')
    }
  }

  function preencherTermo() {
    setTermo({
      disciplina: dashboard.disciplina ?? '',
      oferta: dashboard.oferta ?? '',
      cargaHoraria: dashboard.cargaHoraria ?? '',
      periodoInicio: dashboard.periodoInicio ?? '',
      periodoFim: dashboard.periodoFim ?? '',
    })
    setAba('termo')
  }

  function desativarPerfil() {
    const confirmou = window.confirm('Deseja desativar seu perfil? Ele não será excluído e poderá ser reativado pela supervisão.')
    if (confirmou) executarAcao(() => desativarPerfilMonitor(), 'Perfil desativado. Procure a supervisão caso queira reativá-lo.')
  }

  if (carregando) return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f2] text-[#315c50]">Carregando seu dashboard...</div>

  return (
    <div className="min-h-screen bg-[#E9F0E5] text-[#243d38]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <MonitorSidebar aba={aba} onChange={setAba} nome={nomeMonitor} email={emailMonitor} />

        <main className="w-full bg-[#E9F0E5] px-2 py-2 sm:px-4 lg:ml-0 lg:px-2 lg:py-2">
          <div className="mx-auto min-h-[calc(100vh-16px)] max-w-[1200px] rounded-2xl border border-gray-200 bg-white p-5 shadow-md sm:p-8 lg:p-10">
            <header className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#9aa59d]">{hoje}</p>
                <h1 className="m-0 font-sans text-4xl font-normal tracking-[-1.5px] sm:text-5xl">Olá, {nomeMonitor.split(' ')[0]}</h1>
                <p className="mt-2 text-sm text-[#8a958e]">Aqui está o resumo da sua jornada de monitoria.</p>
              </div>
              <StatusBadge status={!dashboard.perfilAtivo ? 'INATIVO' : perfilLiberado ? 'APROVADO' : 'AGUARDANDO'} />
            </header>

            {erro && <div className="mb-5 rounded-xl bg-[#fce8e5] px-4 py-3 text-sm text-[#a64e49]" role="alert">{erro}</div>}
            {mensagem && <div className="mb-5 rounded-xl bg-[#e4f4e5] px-4 py-3 text-sm text-[#39734f]" role="status">{mensagem}</div>}

            {aba === 'visao-geral' && (
              <MonitorOverview
                dashboard={dashboard}
                contaLiberada={contaLiberada}
                perfilLiberado={perfilLiberado}
                onEditarTermo={preencherTermo}
                onAbrirConta={() => setAba('conta')}
                onAbrirPerfil={() => setAba('perfil')}
              />
            )}

            {aba === 'conta' && (
              <ContaAgenciaForm
                liberado={contaLiberada}
                conta={conta}
                onChange={setConta}
                onSubmit={(event) => {
                  event.preventDefault()
                  executarAcao(() => salvarContaAgencia(conta), 'Dados enviados para análise.')
                }}
              />
            )}

            {aba === 'perfil' && (
              <PerfilMonitorForm
                liberado={perfilLiberado}
                perfil={perfil}
                onChange={setPerfil}
                onSubmit={(event) => {
                  event.preventDefault()
                  executarAcao(() => salvarPerfilMonitor(perfil), 'Perfil atualizado com sucesso.')
                }}
              />
            )}

            {aba === 'termo' && (
              <TermoForm
                termo={termo}
                onChange={setTermo}
                onSubmit={(event) => {
                  event.preventDefault()
                  executarAcao(() => atualizarTermoCompromisso(dashboard.termoId, termo), 'Termo reenviado para análise.')
                }}
              />
            )}

            <section className="mt-8 border-t border-[#e2e6df] pt-6">
              <button type="button" onClick={desativarPerfil} className="text-sm font-semibold text-[#a64e49] underline underline-offset-4">Desativar perfil</button>
              <p className="mt-2 text-xs text-[#8a958e]">Seu cadastro não será excluído. Apenas ficará indisponível para novos atendimentos.</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
