import FormField from './FormField'

export default function PerfilMonitorForm({ liberado, perfil, onChange, onSubmit }) {
  return (
    <section className="max-w-[760px] rounded-2xl border border-[#e2e6df] bg-white p-6 sm:p-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#769c8d]">INFORMAÇÕES DE ATENDIMENTO</p>
      <h2 className="mb-2 font-sans text-3xl font-normal">Meu perfil</h2>
      <p className="mb-7 text-sm leading-relaxed text-[#68766e]">Informe como os alunos poderão encontrar você.</p>

      {!liberado ? (
        <div className="rounded-xl bg-[#fff6d8] p-4 text-sm text-[#856c31]">A edição do perfil será liberada somente após a aprovação da conta e agência.</div>
      ) : (
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Telefone para contato" value={perfil.telefone} onChange={(event) => onChange({ ...perfil, telefone: event.target.value })} />
            <FormField label="Local de atendimento" value={perfil.localAtendimento} onChange={(event) => onChange({ ...perfil, localAtendimento: event.target.value })} />
          </div>
          <FormField label="Horários de atendimento" value={perfil.horariosAtendimento} onChange={(event) => onChange({ ...perfil, horariosAtendimento: event.target.value })} placeholder="Ex.: terça e quinta, das 14h às 17h" />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Link do WhatsApp" value={perfil.linkWhatsapp} onChange={(event) => onChange({ ...perfil, linkWhatsapp: event.target.value })} />
            <FormField label="Link do Teams" value={perfil.linkTeams} onChange={(event) => onChange({ ...perfil, linkTeams: event.target.value })} />
          </div>
          <button className="rounded-lg bg-[#315c50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24483d]">Salvar perfil →</button>
        </form>
      )}
    </section>
  )
}
