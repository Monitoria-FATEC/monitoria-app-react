export default function CampoFormulario({ label, hint, erro, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-[#39544c]">{label}</span>

      {children}

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