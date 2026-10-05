import Button from "./SupervisorButton";

export default function SupervisorModalCard({ form, onClose, onAprovar, onDevolver, desabilitado }) {

    if (!form) return null;

    const { id, name, ra, status, course, discipline, date, period, signatureDate, termId, email, signature, justificativa } = form;

    const label = "flex text-xs flex-col font-medium text-gray-400 uppercase mt-2"
    const formData = "text-md font-bold text-[#2E4039]"
    const bloqueio = desabilitado ? "opacity-50 pointer-events-none" : ""

    return (

        <div className="relative z-50 h-full w-full overflow-y-auto bg-[#FAF9F6] p-6 shadow-xl rounded-xl sm:rounded-l-2xl">
            <button 
                onClick={onClose}
                className="p-2 cursor-pointer absolute text-xl top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
                ✕
            </button>
            <h2 className="text-2xl font-bold pb-4 border-b border-gray-200">Detalhes da Ficha de Inscrição</h2>
            <div className="my-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-500">
                      {/* foto ser */}
                    </div>
                    <p className="font-bold text-[#2E4039] text-2xl">{name}</p>
                  </div>
                  <p className="font-bold text-lg">{date}</p>
                </div>
                <div className="p-6 border border-gray-200 bg-white rounded-2xl mb-4">
                  <p className="uppercase text-lg text-[#939E95] mb-4 font-bold">dados do candidato</p>
                  <div className="flex items-start gap-8">
                    <div className="flex flex-col gap-1 w-1/2">
                      <p className={label}>RA: </p>
                      <span className={formData}>{ra}</span>
                      <p className={label}>disciplina:</p>
                      <span className={formData}>{discipline}</span>
                      <p className={label}>e-mail:</p>
                      <span className={formData}>{email}</span>
                    </div>
                    <div className="flex flex-col gap-1 w-1/2">
                      <p className={label}>curso:</p>
                      <span className={formData}>{course}</span>
                      <p className={label}>período:</p>
                      <span className={formData}>{period}</span>
                    </div>
                  </div>
                </div>

                {status === "devolvido" && justificativa && (
                  <div className="p-6 border border-red-200 bg-red-50 rounded-2xl mb-4">
                    <p className="uppercase text-lg text-red-500 mb-2 font-bold">motivo da devolução</p>
                    <p className="text-[#2E4039]">{justificativa}</p>
                  </div>
                )}

                <div className="p-6 border border-gray-200 bg-white rounded-2xl">
                  <p className="uppercase text-lg text-[#939E95] mb-4 font-bold">termo de compromisso - assinatura digital</p>
                  <div className="flex items-center justify-center mb-4 p-6 border border-gray-200 bg-[#FAF9F6] rounded-2xl h-[200px]">
                    {signature ? (
                      <img
                        src={signature}
                        alt={`Assinatura de ${name}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">Assinatura não disponível</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{signatureDate} · {termId}</span>
                </div>
            </div>

            {status === "aguardando" && (
                <div className="flex gap-2 justify-end mt-8 border-t border-gray-200 pt-4 flex-wrap">
                    <Button variant="reprovar" className={bloqueio} onClick={() => onDevolver(id)}>Devolver</Button>
                    <Button variant="aprovar" className={bloqueio} onClick={() => onAprovar(id)}>Aprovar e encaminhar à Gestão</Button>
                </div>
            )}
        </div>
    );
}