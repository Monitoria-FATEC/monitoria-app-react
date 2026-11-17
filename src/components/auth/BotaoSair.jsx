export default function BotaoSair({ onClick, className = '' }) {

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full rounded-lg border border-[#d5e2d2] bg-white/60 px-3 py-2 text-left text-sm font-semibold text-[#a34d46] transition hover:bg-white cursor-pointer ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-from-line preview-icon"><path d="m9 6-6 6 6 6"/><path d="M3 12h14"/><path d="M21 19V5"/></svg>
      Sair da Conta
    </button>
  )
}