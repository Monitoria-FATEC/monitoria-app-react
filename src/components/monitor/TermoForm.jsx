import { useRef, useState } from 'react'
import SignatureCanvasImport from 'react-signature-canvas'

import FormField from './FormField'

const SignatureCanvas =
  typeof SignatureCanvasImport === 'function'
    ? SignatureCanvasImport
    : SignatureCanvasImport.default

const ofertaOpcoes = [
  { valor: 'anual', label: 'Anual' },
  { valor: 'semestral', label: 'Semestral' },
]

function formatarCpf(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function TermoForm({ termo, onChange, onSubmit, temAssinatura }) {
  const sigPadRef = useRef(null)
  const [assinaturaVazia, setAssinaturaVazia] = useState(true)
  const [erro, setErro] = useState('')

  function alterar(campo, valor) {
    onChange({ ...termo, [campo]: valor })
  }

  function limparAssinatura() {
    sigPadRef.current?.clear()
    setAssinaturaVazia(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setErro('')

    if (String(termo.cpf ?? '').replace(/\D/g, '').length !== 11) {
      setErro('Informe um CPF válido, com 11 dígitos.')
      return
    }

    if (!termo.oferta) {
      setErro('Selecione a oferta da disciplina (anual ou semestral).')
      return
    }

    if (termo.periodoInicio && termo.periodoFim && termo.periodoFim < termo.periodoInicio) {
      setErro('O fim do período não pode ser antes do início.')
      return
    }

    // nova assinatura só vai se o monitor desenhou; senão o back mantém a atual
    const dados = {
      ...termo,
      cargaHoraria: termo.cargaHoraria === '' ? null : Number(termo.cargaHoraria),
      numeroVias: termo.numeroVias === '' ? null : Number(termo.numeroVias),
    }

    if (!assinaturaVazia) {
      dados.assinaturaEstudante = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png')
    }

    onSubmit(dados)
  }

  return (
    <section className="max-w-[760px] rounded-2xl border border-[#e2e6df] bg-white p-6 sm:p-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#769c8d]">AJUSTE NECESSÁRIO</p>
      <h2 className="mb-2 font-sans text-3xl font-normal">Editar termo</h2>
      <p className="mb-7 text-sm leading-relaxed text-[#68766e]">Corrija os campos solicitados e reenvie o termo para uma nova análise.</p>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <p className="text-xs font-bold uppercase tracking-[.12em] text-[#939E95]">Dados do estudante</p>
        <FormField label="Nome completo" value={termo.nomeEstudante} onChange={(event) => alterar('nomeEstudante', event.target.value)} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="CPF" value={termo.cpf} onChange={(event) => alterar('cpf', formatarCpf(event.target.value))} placeholder="000.000.000-00" required />
          <FormField label="Curso" value={termo.curso} onChange={(event) => alterar('curso', event.target.value)} required />
        </div>

        <p className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-[#939E95]">Monitoria</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Disciplina" value={termo.disciplina} onChange={(event) => alterar('disciplina', event.target.value)} required />
          <FormField label="Edital nº" value={termo.editalNumero} onChange={(event) => alterar('editalNumero', event.target.value)} required />
        </div>

        <div className="grid gap-1.5">
          <span className="text-xs font-bold text-[#39544c]">Oferta da disciplina</span>
          <div className="flex gap-3">
            {ofertaOpcoes.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => alterar('oferta', opcao.valor)}
                aria-pressed={termo.oferta === opcao.valor}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                  termo.oferta === opcao.valor
                    ? 'border-[#315c50] bg-[#315c50] text-white'
                    : 'border-[#d7e0d6] bg-[#fbfcfa] text-[#243d38] hover:border-[#769c8d]'
                }`}
              >
                {opcao.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Carga horária semanal (horas)" type="number" min={1} value={termo.cargaHoraria} onChange={(event) => alterar('cargaHoraria', event.target.value)} />
          <FormField label="Número de vias" type="number" min={1} value={termo.numeroVias} onChange={(event) => alterar('numeroVias', event.target.value)} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Início do período" type="date" value={termo.periodoInicio} onChange={(event) => alterar('periodoInicio', event.target.value)} />
          <FormField label="Fim do período" type="date" value={termo.periodoFim} onChange={(event) => alterar('periodoFim', event.target.value)} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Professor(a) orientador(a)" value={termo.nomeProfessor} onChange={(event) => alterar('nomeProfessor', event.target.value)} required />
          <FormField label="Coordenador(a) do curso" value={termo.nomeCoordenador} onChange={(event) => alterar('nomeCoordenador', event.target.value)} required />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Cidade" value={termo.cidade} onChange={(event) => alterar('cidade', event.target.value)} required />
          <FormField label="Data de assinatura" type="date" value={termo.dataAssinatura} onChange={(event) => alterar('dataAssinatura', event.target.value)} />
        </div>

        <p className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-[#939E95]">Assinatura</p>
        <div className="grid gap-2">
          <p className="m-0 text-sm text-[#68766e]">
            {temAssinatura
              ? 'Sua assinatura anterior está registrada. Se o supervisor pediu uma nova, assine de novo abaixo; se não, deixe em branco e ela será mantida.'
              : 'Assine no campo abaixo para confirmar o compromisso descrito no termo.'}
          </p>

          <SignatureCanvas
            ref={sigPadRef}
            penColor="#243d38"
            canvasProps={{
              className: 'h-40 w-full rounded-lg border border-[#d7e0d6] bg-white',
            }}
            onEnd={() => setAssinaturaVazia(false)}
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#88958d]">Assine com o mouse ou o dedo (em telas touch).</span>
            <button
              type="button"
              onClick={limparAssinatura}
              disabled={assinaturaVazia}
              className="text-xs font-bold text-[#68766e] underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpar assinatura
            </button>
          </div>
        </div>

        {erro && <p className="m-0 text-sm text-[#a34d46]" role="alert">{erro}</p>}

        <button className="rounded-lg bg-[#315c50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24483d]">Reenviar termo →</button>
      </form>
    </section>
  )
}