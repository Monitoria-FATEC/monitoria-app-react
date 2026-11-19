import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { enviarCodigoTrocaSenha, trocarSenhaTemporaria } from '../../api/contaApi'
import {
  lerSessaoValida,
  limparSessao,
  rotaInicialPorPerfil,
  salvarSessao,
} from '../../services/authStorage'
import { mensagemDoErro } from '../../utils/errosApi'
import { validarSenha } from '../../utils/validacoes'

const inputClassName =
  'w-full rounded-[9px] border bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:ring-4'

function Campo({ id, label, valor, onChange, erro, visivel, autoFocus, numerico }) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-xs font-bold text-[#39544c]">{label}</span>
      <input
        id={id}
        type={visivel || numerico ? 'text' : 'password'}
        inputMode={numerico ? 'numeric' : undefined}
        maxLength={numerico ? 6 : undefined}
        value={valor}
        onChange={onChange}
        autoFocus={autoFocus}
        autoComplete={numerico ? 'one-time-code' : 'new-password'}
        aria-invalid={Boolean(erro)}
        className={`${inputClassName} ${
          erro
            ? 'border-[#a34d46] focus:border-[#a34d46] focus:ring-[#a34d46]/15'
            : 'border-[#d7e0d6] focus:border-[#769c8d] focus:ring-[#769c8d]/15'
        }`}
      />
      {erro && (
        <span className="text-[11px] text-[#a34d46]" role="alert">
          {erro}
        </span>
      )}
    </label>
  )
}

// Primeiro acesso com a senha temporária que o supervisor entregou:
// o usuário cria a própria senha antes de usar o sistema.
export default function TrocarSenhaTemporaria() {
  const navigate = useNavigate()
  const sessao = lerSessaoValida()

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [visivel, setVisivel] = useState(false)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [etapa, setEtapa] = useState('senha') // 'senha' -> 'codigo' -> 'pronto'
  const [codigo, setCodigo] = useState('')
  const [aviso, setAviso] = useState(null)

  // depois do "senha alterada com sucesso", segue para o painel do perfil
  useEffect(() => {
    if (etapa !== 'pronto') return undefined
    const espera = setTimeout(() => {
      navigate(rotaInicialPorPerfil(sessao?.usuario?.role), { replace: true })
    }, 2200)
    return () => clearTimeout(espera)
  }, [etapa, navigate, sessao?.usuario?.role])

  if (!sessao?.token) {
    return <Navigate to="/entrar" replace />
  }

  // quem não tem senha temporária não precisa estar aqui
  if (!sessao.usuario?.senhaTemporaria && etapa !== 'pronto') {
    return <Navigate to={rotaInicialPorPerfil(sessao.usuario?.role)} replace />
  }

  const primeiroNome = sessao.usuario?.nome?.trim().split(' ')[0]

  function sair() {
    limparSessao()
    navigate('/entrar', { replace: true })
  }

  // Passo 1: valida a nova senha e pede o código por e-mail.
  async function enviarCodigo(event) {
    event?.preventDefault()
    setErroGeral(null)

    const encontrados = {
      novaSenha: validarSenha(novaSenha),
      confirmacao: !confirmacao
        ? 'Repita a nova senha.'
        : confirmacao !== novaSenha
          ? 'As senhas não são iguais.'
          : '',
    }
    const comErro = Object.fromEntries(Object.entries(encontrados).filter(([, mensagem]) => mensagem))
    setErros(comErro)
    if (Object.keys(comErro).length > 0) return

    setEnviando(true)
    try {
      await enviarCodigoTrocaSenha()
      setCodigo('')
      setAviso('Enviamos um código de 6 dígitos para o seu e-mail. Ele vale por 2 minutos.')
      setEtapa('codigo')
    } catch (requestError) {
      console.error(requestError)
      setErroGeral(mensagemDoErro(requestError, 'Não foi possível enviar o código. Tente novamente.'))
    } finally {
      setEnviando(false)
    }
  }

  // Passo 2: confere o código e grava a nova senha.
  async function confirmar(event) {
    event.preventDefault()
    setErroGeral(null)

    if (!/^\d{6}$/.test(codigo)) {
      setErros({ codigo: 'Digite os 6 números do código.' })
      return
    }
    setErros({})

    setEnviando(true)
    try {
      const usuarioAtualizado = await trocarSenhaTemporaria({ novaSenha, codigo })

      salvarSessao({
        token: sessao.token,
        usuario: { ...sessao.usuario, ...usuarioAtualizado, senhaTemporaria: false },
      })
      setAviso(null)
      setEtapa('pronto')
    } catch (requestError) {
      console.error(requestError)
      setErroGeral(
        mensagemDoErro(requestError, 'Não foi possível salvar a nova senha. Tente novamente.'),
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f6ef] px-6 py-10 text-[#243d38]">
      <div className="w-full max-w-md rounded-2xl border border-[#e1e7df] bg-white p-7 shadow-[0_18px_46px_rgba(39,70,59,.08)] sm:p-9">
        <p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">PRIMEIRO ACESSO</p>

        <h1 className="m-0 font-serif text-[clamp(1.7rem,3vw,2.2rem)] font-normal leading-[1.1] tracking-[-1px]">
          {primeiroNome ? `Bem-vindo(a), ${primeiroNome}!` : 'Bem-vindo(a)!'}
        </h1>

        <p className="mb-6 mt-3 text-sm leading-relaxed text-[#68766e]">
          Você entrou com uma senha temporária. Crie agora a sua própria senha para continuar.
        </p>

        {etapa === 'pronto' && (
          <div className="grid gap-3" role="status">
            <p className="m-0 rounded-lg bg-[#e6f1ea] p-3 text-sm font-medium text-[#24483d]">
              Senha alterada com sucesso! Levando você ao seu painel...
            </p>
          </div>
        )}

        {etapa === 'senha' && (
          <form className="grid gap-4" onSubmit={enviarCodigo} noValidate>
            <Campo
              id="nova-senha"
              label="Nova senha"
              valor={novaSenha}
              onChange={(event) => {
                setNovaSenha(event.target.value)
                setErros((anteriores) => ({ ...anteriores, novaSenha: undefined }))
              }}
              erro={erros.novaSenha}
              visivel={visivel}
              autoFocus
            />

            <Campo
              id="confirmar-senha"
              label="Repita a nova senha"
              valor={confirmacao}
              onChange={(event) => {
                setConfirmacao(event.target.value)
                setErros((anteriores) => ({ ...anteriores, confirmacao: undefined }))
              }}
              erro={erros.confirmacao}
              visivel={visivel}
            />

            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#68766e]">
              <input type="checkbox" checked={visivel} onChange={(event) => setVisivel(event.target.checked)} />
              Mostrar senhas
            </label>

            <p className="m-0 text-[11px] text-[#88958d]">
              Use de 6 a 72 caracteres, com pelo menos uma letra e um número, sem espaços.
            </p>

            {erroGeral && (
              <p className="m-0 rounded-lg bg-[#fce8e5] p-3 text-xs text-[#a34d46]" role="alert">
                {erroGeral}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="cursor-pointer rounded-full border-0 bg-[#315c50] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24483d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Enviando código...' : 'Enviar código para o meu e-mail'}
            </button>
          </form>
        )}

        {etapa === 'codigo' && (
          <form className="grid gap-4" onSubmit={confirmar} noValidate>
            {aviso && (
              <p className="m-0 rounded-lg bg-[#e6f1ea] p-3 text-xs text-[#24483d]" role="status">
                {aviso}
              </p>
            )}

            <Campo
              id="codigo-confirmacao"
              label="Código de 6 dígitos"
              valor={codigo}
              onChange={(event) => {
                setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))
                setErros((anteriores) => ({ ...anteriores, codigo: undefined }))
              }}
              erro={erros.codigo}
              numerico
              autoFocus
            />

            {erroGeral && (
              <p className="m-0 rounded-lg bg-[#fce8e5] p-3 text-xs text-[#a34d46]" role="alert">
                {erroGeral}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="cursor-pointer rounded-full border-0 bg-[#315c50] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24483d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Confirmando...' : 'Confirmar e trocar senha'}
            </button>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <button
                type="button"
                onClick={enviarCodigo}
                disabled={enviando}
                className="cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-[#315c50] underline underline-offset-4 disabled:opacity-60"
              >
                Reenviar código
              </button>
              <button
                type="button"
                onClick={() => {
                  setEtapa('senha')
                  setErroGeral(null)
                  setErros({})
                }}
                className="cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-[#68766e] underline underline-offset-4"
              >
                Voltar e corrigir a senha
              </button>
            </div>
          </form>
        )}

        {etapa !== 'pronto' && (
        <button
          type="button"
          onClick={sair}
          className="mt-5 cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-[#68766e] underline underline-offset-4"
        >
          Sair e entrar depois
        </button>
        )}
      </div>
    </main>
  )
}