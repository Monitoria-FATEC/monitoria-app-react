import { useNavigate } from 'react-router-dom'

function formatarData(valor) {
  if (!valor) return ''
  const [ano, mes, dia] = String(valor).split('T')[0].split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : valor
}

const estilos = {
  ok: { bolinha: 'bg-[#315c50] text-white', simbolo: '✓', titulo: 'text-[#243d38]' },
  atual: { bolinha: 'bg-[#f6e7b4] text-[#8a6a14]', simbolo: '•', titulo: 'text-[#243d38]' },
  problema: { bolinha: 'bg-[#fce8e5] text-[#a64e49]', simbolo: '!', titulo: 'text-[#a64e49]' },
  pendente: { bolinha: 'bg-[#e9ece7] text-[#939E95]', simbolo: '', titulo: 'text-[#939E95]' },
}

// As 4 etapas da jornada e em que ponto cada uma está.
function montarEtapas(d, contaLiberada, perfilLiberado) {
  const termoDevolvido = d.statusTermo === 'DEVOLVIDO'
  const inscricao = d.statusInscricao

  const termo = termoDevolvido
    ? { estado: 'problema', descricao: 'Devolvido para correção.' }
    : d.dataEnvioTermo
      ? { estado: 'ok', descricao: `Enviado em ${formatarData(d.dataEnvioTermo)}.` }
      : { estado: 'atual', descricao: 'Ainda não enviado.' }

  let analise
  if (inscricao === 'HOMOLOGADA') analise = { estado: 'ok', descricao: 'Termo homologado.' }
  else if (inscricao === 'AGUARDANDO_GESTAO') analise = { estado: 'atual', descricao: 'Aprovado pelo supervisor. Com a Gestão para assinatura.' }
  else if (inscricao === 'AGUARDANDO_SUPERVISOR') analise = { estado: 'atual', descricao: 'Com o supervisor para análise.' }
  else if (inscricao === 'DEVOLVIDA') analise = { estado: 'problema', descricao: 'Devolvida: corrija o termo e reenvie.' }
  else if (inscricao === 'RECUSADA') analise = { estado: 'problema', descricao: 'Inscrição recusada.' }
  else analise = { estado: 'pendente', descricao: 'Começa depois do envio do termo.' }

  let conta
  if (!contaLiberada) conta = { estado: 'pendente', descricao: 'Liberada depois que o termo for homologado.' }
  else if (d.statusContaAgencia === 'APROVADO') conta = { estado: 'ok', descricao: 'Aprovada pela supervisão.' }
  else if (d.statusContaAgencia === 'DEVOLVIDO') conta = { estado: 'problema', descricao: 'Devolvida: corrija os dados e reenvie.' }
  else if (d.numeroConta && d.agencia) conta = { estado: 'atual', descricao: 'Enviada, em análise pela supervisão.' }
  else conta = { estado: 'atual', descricao: 'Envie o número da conta e a agência.' }

  const perfilPreenchido = Boolean(d.telefone || d.localAtendimento || d.horariosAtendimento || d.linkWhatsapp || d.linkTeams)
  let perfil
  if (!perfilLiberado) perfil = { estado: 'pendente', descricao: 'Liberado depois da aprovação da conta e agência.' }
  else if (perfilPreenchido) perfil = { estado: 'ok', descricao: 'Informações de atendimento preenchidas.' }
  else perfil = { estado: 'atual', descricao: 'Preencha como os alunos podem encontrar você.' }

  return [
    { titulo: 'Termo de compromisso', ...termo },
    { titulo: 'Análise e homologação', ...analise },
    { titulo: 'Conta e agência', ...conta },
    { titulo: 'Perfil de atendimento', ...perfil },
  ]
}

// Qual é o próximo passo, com o botão certo para ele.
function proximoPasso(d, contaLiberada, perfilLiberado) {
  const inscricao = d.statusInscricao

  if (d.perfilAtivo === false) {
    return { titulo: 'Seu perfil está desativado', texto: 'Procure a supervisão para reativá-lo.' }
  }

  if (d.statusTermo === 'DEVOLVIDO') {
    const prazo = d.dataLimiteTermo ? ` Prazo para corrigir: ${formatarData(d.dataLimiteTermo)}.` : ''
    return {
      titulo: 'Seu termo foi devolvido',
      texto: `${d.justificativaTermo || 'O supervisor pediu uma correção.'}${prazo}`,
      botao: { rotulo: 'Editar termo', acao: 'termo' },
    }
  }

  if (inscricao === 'RECUSADA') {
    return { titulo: 'Sua inscrição foi recusada', texto: 'Procure a supervisão para saber os próximos passos.' }
  }

  if (!inscricao) {
    return {
      titulo: 'Envie o seu termo',
      texto: 'Você ainda não enviou o termo de compromisso. Preencha e assine para começar a análise.',
      botao: { rotulo: 'Preencher termo', acao: 'preencher-termo' },
    }
  }

  if (inscricao === 'AGUARDANDO_SUPERVISOR') {
    return { titulo: 'Seu termo está em análise', texto: 'O supervisor está conferindo o seu termo. Não precisa fazer nada por enquanto.' }
  }

  if (inscricao === 'AGUARDANDO_GESTAO') {
    return { titulo: 'Aguardando a Gestão', texto: 'O supervisor aprovou. Agora o termo está com a Gestão para assinatura e homologação.' }
  }

  if (contaLiberada && d.statusContaAgencia === 'DEVOLVIDO') {
    const prazo = d.dataLimiteContaAgencia ? ` Prazo para corrigir: ${formatarData(d.dataLimiteContaAgencia)}.` : ''
    return {
      titulo: 'Conta e agência devolvidas',
      texto: `${d.justificativaContaAgencia || 'Confira os dados informados e envie novamente.'}${prazo}`,
      botao: { rotulo: 'Corrigir dados', acao: 'conta' },
    }
  }

  if (contaLiberada && !(d.numeroConta && d.agencia)) {
    return {
      titulo: 'Termo homologado!',
      texto: 'Agora informe o número da conta e a agência para o pagamento.',
      botao: { rotulo: 'Enviar conta e agência', acao: 'conta' },
    }
  }

  if (contaLiberada && d.statusContaAgencia !== 'APROVADO') {
    return { titulo: 'Conta e agência em análise', texto: 'A supervisão está conferindo os dados que você enviou.' }
  }

  if (perfilLiberado) {
    return {
      titulo: 'Tudo certo com a sua inscrição',
      texto: 'Mantenha seu perfil de atendimento atualizado para os alunos encontrarem você.',
      botao: { rotulo: 'Editar perfil', acao: 'perfil' },
    }
  }

  return { titulo: 'Tudo em dia', texto: 'Não há nada pendente no momento.' }
}

export default function MonitorInicio({ dashboard, contaLiberada, perfilLiberado, onEditarTermo, onIrPara }) {
  const navigate = useNavigate()
  const primeiroNome = (dashboard.nome || 'Monitor').split(' ')[0]
  const etapas = montarEtapas(dashboard, contaLiberada, perfilLiberado)
  const passo = proximoPasso(dashboard, contaLiberada, perfilLiberado)

  // Primeiro envio do termo: abre o formulário com os dados que já estão no cadastro do monitor.
  function irParaTermo() {
    navigate('/cadastro/termo', {
      state: {
        nome: dashboard.nome,
        ra: dashboard.ra,
        email: dashboard.email,
        curso: dashboard.curso,
        idMonitor: dashboard.id,
      },
    })
  }

  function clicarBotao() {
    if (passo.botao.acao === 'preencher-termo') irParaTermo()
    else if (passo.botao.acao === 'termo') onEditarTermo()
    else onIrPara(passo.botao.acao)
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="m-0 font-sans text-4xl font-normal tracking-[-1.5px]">Olá, {primeiroNome}</h2>
        <p className="mt-2 text-sm text-[#8a958e]">Aqui está o andamento da sua jornada de monitoria.</p>
      </div>

      <section className="rounded-2xl border border-[#e2e6df] bg-[#f6f9f4] p-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#769c8d]">O que fazer agora</p>
        <h3 className="m-0 text-xl font-bold text-[#2E4039]">{passo.titulo}</h3>
        <p className="mt-2 mb-0 text-sm leading-relaxed text-[#68766e]">{passo.texto}</p>

        {passo.botao && (
          <button
            type="button"
            onClick={clicarBotao}
            className="mt-4 rounded-lg bg-[#315c50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24483d]"
          >
            {passo.botao.rotulo} →
          </button>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
        <p className="mb-5 text-sm uppercase text-[#939E95]">Sua jornada</p>

        <ol className="m-0 grid list-none gap-5 p-0">
          {etapas.map((etapa, indice) => {
            const estilo = estilos[etapa.estado]

            return (
              <li key={etapa.titulo} className="flex items-start gap-4">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${estilo.bolinha}`}
                  aria-hidden="true"
                >
                  {estilo.simbolo || indice + 1}
                </span>

                <div>
                  <p className={`m-0 font-bold ${estilo.titulo}`}>{etapa.titulo}</p>
                  <p className="m-0 mt-0.5 text-sm text-[#68766e]">{etapa.descricao}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}