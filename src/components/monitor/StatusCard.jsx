import StatusBadge from './StatusBadge'

export default function StatusCard({ title, status, description, children }) {
  return (
    <article className="rounded-2xl border border-[#e2e6df] bg-white p-5 shadow-[0_8px_24px_rgba(39,70,59,.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#8c9890]">{title}</p>
          <StatusBadge status={status} />
        </div>
        <span className="text-xl text-[#315c50]" aria-hidden="true">✓</span>
      </div>
      <p className="m-0 text-sm leading-relaxed text-[#68766e]">{description}</p>
      {children}
    </article>
  )
}
