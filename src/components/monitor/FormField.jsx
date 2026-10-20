export default function FormField({ label, erro, hint, ...props }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-[#39544c]">{label}</span>
      <input
        {...props}
        aria-invalid={Boolean(erro)}
        className={`w-full rounded-lg border bg-[#fbfcfa] px-3.5 py-3 text-sm text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:ring-4 ${
          erro
            ? 'border-[#a34d46] focus:border-[#a34d46] focus:ring-[#a34d46]/15'
            : 'border-[#d7e0d6] focus:border-[#769c8d] focus:ring-[#769c8d]/15'
        }`}
      />
      {erro ? (
        <span className="text-[11px] text-[#a34d46]" role="alert">
          {erro}
        </span>
      ) : (
        hint && <span className="text-[11px] text-[#88958d]">{hint}</span>
      )}
    </label>
  )
}