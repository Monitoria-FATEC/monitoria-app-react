// Gráfico de rosca em SVG, sem biblioteca. O SVG é decoração: quem lê o gráfico
// é a legenda ao lado, com o número e a porcentagem de cada fatia escritos.
// fatias: [{ rotulo, valor, cor }]  (cor = cor CSS, ex.: "#5b9a6f")
const RAIO = 40
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

export default function GraficoRosca({ titulo, fatias, rotuloTotal = 'no total', className = '' }) {
  const total = fatias.reduce((soma, fatia) => soma + (fatia.valor ?? 0), 0)
  let acumulado = 0

  return (
    <figure className={`m-0 ${className}`}>
      {titulo && <figcaption className="mb-3 text-xs font-bold uppercase tracking-[.6px] text-[#68766e]">{titulo}</figcaption>}

      <div className="flex flex-wrap items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true" focusable="false">
            <circle cx="50" cy="50" r={RAIO} fill="none" stroke="#eef1ec" strokeWidth="14" />
            {total > 0 &&
              fatias.map((fatia) => {
                const valor = fatia.valor ?? 0
                if (valor === 0) return null
                const tamanho = (valor / total) * CIRCUNFERENCIA
                const deslocamento = -acumulado
                acumulado += tamanho

                return (
                  <circle
                    key={fatia.rotulo}
                    cx="50"
                    cy="50"
                    r={RAIO}
                    fill="none"
                    stroke={fatia.cor}
                    strokeWidth="14"
                    strokeDasharray={`${tamanho} ${CIRCUNFERENCIA - tamanho}`}
                    strokeDashoffset={deslocamento}
                  />
                )
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden="true">
            <span className="text-2xl font-bold leading-none text-[#2E4039]">{total}</span>
            <span className="mt-0.5 text-[10px] text-[#68766e]">{rotuloTotal}</span>
          </div>
        </div>

        <ul className="m-0 grid min-w-0 list-none gap-2 p-0 text-sm text-[#2E4039]">
          {fatias.map((fatia) => {
            const valor = fatia.valor ?? 0
            const porcentagem = total === 0 ? 0 : Math.round((valor / total) * 100)

            return (
              <li key={fatia.rotulo} className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: fatia.cor }} aria-hidden="true" />
                <span>
                  {fatia.rotulo}: <strong>{valor}</strong> ({porcentagem}%)
                </span>
              </li>
            )
          })}
          <li className="sr-only">Total: {total}</li>
        </ul>
      </div>
    </figure>
  )
}