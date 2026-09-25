import { useState } from 'react'
import { cadastrarMonitor } from '../../api/monitorApi'
import { cursosFatecZonaLeste } from '../../data/cursosFatecZonaLeste'

const formularioInicial = { nome: '', ra: '', email: '', curso: '' }
const campoClassName = 'w-full rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15'

export default function MonitorSignupForm() {
  const [formulario, setFormulario] = useState(formularioInicial)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const [erro, setErro] = useState(null)

  function handleChange(event) {
    setFormulario((formularioAtual) => ({ ...formularioAtual, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setEnviando(true)
    setErro(null)
    setMensagem(null)
    try {
      const resultado = await cadastrarMonitor(formulario)
      setMensagem(`Cadastro enviado! Status: ${resultado.status}`)
      setFormulario(formularioInicial)
    } catch (requestError) {
      setErro('Não foi possível enviar o cadastro. Confira os dados e tente novamente.')
      console.error(requestError)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="grid gap-[17px]" onSubmit={handleSubmit}>
      <div className="mb-1"><span className="mb-4 block text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">PRÉ-CADASTRO</span><h3 className="mb-2 font-serif text-[28px] font-normal tracking-[-.5px] text-[#243d38]">Compartilhe o que você sabe</h3><p className="m-0 text-sm leading-relaxed text-[#68766e]">Preencha seus dados para entrar na rede de monitores da FATEC Zona Leste.</p></div>
      <label className="grid gap-1.5"><span className="text-xs font-bold text-[#39544c]">Nome completo</span><input className={campoClassName} type="text" name="nome" value={formulario.nome} onChange={handleChange} required placeholder="Como podemos te chamar?" /></label>
      <div className="grid gap-[13px] sm:grid-cols-[.65fr_1.35fr]"><label className="grid gap-1.5"><span className="text-xs font-bold text-[#39544c]">RA</span><input className={campoClassName} type="text" name="ra" value={formulario.ra} onChange={handleChange} required placeholder="Seu registro acadêmico" /></label><label className="grid gap-1.5"><span className="text-xs font-bold text-[#39544c]">E-mail institucional</span><input className={campoClassName} type="email" name="email" value={formulario.email} onChange={handleChange} required placeholder="voce@fatec.sp.gov.br" /></label></div>
      <label className="grid gap-1.5"><span className="text-xs font-bold text-[#39544c]">Curso</span><select className={campoClassName} name="curso" value={formulario.curso} onChange={handleChange} required><option value="">Selecione seu curso</option>{cursosFatecZonaLeste.map((curso) => <option key={curso} value={curso}>{curso}</option>)}</select></label>
      <p className="m-[-2px_0_0] text-[11px] leading-relaxed text-[#88958d]">A senha e o cadastro de alunos serão implementados em uma próxima etapa.</p>
      <button className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-[17px] py-[15px] text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Continuar'}<span aria-hidden="true">→</span></button>
      {mensagem && <p className="m-0 text-xs text-[#2d7650]" role="status">{mensagem}</p>}
      {erro && <p className="m-0 text-xs text-[#a34d46]" role="alert">{erro}</p>}
    </form>
  )
}
