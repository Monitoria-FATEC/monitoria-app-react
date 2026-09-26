import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'

import { enviarTermoCompromisso } from '../../api/monitorApi'
import { cursosFatecZonaLeste } from '../../data/cursosFatecZonaLeste'

const UNIDADE_FATEC = 'Fatec Zona Leste'

function formatarCpf(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const ofertaOpcoes = [
  { valor: 'anual', label: 'Anual' },
  { valor: 'semestral', label: 'Semestral' },
]

const campoClassName =
  'w-full rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15'

const rotuloClassName = 'text-xs font-bold text-[#39544c]'

function Campo({ label, hint, children }) {
  return (
    <label className="grid gap-1.5">
      <span className={rotuloClassName}>{label}</span>
      {children}
      {hint && <span className="text-[11px] text-[#88958d]">{hint}</span>}
    </label>
  )
}

function Secao({ eyebrow, title, description, children }) {
  return (
    <fieldset className="grid gap-4.25 rounded-2xl border border-[#e1e7df] bg-white p-5.5 sm:p-7">
      <div>
        <span className="mb-1.5 block text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">
          {eyebrow}
        </span>

        <legend className="m-0 font-serif text-xl font-normal text-[#243d38]">
          {title}
        </legend>

        {description && (
          <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-[#68766e]">
            {description}
          </p>
        )}
      </div>

      <div className="grid gap-4.25 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

const termoInicial = {
  nomeEstudante: '',
  ra: '',
  cpf: '',
  curso: '',
  disciplina: '',
  oferta: '',
  cargaHoraria: '',
  periodoInicio: '',
  periodoFim: '',
  editalNumero: '',
  nomeProfessor: '',
  nomeCoordenador: '',
  cidade: '',
  dataAssinatura: '',
  numeroVias: '',
}

export default function TermoCompromisso() {
  const location = useLocation()
  const dadosPreCadastro = location.state ?? {}

  const [termo, setTermo] = useState({
    ...termoInicial,
    nomeEstudante: dadosPreCadastro.nome ?? '',
    ra: dadosPreCadastro.ra ?? '',
    curso: dadosPreCadastro.curso ?? '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState(null)

  const sigPadRef = useRef(null)
  const [assinaturaVazia, setAssinaturaVazia] = useState(true)

  function handleLimparAssinatura() {
    sigPadRef.current?.clear()
    setAssinaturaVazia(true)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setTermo((termoAtual) => ({
      ...termoAtual,
      [name]: value,
    }))
  }

  function handleCpfChange(event) {
    setTermo((termoAtual) => ({
      ...termoAtual,
      cpf: formatarCpf(event.target.value),
    }))
  }

  function handleOfertaChange(valor) {
    setTermo((termoAtual) => ({ ...termoAtual, oferta: valor }))
  }

  function validar() {
    const cpfLimpo = termo.cpf.replace(/\D/g, '')

    if (cpfLimpo.length !== 11) {
      return 'Informe um CPF válido, com 11 dígitos.'
    }

    if (!termo.oferta) {
      return 'Selecione a oferta da disciplina (anual ou semestral).'
    }

    const cargaHoraria = Number(termo.cargaHoraria)

    if (cargaHoraria < 4 || cargaHoraria > 8) {
      return 'A carga horária semanal deve ser de 4 a 8 horas, conforme o Art. 5º da Deliberação CEETEPS n. 111/2026.'
    }

    if (
      termo.periodoInicio &&
      termo.periodoFim &&
      termo.periodoFim < termo.periodoInicio
    ) {
      return 'A data final do período letivo não pode ser anterior à data inicial.'
    }

    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      return 'Assine no campo de assinatura antes de enviar o termo.'
    }

    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const mensagemValidacao = validar()

    if (mensagemValidacao) {
      setErro(mensagemValidacao)
      return
    }

    setEnviando(true)
    setErro(null)

    try {
      const assinaturaEstudante = sigPadRef.current
        .getTrimmedCanvas()
        .toDataURL('image/png')

      await enviarTermoCompromisso({
        ...termo,
        unidade: UNIDADE_FATEC,
        assinaturaEstudante,
      })

      setEnviado(true)
    } catch (requestError) {
      setErro(
        'Não foi possível enviar o termo. Confira os dados e tente novamente.'
      )

      console.error(requestError)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f6ef] px-6">
        <div className="w-full max-w-107.5 rounded-2xl border border-[#e1e7df] bg-white p-8 text-center shadow-[0_18px_46px_rgba(39,70,59,.08)]">
          <span
            className="mx-auto mb-5 flex h-15 w-15 items-center justify-center rounded-full bg-[#eaf3e9] text-3xl text-[#315c50]"
            aria-hidden="true"
          >
            ✓
          </span>

          <h1 className="m-0 mb-2 font-serif text-2xl font-normal text-[#243d38]">
            Termo enviado com sucesso!
          </h1>

          <p className="m-0 text-sm leading-relaxed text-[#68766e]">
            Sua assinatura foi registrada. O(a) professor(a) orientador(a) e
            o(a) coordenador(a) do curso ainda precisam assinar para
            finalizar o Termo de Compromisso de Monitoria.
          </p>

          <Link
            className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-full border-0 bg-[#315c50] px-5 py-3 text-sm font-medium text-white no-underline transition hover:-translate-y-0.5"
            to="/"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f6ef] px-6 py-10 text-[#243d38] sm:py-14">
      <div className="mx-auto w-full max-w-165">
        <Link
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#68766e] no-underline transition hover:text-[#0d3524]"
          to="/cadastro"
        >
          <span aria-hidden="true">←</span>
          Voltar para o cadastro
        </Link>

        <div className="mb-8">
          <p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">
            ANEXO II · TERMO DE COMPROMISSO DE MONITORIA
          </p>

          <h1 className="m-0 font-serif text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-[1.1] tracking-[-1.2px] text-[#243d38]">
            Finalize seu Termo de Monitoria de Disciplina
          </h1>

          <p className="mt-3 max-w-130 text-sm leading-relaxed text-[#68766e]">
            Confirme os dados abaixo e assine ao final para formalizar seu
            compromisso com o Programa de Monitoria de Disciplina da{' '}
            {UNIDADE_FATEC}.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <Secao
            eyebrow="MONITOR(A)"
            title="Dados do(a) estudante"
            description="Informações de quem exercerá a monitoria."
          >
            <div className="sm:col-span-2">
              <Campo label="Nome completo do(a) estudante">
                <input
                  className={campoClassName}
                  type="text"
                  name="nomeEstudante"
                  value={termo.nomeEstudante}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo do(a) monitor(a)"
                />
              </Campo>
            </div>

            <Campo label="RA">
              <input
                className={campoClassName}
                type="text"
                name="ra"
                value={termo.ra}
                onChange={handleChange}
                required
                placeholder="Registro acadêmico"
              />
            </Campo>

            <Campo label="CPF">
              <input
                className={campoClassName}
                type="text"
                name="cpf"
                value={termo.cpf}
                onChange={handleCpfChange}
                required
                inputMode="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </Campo>

            <div className="sm:col-span-2">
              <Campo label="Curso">
                <select
                  className={campoClassName}
                  name="curso"
                  value={termo.curso}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o curso</option>

                  {cursosFatecZonaLeste.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          </Secao>

          <Secao
            eyebrow="MONITORIA"
            title="Dados da disciplina de monitoria"
            description="Conforme a Cláusula Primeira e Terceira do Termo."
          >
            <div className="sm:col-span-2">
              <Campo label="Disciplina da monitoria">
                <input
                  className={campoClassName}
                  type="text"
                  name="disciplina"
                  value={termo.disciplina}
                  onChange={handleChange}
                  required
                  placeholder="Ex.: Estrutura de Dados"
                />
              </Campo>
            </div>

            <div className="sm:col-span-2">
              <span className={rotuloClassName}>Oferta da disciplina</span>

              <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                {ofertaOpcoes.map((opcao) => (
                  <button
                    className={`rounded-[9px] border px-3.5 py-3 text-[13px] font-medium transition ${
                      termo.oferta === opcao.valor
                        ? 'border-[#315c50] bg-[#edf4ed] text-[#0d3524]'
                        : 'border-[#d7e0d6] bg-[#fbfcfa] text-[#243d38] hover:border-[#769c8d]'
                    }`}
                    type="button"
                    key={opcao.valor}
                    onClick={() => handleOfertaChange(opcao.valor)}
                    aria-pressed={termo.oferta === opcao.valor}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            </div>

            <Campo
              label="Carga horária semanal"
              hint="Mínimo 4h e máximo 8h semanais (Art. 5º da Deliberação CEETEPS n. 111/2026)"
            >
              <input
                className={campoClassName}
                type="number"
                name="cargaHoraria"
                value={termo.cargaHoraria}
                onChange={handleChange}
                required
                min={4}
                max={8}
                placeholder="Ex.: 6"
              />
            </Campo>

            <Campo label="Edital nº">
              <input
                className={campoClassName}
                type="text"
                name="editalNumero"
                value={termo.editalNumero}
                onChange={handleChange}
                required
                placeholder="Ex.: 04/2026"
              />
            </Campo>

            <Campo label="Período letivo — início">
              <input
                className={campoClassName}
                type="date"
                name="periodoInicio"
                value={termo.periodoInicio}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo label="Período letivo — fim">
              <input
                className={campoClassName}
                type="date"
                name="periodoFim"
                value={termo.periodoFim}
                onChange={handleChange}
                required
              />
            </Campo>
          </Secao>

          <Secao
            eyebrow="RESPONSÁVEIS"
            title="Orientação e acompanhamento"
            description="Conforme a Cláusula Sétima do Termo."
          >
            <div className="sm:col-span-2">
              <Campo label="Nome completo do(a) Professor(a) Orientador(a) Responsável">
                <input
                  className={campoClassName}
                  type="text"
                  name="nomeProfessor"
                  value={termo.nomeProfessor}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo do(a) professor(a)"
                />
              </Campo>
            </div>

            <div className="sm:col-span-2">
              <Campo label="Nome completo do(a) Coordenador(a) do Curso">
                <input
                  className={campoClassName}
                  type="text"
                  name="nomeCoordenador"
                  value={termo.nomeCoordenador}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo do(a) coordenador(a)"
                />
              </Campo>
            </div>
          </Secao>

          <Secao
            eyebrow="FORMALIZAÇÃO"
            title="Dados finais do Termo"
            description="Usados no fechamento do documento, conforme as Disposições Finais."
          >
            <Campo label="Unidade">
              <input
                className={`${campoClassName} cursor-not-allowed bg-[#f1f3ef] text-[#68766e]`}
                type="text"
                value={UNIDADE_FATEC}
                disabled
                readOnly
              />
            </Campo>

            <Campo label="Cidade">
              <input
                className={campoClassName}
                type="text"
                name="cidade"
                value={termo.cidade}
                onChange={handleChange}
                required
                placeholder="Ex.: São Paulo"
              />
            </Campo>

            <Campo label="Data de assinatura">
              <input
                className={campoClassName}
                type="date"
                name="dataAssinatura"
                value={termo.dataAssinatura}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo
              label="Número de vias"
              hint="Quantas vias de igual teor serão firmadas"
            >
              <input
                className={campoClassName}
                type="number"
                name="numeroVias"
                value={termo.numeroVias}
                onChange={handleChange}
                required
                min={1}
                placeholder="Ex.: 3"
              />
            </Campo>
          </Secao>

          <Secao
            eyebrow="ASSINATURA"
            title="Assinatura do(a) monitor(a)"
            description="Assine no campo abaixo para confirmar o compromisso descrito neste Termo."
          >
            <div className="sm:col-span-2">
              <SignatureCanvas
                ref={sigPadRef}
                penColor="#243d38"
                canvasProps={{
                  className:
                    'h-40 w-full rounded-[9px] border border-[#d7e0d6] bg-white',
                }}
                onEnd={() => setAssinaturaVazia(false)}
              />

              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] text-[#88958d]">
                  Assine com o mouse ou o dedo (em telas touch).
                </span>

                <button
                  className="text-xs font-bold text-[#68766e] underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={handleLimparAssinatura}
                  disabled={assinaturaVazia}
                >
                  Limpar assinatura
                </button>
              </div>
            </div>
          </Secao>

          <button
            className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
            type="submit"
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar termo de compromisso'}

            <span aria-hidden="true">→</span>
          </button>

          {erro && (
            <p className="m-0 text-xs text-[#a34d46]" role="alert">
              {erro}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}