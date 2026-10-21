import FormField from './FormField'

function formatarData(iso) {
  if (!iso) return null
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : null
}

function Resumo({ titulo, texto, cor, conta, agencia }) {
  return (
    <div className="grid gap-4">
      <div className={`rounded-xl p-4 text-sm ${cor}`} role="status">
        <strong className="block">{titulo}</strong>
        <span>{texto}</span>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e2e6df] bg-[#fbfcfa] p-4">
          <dt className="text-xs font-bold uppercase tracking-[.08em] text-[#769c8d]">Número da conta</dt>
          <dd className="m-0 mt-1 text-base font-semibold text-[#243d38]">{conta}</dd>
        </div>
        <div className="rounded-xl border border-[#e2e6df] bg-[#fbfcfa] p-4">
          <dt className="text-xs font-bold uppercase tracking-[.08em] text-[#769c8d]">Agência</dt>
          <dd className="m-0 mt-1 text-base font-semibold text-[#243d38]">{agencia}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function ContaAgenciaForm({ liberado, dashboard, conta, onChange, onSubmit }) {
  const status = dashboard?.statusContaAgencia
  const jaEnviou = Boolean(dashboard?.numeroConta && dashboard?.agencia)
  const devolvida = status === 'DEVOLVIDO'
  const aprovada = status === 'APROVADO'

  // Depois de enviado, só abre de novo se o supervisor devolver.
  const travada = liberado && jaEnviou && !devolvida
  const prazo = formatarData(dashboard?.dataLimiteContaAgencia)

  return (
    <section className="max-w-[650px] rounded-2xl border border-[#e2e6df] bg-white p-6 sm:p-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#769c8d]">DADOS PARA PAGAMENTO</p>
      <h2 className="mb-2 font-sans text-3xl font-normal">Conta e agência</h2>
      <p className="mb-7 text-sm leading-relaxed text-[#68766e]">Informe apenas o número da conta e a agência. O envio ficará aguardando análise da supervisão.</p>

      {!liberado ? (
        <div className="rounded-xl bg-[#fff6d8] p-4 text-sm text-[#856c31]">Este formulário será liberado somente após o termo constar como aprovado.</div>
      ) : travada ? (
        <Resumo
          titulo={aprovada ? 'Conta e agência aprovadas' : 'Dados enviados para análise'}
          texto={
            aprovada
              ? 'A supervisão confirmou seus dados. Para alterar, fale com a supervisão.'
              : 'A supervisão está conferindo. Você poderá corrigir só se ela devolver o formulário.'
          }
          cor={aprovada ? 'bg-[#e4f4e5] text-[#39734f]' : 'bg-[#fff6d8] text-[#856c31]'}
          conta={dashboard.numeroConta}
          agencia={dashboard.agencia}
        />
      ) : (
        <form className="grid gap-5" onSubmit={onSubmit}>
          {devolvida && (
            <div className="rounded-xl bg-[#fce8e5] p-4 text-sm text-[#a64e49]" role="alert">
              <strong className="block">A supervisão devolveu seus dados</strong>
              <span>{dashboard.justificativaContaAgencia || 'Confira as informações e envie novamente.'}</span>
              {prazo && <span className="mt-1 block">Prazo para corrigir: {prazo}</span>}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Número da conta" value={conta.numeroConta} onChange={(event) => onChange({ ...conta, numeroConta: event.target.value })} required />
            <FormField label="Agência" value={conta.agencia} onChange={(event) => onChange({ ...conta, agencia: event.target.value })} required />
          </div>
          <button className="rounded-lg bg-[#315c50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24483d]">
            {devolvida ? 'Reenviar para análise →' : 'Enviar para análise →'}
          </button>
        </form>
      )}
    </section>
  )
}