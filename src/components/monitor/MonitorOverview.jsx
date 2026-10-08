import StatusCard from './StatusCard'

function formatarData(valor) {
  if (!valor) return 'Não informado'
  const [ano, mes, dia] = String(valor).split('T')[0].split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : valor
}

function valorOuNaoInformado(valor) {
  return valor === null || valor === undefined || valor === '' ? 'Não informado' : valor
}

export default function MonitorOverview({ dashboard, contaLiberada, perfilLiberado, onEditarTermo, onAbrirConta, onAbrirPerfil }) {
  return (
    <>
      <div className="mb-7 grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Status do termo"
          status={dashboard.statusTermo}
          description={dashboard.statusTermo === 'DEVOLVIDO' ? dashboard.justificativaTermo || 'Seu termo foi devolvido para correção.' : dashboard.dataEnvioTermo ? `Enviado em ${formatarData(dashboard.dataEnvioTermo)}.` : 'Nenhum termo enviado para análise.'}
        >
          {dashboard.statusTermo === 'DEVOLVIDO' && <button type="button" onClick={onEditarTermo} className="mt-4 text-sm font-bold text-[#2E4039] underline underline-offset-4">Editar termo →</button>}
        </StatusCard>

        <StatusCard
          title="Conta e agência"
          status={dashboard.statusContaAgencia}
          description={!contaLiberada ? 'O formulário será liberado depois que o termo for aprovado.' : dashboard.statusContaAgencia === 'DEVOLVIDO' ? dashboard.justificativaContaAgencia || 'Confira os dados informados e envie novamente.' : dashboard.numeroConta && dashboard.agencia ? 'Dados enviados para análise da supervisão.' : 'Ainda não há dados bancários enviados.'}
        >
          {contaLiberada && dashboard.statusContaAgencia === 'DEVOLVIDO' && <button type="button" onClick={onAbrirConta} className="mt-4 text-sm font-bold text-[#2E4039] underline underline-offset-4">Corrigir dados →</button>}
        </StatusCard>

        <StatusCard
          title="Perfil de atendimento"
          status={perfilLiberado ? 'APROVADO' : 'AGUARDANDO'}
          description={perfilLiberado ? 'As informações de atendimento estão liberadas para edição.' : 'Será liberado após a aprovação da conta e agência.'}
        >
          {perfilLiberado && <button type="button" onClick={onAbrirPerfil} className="mt-4 text-sm font-bold text-[#2E4039] underline underline-offset-4">Editar perfil →</button>}
        </StatusCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <p className="mb-4 uppercase text-[#939E95] text-sm">Dados do monitor</p>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-[#939E95]">Nome</p><p className="font-bold text-[#2E4039]">{valorOuNaoInformado(dashboard.nome)}</p></div>
            <div><p className="text-[#939E95]">RA</p><p className="font-bold text-[#2E4039]">{valorOuNaoInformado(dashboard.ra)}</p></div>
            <div><p className="text-[#939E95]">Curso</p><p className="font-bold text-[#2E4039]">{valorOuNaoInformado(dashboard.curso)}</p></div>
            <div><p className="text-[#939E95]">Status da inscrição</p><p className="font-bold text-[#2E4039]">{valorOuNaoInformado(dashboard.statusInscricao)}</p></div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <p className="mb-4 uppercase text-[#939E95] text-sm">Termo enviado</p>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-[#939E95]">Disciplina</p><p className="font-bold text-[#2E4039]">{valorOuNaoInformado(dashboard.disciplina)}</p></div>
            <div><p className="text-[#939E95]">Oferta</p><p className="font-bold text-[#2E4039]">{valorOuNaoInformado(dashboard.oferta)}</p></div>
            <div><p className="text-[#939E95]">Carga horária</p><p className="font-bold text-[#2E4039]">{dashboard.cargaHoraria ? `${dashboard.cargaHoraria} horas` : 'Não informado'}</p></div>
            <div><p className="text-[#939E95]">Período</p><p className="font-bold text-[#2E4039]">{dashboard.periodoInicio || dashboard.periodoFim ? `${formatarData(dashboard.periodoInicio)} a ${formatarData(dashboard.periodoFim)}` : 'Não informado'}</p></div>
          </div>
        </section>
      </div>
    </>
  )
}
