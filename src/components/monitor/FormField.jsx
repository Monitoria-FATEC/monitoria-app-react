export default function FormField({ label, ...props }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-[#39544c]">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-sm text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15"
      />
    </label>
  )
}
