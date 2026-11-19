// Gráfico de barras horizontais feito só com HTML e CSS (sem biblioteca).
// Acessível: é uma lista com o número escrito em cada linha; as barras são só decoração.
// itens: [{ rotulo, valor, cor }]  (cor = classe do Tailwind, ex.: "bg-[#5b9a6f]")
export default function GraficoBarras({ titulo, itens, className = '' }) {
  const maior = Math.max(1, ...itens.map((item) => item.valor ?? 0))
  const total = itens.reduce((soma, item) => soma + (item.valor ?? 0), 0)

  return (
    <figure className={`m-0 ${className}`}>
      {titulo && <figcaption className="mb-3 text-xs font-bold uppercase tracking-[.6px] text-[#68766e]">{titulo}</figcaption>}

      <ul className="m-0 grid list-none gap-2.5 p-0">
        {itens.map((item) => {
          const valor = item.valor ?? 0
          const largura = valor === 0 ? 0 : Math.max(4, Math.round((valor / maior) * 100))

          return (
            <li key={item.rotulo} className="grid grid-cols-[minmax(84px,34%)_1fr_auto] items-center gap-3 text-sm text-[#2E4039]">
              <span className="min-w-0 break-words">{item.rotulo}</span>
              <span className="h-3.5 overflow-hidden rounded-full bg-[#eef1ec]" aria-hidden="true">
                <span className={`block h-full rounded-full ${item.cor ?? 'bg-[#315c50]'}`} style={{ width: `${largura}%` }} />
              </span>
              <strong className="min-w-6 text-right tabular-nums">{valor}</strong>
            </li>
          )
        })}
      </ul>

      <p className="sr-only">Total: {total}</p>
    </figure>
  )
}