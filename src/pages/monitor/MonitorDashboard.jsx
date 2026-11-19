import { useEffect, useMemo, useState } from 'react'
import {
  atualizarTermoCompromisso,
  buscarDashboardMonitor,
  desativarPerfilMonitor,
  marcarAvisoPerfilLido,
  salvarContaAgencia,
  salvarPerfilMonitor,
} from '../../api/monitorApi'
import { lerSessao } from '../../services/authStorage'
import { abasMonitor, metaDasAbas } from '../../components/monitor/abasMonitor'
import AvisoPerfilEditado from '../../components/monitor/AvisoPerfilEditado'
import ContaAgenciaForm from '../../components/monitor/ContaAgenciaForm'
import FichaAtendimentos from '../../components/monitor/FichaAtendimentos'
import MonitorHorarios from '../../components/monitor/MonitorHorarios'
import MonitorInicio from '../../components/monitor/MonitorInicio'
import MonitorOverview from '../../components/monitor/MonitorOverview'
import PerfilMonitorForm from '../../components/monitor/PerfilMonitorForm'
import TermoForm from '../../components/monitor/TermoForm'
import SidebarMenu, { BotaoAbrirMenu } from '../../components/SidebarMenu'
import PainelHeader from '../../components/PainelHeader'
import StatusBadge from '../../components/monitor/StatusBadge'
import useMenuLateral from '../../hooks/useMenuLateral'

const dashboardInicial = {
  nome: '',
  email: '',
  statusTermo: 'AGUARDANDO',
  statusContaAgencia: 'AGUARDANDO',
  perfilAtivo: true,
}

const MENU_ID = 'menu-monitor'

const contaInicial = { numeroConta: '', agencia: '' }
const perfilInicial = {
  telefone: '',
  linkWhatsapp: '',
  linkTeams: '',
  compartilharContato: false,
  vigenciaInicio: '',
  vigenciaFim: '',
}
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
  const [lendoAviso, setLendoAviso] = useState(false)
  const menu = useMenuLateral()

  async function carregarDashboard() {
    try {
      const dados = await buscarDashboardMonitor()
      setDashboard(dados)
      setConta({ numeroConta: dados.numeroConta ?? '', agencia: dados.agencia ?? '' })
      setPerfil({
        telefone: dados.telefone ?? '',
        linkWhatsapp: dados.linkWhatsapp ?? '',
        linkTeams: dados.linkTeams ?? '',
        compartilharContato: Boolean(dados.compartilharContato),
        // sem vigência própria, começa com o período do termo de compromisso
        vigenciaInicio: dados.vigenciaInicio ?? dados.periodoInicio ?? '',
        vigenciaFim: dados.vigenciaFim ?? dados.periodoFim ?? '',
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

  // enquanto edita o termo, o item "Visão geral" continua destacado
  const abaDoMenu = aba === 'termo' ? 'visao-geral' : aba
  const itensDoMenu = abasMonitor.map((item) => ({
    ...item,
    ativo: abaDoMenu === item.id,
    onClick: () => trocarAba(item.id),
  }))

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

  async function entendiAviso() {
    setLendoAviso(true)
    try {
      setDashboard(await marcarAvisoPerfilLido())
    } catch {
      setErro('Não foi possível fechar o aviso. Tente novamente.')
    } finally {
      setLendoAviso(false)
    }
  }

  function desativarPerfil() {
    const confirmou = window.confirm('Deseja desativar seu perfil? Ele não será excluído e poderá ser reativado pela supervisão.')
    if (confirmou) executarAcao(() => desativarPerfilMonitor(), 'Perfil desativado. Procure a supervisão caso queira reativá-lo.')
  }

  if (carregando) return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f2] text-[#315c50]">Carregando seu dashboard...</div>

  return (
    <div className="flex min-h-screen w-full text-[#243d38]">
      <SidebarMenu
        id={MENU_ID}
        label="Menu do monitor"
        itens={itensDoMenu}
        aberto={menu.aberto}
        onFechar={menu.fechar}
        botaoFecharRef={menu.botaoFecharRef}
        usuario={{ nome: nomeMonitor, email: emailMonitor }}
      />

      {/* inert: com a gaveta aberta, o teclado não alcança a página atrás dela */}
      <div inert={menu.aberto} className="flex min-w-0 flex-1 flex-col bg-white">
        <PainelHeader
          titulo={meta.titulo}
          botaoMenu={
            <BotaoAbrirMenu aberto={menu.aberto} onAbrir={menu.abrir} botaoRef={menu.botaoAbrirRef} controla={MENU_ID} />
          }
        >
          <StatusBadge status={statusGeral} />
        </PainelHeader>

        <div className="w-full flex-1 bg-[#E9F0E5] md:pb-2 md:pr-2">
          <main className="h-full min-w-0 rounded-t-2xl border border-gray-200 bg-white shadow-md md:rounded-2xl">
            <div className="p-6">
              <p className="mb-4 uppercase text-[#939E95]">{hoje}</p>
              <h2 className="mb-2 text-xl font-medium">{meta.subtitulo}</h2>
              <p className="mb-2 text-[#939E95]">{meta.desc}</p>
            </div>

            <div className="px-6 pb-6">
              <AvisoPerfilEditado dashboard={dashboard} onEntendi={entendiAviso} lendo={lendoAviso} />
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
                  dashboard={dashboard}
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

              {aba === 'horarios' && (
                perfilLiberado ? (
                  <MonitorHorarios />
                ) : (
                  <div className="rounded-xl bg-[#f3f1ea] px-4 py-4 text-sm text-[#68766e]">
                    Os horários ficam disponíveis depois que a supervisão aprovar sua conta e agência.
                  </div>
                )
              )}

              {aba === 'atendimentos' && (
                perfilLiberado ? (
                  <FichaAtendimentos nomeMonitor={nomeMonitor} dadosMonitor={dashboard} />
                ) : (
                  <div className="rounded-xl bg-[#f3f1ea] px-4 py-4 text-sm text-[#68766e]">
                    O registro de atendimentos fica disponível depois que a supervisão aprovar sua conta e agência.
                  </div>
                )
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