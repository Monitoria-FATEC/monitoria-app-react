const statusConfig = {
  AGUARDANDO: {
    label: 'Aguardando',
    className: 'bg-[#fff6d8] text-[#9b7622]',
    dot: 'bg-[#d9ab36]',
  },
  APROVADO: {
    label: 'Aprovado',
    className: 'bg-[#e4f4e5] text-[#39734f]',
    dot: 'bg-[#5b9a6f]',
  },
  DEVOLVIDO: {
    label: 'Devolvido',
    className: 'bg-[#fce8e5] text-[#a64e49]',
    dot: 'bg-[#c76b61]',
  },
  INATIVO: {
    label: 'Desativado',
    className: 'bg-gray-100 text-[#7E8B81]',
    dot: 'bg-[#939E95]',
  },
}

export default function StatusBadge({ status }) {
  const statusAtual = statusConfig[status] ?? statusConfig.AGUARDANDO

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusAtual.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusAtual.dot}`} />
      {statusAtual.label}
    </span>
  )
}
