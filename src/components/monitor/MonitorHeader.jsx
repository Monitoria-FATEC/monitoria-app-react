import StatusBadge from './StatusBadge'

export default function MonitorHeader({ titulo, nome, status }) {
  const inicial = (nome || '?').trim().charAt(0).toUpperCase()

  return (
    <header className="flex w-full items-center justify-between bg-[#E9F0E5] p-6 shadow-2xs">
      <h1 className="mb-2.5 text-3xl font-bold text-[#2E4039]">{titulo}</h1>

      <div className="flex items-center gap-4">
        <StatusBadge status={status} />
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#315c50] text-sm font-bold text-white"
          aria-hidden="true"
        >
          {inicial}
        </div>
      </div>
    </header>
  )
}