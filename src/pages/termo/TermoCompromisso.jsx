import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SignatureCanvasImport from 'react-signature-canvas'

import { criarInscricao } from '../../api/inscricaoApi'
import { enviarTermoCompromisso } from '../../api/monitorApi'
import CampoFormulario from '../../components/access/CampoFormulario'
import { cursosFatecZonaLeste } from '../../data/cursosFatecZonaLeste'
import { CIDADE_FATEC, UNIDADE_FATEC } from '../../data/unidadeFatec'
import { campoFixoClassName, classeCampo } from '../../utils/estilosFormulario'
import {
  dataDeHoje,
  focarPrimeiroCampoInvalido,
  lerData,
  normalizarEspacos,
  validarTermoCompromisso,
} from '../../utils/validacoes'

const SignatureCanvas =
  typeof SignatureCanvasImport === 'function'
    ? SignatureCanvasImport
    : SignatureCanvasImport.default

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

const rotuloClassName = 'text-xs font-bold text-[#39544c]'

// Quando um campo muda, os erros que dependem dele também saem da tela.
const camposRelacionados = {
  periodoInicio: ['periodoFim', 'dataAssinatura'],
  periodoFim: ['dataAssinatura'],
  oferta: ['periodoFim'],
  nomeEstudante: ['nomeProfessor', 'nomeCoordenador'],
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

// Unidade e cidade são fixas: aparecem preenchidas e não podem ser editadas.
function CampoFixo({ label, valor }) {
  return (
    <CampoFormulario label={label}>
      <input
        className={campoFixoClassName}
        type="text"
        value={valor}
        disabled
        readOnly
        aria-readonly="true"
      />
    </CampoFormulario>
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
  dataAssinatura: '',
  numeroVias: '',
}

export default function TermoCompromisso() {
  const location = useLocation()
  const dadosPreCadastro = location.state ?? {}

  const formRef = useRef(null)
  const sigPadRef = useRef(null)

  const [termo, setTermo] = useState({
    ...termoInicial,
    nomeEstudante: dadosPreCadastro.nome ?? '',
    ra: dadosPreCadastro.ra ?? '',
    curso: dadosPreCadastro.curso ?? '',
  })
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState(null)
  const [termoId, setTermoId] = useState(null)
  const [assinaturaVazia, setAssinaturaVazia] = useState(true)

  const hoje = dataDeHoje()
  const anoAtual = lerData(hoje).ano
  const dataMinimaPeriodo = `${anoAtual - 1}-01-01`
  const dataMaximaPeriodo = `${anoAtual + 2}-12-31`

  function limparErros(campo) {
    const camposParaLimpar = [campo, ...(camposRelacionados[campo] ?? [])]

    setErros((errosAtuais) =>
      Object.fromEntries(
        Object.entries(errosAtuais).filter(
          ([nome]) => !camposParaLimpar.includes(nome)
        )
      )
    )
  }

  function atualizarCampo(campo, valor) {
    setTermo((termoAtual) => ({ ...termoAtual, [campo]: valor }))
    limparErros(campo)
  }

  function handleChange(event) {
    atualizarCampo(event.target.name, event.target.value)
  }

  function handleCpfChange(event) {
    atualizarCampo('cpf', formatarCpf(event.target.value))
  }

  function handleOfertaChange(valor) {
    atualizarCampo('oferta', valor)
  }

  function handleLimparAssinatura() {
    sigPadRef.current?.clear()
    setAssinaturaVazia(true)
  }

  function handleFimAssinatura() {
    setAssinaturaVazia(false)
    limparErros('assinatura')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setErro(null)

    if (!dadosPreCadastro.idMonitor) {
      setErro('Faça o cadastro antes de enviar o termo.')
      return
    }

    const assinaturaEstaVazia =
      !sigPadRef.current || sigPadRef.current.isEmpty()

    const errosEncontrados = validarTermoCompromisso(termo, {
      cursos: cursosFatecZonaLeste,
      assinaturaVazia: assinaturaEstaVazia,
    })

    setErros(errosEncontrados)

    if (Object.keys(errosEncontrados).length > 0) {
      focarPrimeiroCampoInvalido(formRef.current)
      return
    }

    setEnviando(true)

    let termoSalvo = false

    try {
      let idTermo = termoId

      if (!idTermo) {
        const assinaturaEstudante = sigPadRef.current
          .getTrimmedCanvas()
          .toDataURL('image/png')

        const termoCriado = await enviarTermoCompromisso({
          ...termo,
          nomeEstudante: normalizarEspacos(termo.nomeEstudante),
          nomeProfessor: normalizarEspacos(termo.nomeProfessor),
          nomeCoordenador: normalizarEspacos(termo.nomeCoordenador),
          disciplina: normalizarEspacos(termo.disciplina),
          ra: termo.ra.trim(),
          editalNumero: termo.editalNumero.replace(/\s+/g, ''),
          unidade: UNIDADE_FATEC,
          cidade: CIDADE_FATEC,
          assinaturaEstudante,
        })

        idTermo = termoCriado?.id
        setTermoId(idTermo ?? null)
      }

      termoSalvo = Boolean(idTermo)

      if (!idTermo) {
        throw new Error('A resposta do termo não trouxe o id.')
      }

      await criarInscricao({
        idMonitor: dadosPreCadastro.idMonitor,
        idTermoCompromisso: idTermo,
      })

      setEnviado(true)
    } catch (requestError) {
      setErro(
        termoSalvo
          ? 'Seu termo foi salvo, mas não foi possível concluir o envio da inscrição. Clique em enviar novamente para tentar de novo.'
          : 'Não foi possível enviar o termo. Confira os dados e tente novamente.'
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
            Recebemos o seu termo e a sua assinatura. Para concluir o
            processo, ainda faltam as assinaturas do professor orientador e
            da coordenação do curso.
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

        <form
          ref={formRef}
          className="grid gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <Secao
            eyebrow="MONITOR(A)"
            title="Dados do(a) estudante"
            description="Informações de quem exercerá a monitoria."
          >
            <div className="sm:col-span-2">
              <CampoFormulario
                label="Nome completo do(a) estudante"
                erro={erros.nomeEstudante}
              >
                <input
                  className={classeCampo(erros.nomeEstudante)}
                  type="text"
                  name="nomeEstudante"
                  value={termo.nomeEstudante}
                  onChange={handleChange}
                  aria-invalid={Boolean(erros.nomeEstudante)}
                  autoComplete="name"
                  placeholder="Nome completo do(a) monitor(a)"
                />
              </CampoFormulario>
            </div>

            <CampoFormulario label="RA" erro={erros.ra}>
              <input
                className={classeCampo(erros.ra)}
                type="text"
                name="ra"
                value={termo.ra}
                onChange={handleChange}
                aria-invalid={Boolean(erros.ra)}
                inputMode="numeric"
                placeholder="Registro acadêmico"
              />
            </CampoFormulario>

            <CampoFormulario label="CPF" erro={erros.cpf}>
              <input
                className={classeCampo(erros.cpf)}
                type="text"
                name="cpf"
                value={termo.cpf}
                onChange={handleCpfChange}
                aria-invalid={Boolean(erros.cpf)}
                inputMode="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </CampoFormulario>

            <div className="sm:col-span-2">
              <CampoFormulario label="Curso" erro={erros.curso}>
                <select
                  className={classeCampo(erros.curso)}
                  name="curso"
                  value={termo.curso}
                  onChange={handleChange}
                  aria-invalid={Boolean(erros.curso)}
                >
                  <option value="">Selecione o curso</option>

                  {cursosFatecZonaLeste.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </CampoFormulario>
            </div>
          </Secao>

          <Secao
            eyebrow="MONITORIA"
            title="Dados da disciplina de monitoria"
            description="Conforme a Cláusula Primeira e Terceira do Termo."
          >
            <div className="sm:col-span-2">
              <CampoFormulario
                label="Disciplina da monitoria"
                erro={erros.disciplina}
              >
                <input
                  className={classeCampo(erros.disciplina)}
                  type="text"
                  name="disciplina"
                  value={termo.disciplina}
                  onChange={handleChange}
                  aria-invalid={Boolean(erros.disciplina)}
                  placeholder="Ex.: Estrutura de Dados"
                />
              </CampoFormulario>
            </div>

            <div className="sm:col-span-2">
              <span className={rotuloClassName}>Oferta da disciplina</span>

              <div
                className="mt-1.5 grid grid-cols-2 gap-2.5"
                data-invalido={Boolean(erros.oferta)}
                tabIndex={-1}
              >
                {ofertaOpcoes.map((opcao) => (
                  <button
                    className={`rounded-[9px] border px-3.5 py-3 text-[13px] font-medium transition ${
                      termo.oferta === opcao.valor
                        ? 'border-[#315c50] bg-[#edf4ed] text-[#0d3524]'
                        : erros.oferta
                          ? 'border-[#c9736b] bg-[#fffafa] text-[#243d38] hover:border-[#769c8d]'
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

              {erros.oferta && (
                <span
                  className="mt-1.5 block text-[11px] text-[#a34d46]"
                  role="alert"
                >
                  {erros.oferta}
                </span>
              )}
            </div>

            <CampoFormulario
              label="Carga horária semanal"
              hint="Mínimo 4h e máximo 8h semanais (Art. 5º da Deliberação CEETEPS n. 111/2026)"
              erro={erros.cargaHoraria}
            >
              <input
                className={classeCampo(erros.cargaHoraria)}
                type="number"
                name="cargaHoraria"
                value={termo.cargaHoraria}
                onChange={handleChange}
                aria-invalid={Boolean(erros.cargaHoraria)}
                min={4}
                max={8}
                step={1}
                placeholder="Ex.: 6"
              />
            </CampoFormulario>

            <CampoFormulario
              label="Edital nº"
              hint="Formato número/ano"
              erro={erros.editalNumero}
            >
              <input
                className={classeCampo(erros.editalNumero)}
                type="text"
                name="editalNumero"
                value={termo.editalNumero}
                onChange={handleChange}
                aria-invalid={Boolean(erros.editalNumero)}
                placeholder="Ex.: 04/2026"
              />
            </CampoFormulario>

            <CampoFormulario
              label="Período letivo — início"
              erro={erros.periodoInicio}
            >
              <input
                className={classeCampo(erros.periodoInicio)}
                type="date"
                name="periodoInicio"
                value={termo.periodoInicio}
                onChange={handleChange}
                aria-invalid={Boolean(erros.periodoInicio)}
                min={dataMinimaPeriodo}
                max={dataMaximaPeriodo}
              />
            </CampoFormulario>

            <CampoFormulario
              label="Período letivo — fim"
              erro={erros.periodoFim}
            >
              <input
                className={classeCampo(erros.periodoFim)}
                type="date"
                name="periodoFim"
                value={termo.periodoFim}
                onChange={handleChange}
                aria-invalid={Boolean(erros.periodoFim)}
                min={termo.periodoInicio || dataMinimaPeriodo}
                max={dataMaximaPeriodo}
              />
            </CampoFormulario>
          </Secao>

          <Secao
            eyebrow="RESPONSÁVEIS"
            title="Orientação e acompanhamento"
            description="Conforme a Cláusula Sétima do Termo."
          >
            <div className="sm:col-span-2">
              <CampoFormulario
                label="Nome completo do(a) Professor(a) Orientador(a) Responsável"
                erro={erros.nomeProfessor}
              >
                <input
                  className={classeCampo(erros.nomeProfessor)}
                  type="text"
                  name="nomeProfessor"
                  value={termo.nomeProfessor}
                  onChange={handleChange}
                  aria-invalid={Boolean(erros.nomeProfessor)}
                  placeholder="Nome completo do(a) professor(a)"
                />
              </CampoFormulario>
            </div>

            <div className="sm:col-span-2">
              <CampoFormulario
                label="Nome completo do(a) Coordenador(a) do Curso"
                erro={erros.nomeCoordenador}
              >
                <input
                  className={classeCampo(erros.nomeCoordenador)}
                  type="text"
                  name="nomeCoordenador"
                  value={termo.nomeCoordenador}
                  onChange={handleChange}
                  aria-invalid={Boolean(erros.nomeCoordenador)}
                  placeholder="Nome completo do(a) coordenador(a)"
                />
              </CampoFormulario>
            </div>
          </Secao>

          <Secao
            eyebrow="FORMALIZAÇÃO"
            title="Dados finais do Termo"
            description="Usados no fechamento do documento, conforme as Disposições Finais."
          >
            <CampoFixo label="Unidade" valor={UNIDADE_FATEC} />

            <CampoFixo label="Cidade" valor={CIDADE_FATEC} />

            <CampoFormulario
              label="Data de assinatura"
              erro={erros.dataAssinatura}
            >
              <input
                className={classeCampo(erros.dataAssinatura)}
                type="date"
                name="dataAssinatura"
                value={termo.dataAssinatura}
                onChange={handleChange}
                aria-invalid={Boolean(erros.dataAssinatura)}
                max={hoje}
              />
            </CampoFormulario>

            <CampoFormulario
              label="Número de vias"
              hint="Quantas vias de igual teor serão firmadas"
              erro={erros.numeroVias}
            >
              <input
                className={classeCampo(erros.numeroVias)}
                type="number"
                name="numeroVias"
                value={termo.numeroVias}
                onChange={handleChange}
                aria-invalid={Boolean(erros.numeroVias)}
                min={1}
                max={10}
                step={1}
                placeholder="Ex.: 3"
              />
            </CampoFormulario>
          </Secao>

          <Secao
            eyebrow="ASSINATURA"
            title="Assinatura do(a) monitor(a)"
            description="Assine no campo abaixo para confirmar o compromisso descrito neste Termo."
          >
            <div className="sm:col-span-2">
              <div
                data-invalido={Boolean(erros.assinatura)}
                tabIndex={-1}
                className="outline-none"
              >
                <SignatureCanvas
                  ref={sigPadRef}
                  penColor="#243d38"
                  canvasProps={{
                    className: `h-40 w-full rounded-[9px] border bg-white ${
                      erros.assinatura
                        ? 'border-[#c9736b]'
                        : 'border-[#d7e0d6]'
                    }`,
                  }}
                  onEnd={handleFimAssinatura}
                />
              </div>

              {erros.assinatura && (
                <span
                  className="mt-1.5 block text-[11px] text-[#a34d46]"
                  role="alert"
                >
                  {erros.assinatura}
                </span>
              )}

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

          {Object.keys(erros).length > 0 && (
            <p className="m-0 text-xs text-[#a34d46]" role="alert">
              Corrija os campos destacados em vermelho antes de enviar.
            </p>
          )}

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