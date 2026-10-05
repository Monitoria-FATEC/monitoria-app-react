import Button from "./SupervisorButton";

export default function SupervisorCard({ form, onClick, onAprovar, onDevolver, desabilitado }) {

  const { id, name, ra, status, course, discipline, date, justificativa } = form;

  const bloqueio = desabilitado ? "opacity-50 pointer-events-none" : "";

  return(
    <article className="p-4 border border-gray-200 hover:border-gray-400 rounded-xl transition-all">
      <button
        type="button"
        onClick={onClick}
        className="block w-full cursor-pointer text-left"
        aria-label={`Ver detalhes da solicitação de ${name}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <span className="font-bold text-[#2E4039]">{name}</span>
          </div>
          <span className="font-bold text-[#2E4039]">{date}</span>
        </div>
        <div className="flex flex-col mt-6 gap-2 font-medium text-[#939E95]">
          <p>ra: <span className="font-bold text-[#2E4039]">{ra}</span></p>
          <p>curso: <span className="font-bold text-[#2E4039]">{course}</span></p>
          <p>disciplina: <span className="font-bold text-[#2E4039]">{discipline}</span></p>
        </div>
      </button>

      {status === "devolvido" && justificativa && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="font-bold">Motivo da devolução:</span> {justificativa}
        </p>
      )}

      {status === "aguardando" && (
        <div className="flex items-center gap-2 mt-6 flex-wrap">
          <Button variant="reprovar" className={bloqueio} onClick={() => onDevolver(id)}>Devolver</Button>
          <Button variant="aprovar" className={bloqueio} onClick={() => onAprovar(id)}>Aprovar e encaminhar à Gestão</Button>
        </div>
      )}
    </article>
  )
}