import FormField from './FormField'

export default function TermoForm({ termo, onChange, onSubmit }) {
  return (
    <section className="max-w-[760px] rounded-2xl border border-[#e2e6df] bg-white p-6 sm:p-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#769c8d]">AJUSTE NECESSÁRIO</p>
      <h2 className="mb-2 font-sans text-3xl font-normal">Editar termo</h2>
      <p className="mb-7 text-sm leading-relaxed text-[#68766e]">Corrija os campos solicitados e reenvie o termo para uma nova análise.</p>
      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Disciplina" value={termo.disciplina} onChange={(event) => onChange({ ...termo, disciplina: event.target.value })} required />
          <FormField label="Oferta" value={termo.oferta} onChange={(event) => onChange({ ...termo, oferta: event.target.value })} required />
        </div>
        <FormField label="Carga horária" type="number" value={termo.cargaHoraria} onChange={(event) => onChange({ ...termo, cargaHoraria: event.target.value })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Início" type="date" value={termo.periodoInicio} onChange={(event) => onChange({ ...termo, periodoInicio: event.target.value })} />
          <FormField label="Fim" type="date" value={termo.periodoFim} onChange={(event) => onChange({ ...termo, periodoFim: event.target.value })} />
        </div>
        <button className="rounded-lg bg-[#315c50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24483d]">Reenviar termo →</button>
      </form>
    </section>
  )
}
