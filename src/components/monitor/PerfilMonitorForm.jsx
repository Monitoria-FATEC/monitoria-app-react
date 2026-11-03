import { useRef, useState } from 'react'

import {
  focarPrimeiroCampoInvalido,
  formatarTelefone,
  validarPerfil,
} from '../../utils/validacoes'
import FormField from './FormField'

export default function PerfilMonitorForm({ liberado, perfil, onChange, onSubmit }) {
  const formRef = useRef(null)
  const [erros, setErros] = useState({})

  function alterar(campo, valor) {
    onChange({ ...perfil, [campo]: valor })

    // o erro do campo some assim que a pessoa volta a editá-lo
    setErros((atuais) => Object.fromEntries(Object.entries(atuais).filter(([nome]) => nome !== campo)))
  }

  function enviar(event) {
    event.preventDefault()

    const encontrados = validarPerfil(perfil)
    setErros(encontrados)

    if (Object.keys(encontrados).length > 0) {
      focarPrimeiroCampoInvalido(formRef.current)
      return
    }

    onSubmit(event)
  }

  return (
    <section className="max-w-[760px] rounded-2xl border border-[#e2e6df] bg-white p-6 sm:p-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#769c8d]">INFORMAÇÕES DE ATENDIMENTO</p>
      <h2 className="mb-2 font-sans text-3xl font-normal">Meu perfil</h2>
      <p className="mb-7 text-sm leading-relaxed text-[#68766e]">Informe como os alunos poderão encontrar você.</p>

      {!liberado ? (
        <div className="rounded-xl bg-[#fff6d8] p-4 text-sm text-[#856c31]">A edição do perfil será liberada somente após a aprovação da conta e agência.</div>
      ) : (
        <form ref={formRef} className="grid gap-5" onSubmit={enviar} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Telefone para contato"
              type="tel"
              inputMode="tel"
              maxLength={15}
              placeholder="(11) 98765-4321"
              value={perfil.telefone}
              erro={erros.telefone}
              onChange={(event) => alterar('telefone', formatarTelefone(event.target.value))}
            />
            <FormField
              label="Local de atendimento"
              maxLength={100}
              value={perfil.localAtendimento}
              erro={erros.localAtendimento}
              onChange={(event) => alterar('localAtendimento', event.target.value)}
            />
          </div>
          <FormField
            label="Horários de atendimento"
            maxLength={200}
            value={perfil.horariosAtendimento}
            erro={erros.horariosAtendimento}
            onChange={(event) => alterar('horariosAtendimento', event.target.value)}
            placeholder="Ex.: terça e quinta, das 14h às 17h"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Link do WhatsApp"
              placeholder="https://wa.me/5511987654321"
              value={perfil.linkWhatsapp}
              erro={erros.linkWhatsapp}
              onChange={(event) => alterar('linkWhatsapp', event.target.value)}
            />
            <FormField
              label="Link do Teams"
              placeholder="https://teams.microsoft.com/..."
              value={perfil.linkTeams}
              erro={erros.linkTeams}
              onChange={(event) => alterar('linkTeams', event.target.value)}
            />
          </div>
          <fieldset className="grid gap-3 rounded-xl border border-[#e2e6df] p-4">
            <legend className="px-1 text-xs font-bold text-[#39544c]">Vigência da monitoria</legend>
            <p className="m-0 text-xs leading-relaxed text-[#68766e]">
              Informe o período em que você atende (por exemplo, o semestre). Depois do fim, seu perfil deixa de
              aparecer na página de monitorias para os alunos. A supervisão consegue ver esse período.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Início da vigência"
                type="date"
                value={perfil.vigenciaInicio}
                erro={erros.vigenciaInicio}
                onChange={(event) => alterar('vigenciaInicio', event.target.value)}
              />
              <FormField
                label="Fim da vigência"
                type="date"
                value={perfil.vigenciaFim}
                erro={erros.vigenciaFim}
                onChange={(event) => alterar('vigenciaFim', event.target.value)}
              />
            </div>
          </fieldset>
          <button className="rounded-lg bg-[#315c50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24483d]">Salvar perfil →</button>
        </form>
      )}
    </section>
  )
}