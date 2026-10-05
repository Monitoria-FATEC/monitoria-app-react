import Button from "./SupervisorButton";

export default function SupervisorCard({ form, onClick, onStatusChange }) {

  const { name, ra, status, course, discipline, date } = form;

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
      {status === "aguardando" && (
        <div className="flex items-center gap-2 mt-6 flex-wrap">
          <Button value="encaminhado" onClick={(event) => onStatusChange(event, ra)}>Encaminhar à Gestão</Button>
          <Button value="reprovado" variant="reprovar" onClick={(event) => onStatusChange(event, ra)}>Reprovar</Button>
          <Button value="aprovado" variant="aprovar" onClick={(event) => onStatusChange(event, ra)}>Aprovar</Button>
        </div>
      )}
    </article>
  )
}