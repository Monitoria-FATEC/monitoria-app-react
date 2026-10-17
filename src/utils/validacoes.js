// Validações compartilhadas do pré-cadastro e do termo de compromisso.
// Cada validador devolve '' quando o valor é válido, ou a mensagem de erro.

// Mude para true se só e-mails @fatec.sp.gov.br puderem se cadastrar.
export const EXIGIR_EMAIL_INSTITUCIONAL = false
export const DOMINIO_INSTITUCIONAL = 'fatec.sp.gov.br'

export const TAMANHO_MINIMO_SENHA = 6
export const CARGA_HORARIA_MINIMA = 4
export const CARGA_HORARIA_MAXIMA = 8

const TAMANHO_MAXIMO_NOME = 100
const TAMANHO_MINIMO_RA = 8
const TAMANHO_MAXIMO_RA = 15
const TAMANHO_MAXIMO_SENHA = 72
const MAXIMO_VIAS = 10
const DIAS_MINIMOS_PERIODO = 30
const DIAS_MAXIMOS_SEMESTRAL = 210
const DIAS_MAXIMOS_ANUAL = 400
const DIAS_MAXIMOS_ASSINATURA_ANTIGA = 365

// ---------------------------------------------------------------- utilitários

export function normalizarEspacos(texto) {
  return String(texto ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
}

function semAcento(texto) {
  return normalizarEspacos(texto)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function contarLetras(texto) {
  return (texto.match(/\p{L}/gu) ?? []).length
}

export function dataDeHoje() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')

  return `${agora.getFullYear()}-${mes}-${dia}`
}

// Aceita só AAAA-MM-DD e confere se o dia existe de verdade (ex.: 31/02 não passa).
export function lerData(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor ?? ''))

  if (!partes) return null

  const ano = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const data = new Date(Date.UTC(ano, mes - 1, dia))

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null
  }

  return { ano, mes, dia, dias: Math.floor(data.getTime() / 86400000) }
}

// Rola até o primeiro campo marcado como inválido e foca nele.
export function focarPrimeiroCampoInvalido(formulario) {
  requestAnimationFrame(() => {
    const alvo = formulario?.querySelector(
      '[aria-invalid="true"], [data-invalido="true"]'
    )

    if (!alvo) return

    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' })
    alvo.focus?.({ preventScroll: true })
  })
}

// ------------------------------------------------------------------- campos

export function validarNomeCompleto(valor) {
  const nome = normalizarEspacos(valor)

  if (!nome) return 'Informe o nome completo.'

  if (/\d/.test(nome)) return 'O nome não pode conter números.'

  if (!/^\p{L}[\p{L}\s'’.-]*$/u.test(nome)) {
    return 'O nome só pode conter letras, espaços, hífen, apóstrofo e ponto.'
  }

  if (nome.length > TAMANHO_MAXIMO_NOME) {
    return `O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME} caracteres.`
  }

  const palavras = nome.split(' ')

  if (palavras.length < 2) return 'Informe o nome e o sobrenome.'

  if (palavras.some((palavra) => contarLetras(palavra) === 0)) {
    return 'Confira o nome: há trechos sem letras.'
  }

  if (
    contarLetras(palavras[0]) < 2 ||
    contarLetras(palavras[palavras.length - 1]) < 2
  ) {
    return 'Informe o primeiro nome e o sobrenome sem abreviar.'
  }

  if (/(\p{L})\1{3,}/iu.test(nome)) {
    return 'Confira o nome: há letras repetidas em excesso.'
  }

  return ''
}

export function validarEmail(valor) {
  const email = String(valor ?? '').trim()

  if (!email) return 'Informe o e-mail institucional.'

  const [usuario = ''] = email.split('@')

  const formatoValido =
    email.length <= 254 &&
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(
      email
    ) &&
    /\.[A-Za-z]{2,}$/.test(email) &&
    !email.includes('..') &&
    !usuario.startsWith('.') &&
    !usuario.endsWith('.')

  if (!formatoValido) {
    return 'Informe um e-mail válido, como voce@fatec.sp.gov.br.'
  }

  if (
    EXIGIR_EMAIL_INSTITUCIONAL &&
    !email.toLowerCase().endsWith(`@${DOMINIO_INSTITUCIONAL}`)
  ) {
    return `Use seu e-mail institucional (@${DOMINIO_INSTITUCIONAL}).`
  }

  return ''
}

export function validarRa(valor) {
  const ra = String(valor ?? '').trim()

  if (!ra) return 'Informe o RA.'

  if (!/^\d+$/.test(ra)) return 'O RA deve conter apenas números.'

  if (ra.length < TAMANHO_MINIMO_RA || ra.length > TAMANHO_MAXIMO_RA) {
    return `O RA deve ter entre ${TAMANHO_MINIMO_RA} e ${TAMANHO_MAXIMO_RA} dígitos.`
  }

  if (/^(\d)\1+$/.test(ra)) return 'Informe um RA válido.'

  return ''
}

export function validarSenha(valor) {
  const senha = String(valor ?? '')

  if (!senha) return 'Informe a senha.'

  if (!senha.trim()) return 'A senha não pode ter apenas espaços.'

  if (senha.length < TAMANHO_MINIMO_SENHA) {
    return `A senha precisa ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`
  }

  if (senha.length > TAMANHO_MAXIMO_SENHA) {
    return `A senha deve ter no máximo ${TAMANHO_MAXIMO_SENHA} caracteres.`
  }

  return ''
}

export function validarCurso(valor, cursos) {
  if (!valor) return 'Selecione o curso.'

  if (!cursos.includes(valor)) return 'Selecione um curso da lista.'

  return ''
}

function calcularDigitoCpf(base) {
  let soma = 0

  for (let indice = 0; indice < base.length; indice += 1) {
    soma += Number(base[indice]) * (base.length + 1 - indice)
  }

  const resto = (soma * 10) % 11

  return resto === 10 ? 0 : resto
}

export function validarCpf(valor) {
  const cpf = String(valor ?? '').replace(/\D/g, '')

  if (!cpf) return 'Informe o CPF.'

  if (cpf.length !== 11) return 'O CPF deve ter 11 dígitos.'

  const valido =
    !/^(\d)\1{10}$/.test(cpf) &&
    calcularDigitoCpf(cpf.slice(0, 9)) === Number(cpf[9]) &&
    calcularDigitoCpf(cpf.slice(0, 10)) === Number(cpf[10])

  return valido ? '' : 'CPF inválido. Confira os números digitados.'
}

export function validarDisciplina(valor) {
  const disciplina = normalizarEspacos(valor)

  if (!disciplina) return 'Informe a disciplina da monitoria.'

  if (disciplina.length < 3) return 'O nome da disciplina é muito curto.'

  if (disciplina.length > TAMANHO_MAXIMO_NOME) {
    return `O nome da disciplina deve ter no máximo ${TAMANHO_MAXIMO_NOME} caracteres.`
  }

  if (contarLetras(disciplina) < 3) {
    return 'O nome da disciplina precisa conter letras.'
  }

  if (!/^[\p{L}\d\s.,:;()/&'’ºª+-]+$/u.test(disciplina)) {
    return 'O nome da disciplina contém caracteres inválidos.'
  }

  if (/(\p{L})\1{3,}/iu.test(disciplina)) {
    return 'Confira o nome da disciplina: há letras repetidas em excesso.'
  }

  return ''
}

export function validarCargaHoraria(valor) {
  const texto = String(valor ?? '').trim()

  if (!texto) return 'Informe a carga horária semanal.'

  const horas = Number(texto)

  if (!Number.isInteger(horas)) return 'Informe um número inteiro de horas.'

  if (horas < CARGA_HORARIA_MINIMA || horas > CARGA_HORARIA_MAXIMA) {
    return `A carga horária semanal deve ser de ${CARGA_HORARIA_MINIMA} a ${CARGA_HORARIA_MAXIMA} horas, conforme o Art. 5º da Deliberação CEETEPS n. 111/2026.`
  }

  return ''
}

export function validarEdital(valor) {
  const edital = String(valor ?? '').replace(/\s+/g, '')

  if (!edital) return 'Informe o número do edital.'

  const partes = /^(\d{1,3})\/(\d{4})$/.exec(edital)

  if (!partes) return 'Use o formato número/ano, como 04/2026.'

  if (Number(partes[1]) === 0) {
    return 'O número do edital deve ser maior que zero.'
  }

  const anoAtual = lerData(dataDeHoje()).ano
  const ano = Number(partes[2])

  if (ano < anoAtual - 2 || ano > anoAtual + 1) {
    return `O ano do edital (${ano}) não parece correto.`
  }

  return ''
}

export function validarNumeroVias(valor) {
  const texto = String(valor ?? '').trim()

  if (!texto) return 'Informe o número de vias.'

  const vias = Number(texto)

  if (!Number.isInteger(vias)) return 'Informe um número inteiro de vias.'

  if (vias < 1 || vias > MAXIMO_VIAS) {
    return `O número de vias deve ficar entre 1 e ${MAXIMO_VIAS}.`
  }

  return ''
}

// ---------------------------------------------------------------- formulários

export function validarCadastro(formulario, cursos) {
  const erros = {
    nome: validarNomeCompleto(formulario.nome),
    email: validarEmail(formulario.email),
    ra: validarRa(formulario.ra),
    curso: validarCurso(formulario.curso, cursos),
    senha: validarSenha(formulario.senha),
  }

  return removerVazios(erros)
}

function lerDataDoPeriodo(valor, mensagemVazia, anoMinimo, anoMaximo, rotulo) {
  if (!valor) return { erro: mensagemVazia }

  const data = lerData(valor)

  if (!data) return { erro: 'Data inválida. Confira dia, mês e ano.' }

  if (data.ano < anoMinimo || data.ano > anoMaximo) {
    return {
      erro: `O ano ${rotulo} deve estar entre ${anoMinimo} e ${anoMaximo}.`,
    }
  }

  return { data }
}

export function validarTermoCompromisso(
  termo,
  { cursos, assinaturaVazia }
) {
  const erros = {
    nomeEstudante: validarNomeCompleto(termo.nomeEstudante),
    ra: validarRa(termo.ra),
    cpf: validarCpf(termo.cpf),
    curso: validarCurso(termo.curso, cursos),
    disciplina: validarDisciplina(termo.disciplina),
    oferta: ['anual', 'semestral'].includes(termo.oferta)
      ? ''
      : 'Selecione a oferta da disciplina (anual ou semestral).',
    cargaHoraria: validarCargaHoraria(termo.cargaHoraria),
    editalNumero: validarEdital(termo.editalNumero),
    nomeProfessor: validarNomeCompleto(termo.nomeProfessor),
    nomeCoordenador: validarNomeCompleto(termo.nomeCoordenador),
    numeroVias: validarNumeroVias(termo.numeroVias),
    assinatura: assinaturaVazia
      ? 'Assine no campo de assinatura antes de enviar o termo.'
      : '',
  }

  // Datas: cada uma precisa ser real e plausível, e fazer sentido entre si.
  const hoje = lerData(dataDeHoje())
  const anoMinimo = hoje.ano - 1
  const anoMaximo = hoje.ano + 2

  const inicio = lerDataDoPeriodo(
    termo.periodoInicio,
    'Informe a data de início do período letivo.',
    anoMinimo,
    anoMaximo,
    'do início do período'
  )
  const fim = lerDataDoPeriodo(
    termo.periodoFim,
    'Informe a data de fim do período letivo.',
    anoMinimo,
    anoMaximo,
    'do fim do período'
  )

  erros.periodoInicio = inicio.erro ?? ''
  erros.periodoFim = fim.erro ?? ''

  if (inicio.data && fim.data) {
    const duracao = fim.data.dias - inicio.data.dias

    if (duracao <= 0) {
      erros.periodoFim = 'A data final precisa ser posterior à data inicial.'
    } else if (duracao < DIAS_MINIMOS_PERIODO) {
      erros.periodoFim = `O período letivo precisa ter pelo menos ${DIAS_MINIMOS_PERIODO} dias.`
    } else if (termo.oferta === 'semestral' && duracao > DIAS_MAXIMOS_SEMESTRAL) {
      erros.periodoFim =
        'Para oferta semestral, o período não pode passar de cerca de 7 meses. Confira as datas ou escolha a oferta anual.'
    } else if (termo.oferta === 'anual' && duracao > DIAS_MAXIMOS_ANUAL) {
      erros.periodoFim =
        'Para oferta anual, o período não pode passar de cerca de 13 meses. Confira as datas.'
    }
  }

  if (!termo.dataAssinatura) {
    erros.dataAssinatura = 'Informe a data de assinatura.'
  } else {
    const assinatura = lerData(termo.dataAssinatura)

    if (!assinatura) {
      erros.dataAssinatura = 'Data inválida. Confira dia, mês e ano.'
    } else if (assinatura.dias > hoje.dias) {
      erros.dataAssinatura = 'A data de assinatura não pode ser futura.'
    } else if (hoje.dias - assinatura.dias > DIAS_MAXIMOS_ASSINATURA_ANTIGA) {
      erros.dataAssinatura =
        'A data de assinatura está muito antiga. Confira o ano.'
    } else if (fim.data && assinatura.dias > fim.data.dias) {
      erros.dataAssinatura =
        'A data de assinatura não pode ser posterior ao fim do período letivo.'
    }
  }

  // O estudante não pode ser o próprio orientador ou coordenador.
  if (!erros.nomeEstudante) {
    const nomeEstudante = semAcento(termo.nomeEstudante)

    for (const campo of ['nomeProfessor', 'nomeCoordenador']) {
      if (!erros[campo] && semAcento(termo[campo]) === nomeEstudante) {
        erros[campo] = 'Este nome não pode ser igual ao do(a) estudante.'
      }
    }
  }

  return removerVazios(erros)
}

function removerVazios(erros) {
  return Object.fromEntries(
    Object.entries(erros).filter(([, mensagem]) => mensagem)
  )
}