const campoBase =
  'w-full rounded-[9px] border px-3.5 py-3 text-[13px] outline-none placeholder:text-[#a2ada5] focus:ring-4'

const campoNormal =
  'border-[#d7e0d6] bg-[#fbfcfa] text-[#243d38] focus:border-[#769c8d] focus:ring-[#769c8d]/15'

const campoComErro =
  'border-[#c9736b] bg-[#fffafa] text-[#243d38] focus:border-[#c9736b] focus:ring-[#c9736b]/15'

// Campo travado
export const campoFixoClassName = `${campoBase} cursor-not-allowed border-[#d7e0d6] bg-[#f1f3ef] text-[#68766e] focus:ring-transparent`

export function classeCampo(erro) {
  return `${campoBase} ${erro ? campoComErro : campoNormal}`
}