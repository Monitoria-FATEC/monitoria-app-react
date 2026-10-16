import { useEffect, useMemo, useState } from 'react'
import {
  atualizarTermoCompromisso,
  buscarDashboardMonitor,
  desativarPerfilMonitor,
  salvarContaAgencia,
  salvarPerfilMonitor,
} from '../../api/monitorApi'
import { lerSessao } from '../../services/authStorage'
import { metaDasAbas } from '../../components/monitor/abasMonitor'
import ContaAgenciaForm from '../../components/monitor/ContaAgenciaForm'
import MonitorHeader from '../../components/monitor/MonitorHeader'
import MonitorInicio from '../../components/monitor/MonitorInicio'
import MonitorOverview from '../../components/monitor/MonitorOverview'
import MonitorSidebar from '../../components/monitor/MonitorSidebar'
import PerfilMonitorForm from '../../components/monitor/PerfilMonitorForm'
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
const termoInicial = {
  nomeEstudante: '',
  cpf: '',
  curso: '',
  disciplina: '',
  oferta: '',
  cargaHoraria: '',
  periodoInicio: '',
  periodoFim: '',
  editalNumero: '',
  nomeProfessor: '',
  nomeCoordenador: '',
  cidade: '',
  dataAssinatura: '',
  numeroVias: '',
}

export default function MonitorDashboard() {
  const sessao = lerSessao()
  const [dashboard, setDashboard] = useState(dashboardInicial)
  const [conta, setConta] = useState(contaInicial)
  const [perfil, setPerfil] = useState(perfilInicial)
  const [termo, setTermo] = useState(termoInicial)
  const [aba, setAba] = useState('inicio')
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
  const contaLiberada = dashboard.statusInscricao === 'HOMOLOGADA'
  const perfilLiberado = dashboard.statusContaAgencia === 'APROVADO'
  const statusGeral = !dashboard.perfilAtivo ? 'INATIVO' : perfilLiberado ? 'APROVADO' : 'AGUARDANDO'
  const meta = metaDasAbas[aba] ?? metaDasAbas.inicio

  // Devolve true quando salvou e false quando deu erro.
  async function executarAcao(acao, sucesso) {
    setErro('')
    setMensagem('')
    try {
      const dados = await acao()
      if (dados) setDashboard(dados)
      setMensagem(sucesso)
      if (!dados) await carregarDashboard()
      return true
    } catch (requestError) {
      setErro(requestError.response?.data?.message ?? 'Não foi possível salvar. Tente novamente.')
      return false
    }
  }

  function trocarAba(novaAba) {
    setErro('')
    setMensagem('')
    setAba(novaAba)
  }

  function preencherTermo() {
    setTermo({
      nomeEstudante: dashboard.nomeEstudanteTermo ?? '',
      cpf: dashboard.cpf ?? '',
      curso: dashboard.curso ?? '',
      disciplina: dashboard.disciplina ?? '',
      oferta: dashboard.oferta ?? '',
      cargaHoraria: dashboard.cargaHoraria ?? '',
      periodoInicio: dashboard.periodoInicio ?? '',
      periodoFim: dashboard.periodoFim ?? '',
      editalNumero: dashboard.editalNumero ?? '',
      nomeProfessor: dashboard.nomeProfessor ?? '',
      nomeCoordenador: dashboard.nomeCoordenador ?? '',
      cidade: dashboard.cidade ?? '',
      dataAssinatura: dashboard.dataAssinatura ?? '',
      numeroVias: dashboard.numeroVias ?? '',
    })
    trocarAba('termo')
  }

  function desativarPerfil() {
    const confirmou = window.confirm('Deseja desativar seu perfil? Ele não será excluído e poderá ser reativado pela supervisão.')
    if (confirmou) executarAcao(() => desativarPerfilMonitor(), 'Perfil desativado. Procure a supervisão caso queira reativá-lo.')
  }

  if (carregando) return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f2] text-[#315c50]">Carregando seu dashboard...</div>

  return (
    <div className="flex min-h-screen w-full flex-col text-[#243d38] lg:flex-row">
      <MonitorSidebar aba={aba} onChange={trocarAba} nome={nomeMonitor} email={emailMonitor} />

      <div className="flex flex-1 flex-col bg-white">
        <MonitorHeader titulo={meta.titulo} nome={nomeMonitor} status={statusGeral} />

        <div className="w-full flex-1 bg-[#E9F0E5] pb-2 pr-2">
          <main className="h-full rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="p-6">
              <p className="mb-4 uppercase text-[#939E95]">{hoje}</p>
              <h2 className="mb-2 text-xl font-medium">{meta.subtitulo}</h2>
              <p className="mb-2 text-[#939E95]">{meta.desc}</p>
            </div>

            <div className="px-6 pb-6">
              {erro && <div className="mb-5 rounded-xl bg-[#fce8e5] px-4 py-3 text-sm text-[#a64e49]" role="alert">{erro}</div>}
              {mensagem && <div className="mb-5 rounded-xl bg-[#e4f4e5] px-4 py-3 text-sm text-[#39734f]" role="status">{mensagem}</div>}

              {aba === 'inicio' && (
                <MonitorInicio
                  dashboard={dashboard}
                  contaLiberada={contaLiberada}
                  perfilLiberado={perfilLiberado}
                  onEditarTermo={preencherTermo}
                  onIrPara={trocarAba}
                />
              )}

              {aba === 'visao-geral' && (
                <MonitorOverview
                  dashboard={dashboard}
                  contaLiberada={contaLiberada}
                  perfilLiberado={perfilLiberado}
                  onEditarTermo={preencherTermo}
                  onAbrirConta={() => trocarAba('conta')}
                  onAbrirPerfil={() => trocarAba('perfil')}
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
                  temAssinatura={dashboard.temAssinatura}
                  onSubmit={async (dadosDoTermo) => {
                    // o PUT devolve só um resumo do termo, então não pode virar o dashboard:
                    // por isso retorna null e o dashboard é recarregado do back
                    const salvou = await executarAcao(async () => {
                      await atualizarTermoCompromisso(dashboard.termoId, dadosDoTermo)
                      return null
                    }, 'Termo reenviado para análise.')
                    if (salvou) setAba('inicio')
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
    </div>
  )
}