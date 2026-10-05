import { lazy, Suspense, useState } from "react";
import Button from "./SupervisorButton";

// O PDF é pesado: só é carregado quando o supervisor pede para visualizar.
const TermoPdfModal = lazy(() => import("./TermoPdfModal"));

// Compara textos ignorando maiúsculas, espaços e acentos.
function normalizar(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim()
        .toLowerCase();
}

function Dado({ rotulo, valor }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="flex text-xs flex-col font-medium text-gray-400 uppercase">{rotulo}</p>
            <span className="text-md font-bold text-[#2E4039] break-words">{valor}</span>
        </div>
    );
}

export default function SupervisorModalCard({ form, onClose, onAprovar, onDevolver, desabilitado }) {

    const [verTermo, setVerTermo] = useState(false);

    if (!form) return null;

    const { id, name, ra, status, course, discipline, date, period, signatureDate, termId, email, signature, justificativa, monitor, termo, termoDados } = form;

    const bloqueio = desabilitado ? "opacity-50 pointer-events-none" : ""

    // Confere se o que está no cadastro bate com o que está no termo.
    const divergencias = []
    if (monitor && termo) {
        if (normalizar(monitor.nome) !== normalizar(termo.nomeEstudante)) divergencias.push("nome")
        if (normalizar(monitor.ra) !== normalizar(termo.ra)) divergencias.push("RA")
        if (normalizar(monitor.curso) !== normalizar(termo.curso)) divergencias.push("curso")
    }

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

                {divergencias.length > 0 && (
                  <div className="p-4 border border-amber-300 bg-amber-50 rounded-2xl mb-4 text-sm text-amber-800" role="alert">
                    <span className="font-bold">Atenção:</span> {divergencias.join(", ")} do cadastro
                    {" "}não confere com o que consta no termo. Verifique antes de aprovar.
                  </div>
                )}

                <div className="p-6 border border-gray-200 bg-white rounded-2xl mb-4">
                  <p className="uppercase text-lg text-[#939E95] mb-4 font-bold">dados do cadastro</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Dado rotulo="RA" valor={ra} />
                    <Dado rotulo="curso" valor={course} />
                    <Dado rotulo="e-mail" valor={email} />
                    <Dado rotulo="disciplina" valor={discipline} />
                    <Dado rotulo="período" valor={period} />
                  </div>
                </div>

                {termoDados && (
                  <div className="p-6 border border-gray-200 bg-white rounded-2xl mb-4">
                    <p className="uppercase text-lg text-[#939E95] mb-4 font-bold">dados do termo de compromisso</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Dado rotulo="nome do estudante" valor={termoDados.nomeEstudante} />
                      <Dado rotulo="RA" valor={termoDados.ra} />
                      <Dado rotulo="CPF" valor={termoDados.cpf} />
                      <Dado rotulo="curso" valor={termoDados.curso} />
                      <Dado rotulo="disciplina" valor={termoDados.disciplina} />
                      <Dado rotulo="oferta" valor={termoDados.oferta} />
                      <Dado rotulo="carga horária" valor={termoDados.cargaHoraria} />
                      <Dado rotulo="edital nº" valor={termoDados.editalNumero} />
                      <Dado rotulo="professor orientador" valor={termoDados.nomeProfessor} />
                      <Dado rotulo="coordenador do curso" valor={termoDados.nomeCoordenador} />
                      <Dado rotulo="unidade" valor={termoDados.unidade} />
                      <Dado rotulo="cidade" valor={termoDados.cidade} />
                      <Dado rotulo="data de assinatura" valor={termoDados.dataAssinatura} />
                      <Dado rotulo="número de vias" valor={termoDados.numeroVias} />
                    </div>
                  </div>
                )}

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

            {(termo || status === "aguardando") && (
                <div className="flex gap-2 justify-end mt-8 border-t border-gray-200 pt-4 flex-wrap">
                    {termo && (
                        <Button onClick={() => setVerTermo(true)}>Visualizar termo (PDF)</Button>
                    )}
                    {status === "aguardando" && (
                        <>
                            <Button variant="reprovar" className={bloqueio} onClick={() => onDevolver(id)}>Devolver</Button>
                            <Button variant="aprovar" className={bloqueio} onClick={() => onAprovar(id)}>Aprovar e encaminhar à Gestão</Button>
                        </>
                    )}
                </div>
            )}

            {verTermo && termo && (
                <Suspense fallback={null}>
                    <TermoPdfModal termo={termo} onClose={() => setVerTermo(false)} />
                </Suspense>
            )}
        </div>
    );
}