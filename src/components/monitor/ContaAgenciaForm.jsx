import FormField from './FormField'

export default function ContaAgenciaForm({ liberado, conta, onChange, onSubmit }) {
  return (
    <section className="max-w-[650px] rounded-2xl border border-[#e2e6df] bg-white p-6 sm:p-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#769c8d]">DADOS PARA PAGAMENTO</p>
      <h2 className="mb-2 font-sans text-3xl font-normal">Conta e agência</h2>
      <p className="mb-7 text-sm leading-relaxed text-[#68766e]">Informe apenas o número da conta e a agência. O envio ficará aguardando análise da supervisão.</p>

      {!liberado ? (
        <div className="rounded-xl bg-[#fff6d8] p-4 text-sm text-[#856c31]">Este formulário será liberado somente após o termo constar como aprovado.</div>
      ) : (
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Número da conta" value={conta.numeroConta} onChange={(event) => onChange({ ...conta, numeroConta: event.target.value })} required />
            <FormField label="Agência" value={conta.agencia} onChange={(event) => onChange({ ...conta, agencia: event.target.value })} required />
          </div>
          <button className="rounded-lg bg-[#315c50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24483d]">Enviar para análise →</button>
        </form>
      )}
    </section>
  )
}
