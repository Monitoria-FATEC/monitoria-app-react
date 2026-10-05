import { useCallback, useEffect, useState } from "react";
import SupervisorCard from "../../components/supervisor/SupervisorCard";
import SupervisorModalCard from "../../components/supervisor/SupervisorModalCard";
import DevolverModal from "../../components/supervisor/DevolverModal";
import {
    aprovarInscricao,
    devolverInscricao,
    listarInscricoes,
} from "../../api/inscricaoApi";

// Cada aba do painel corresponde a um status da inscrição no back.
const statusData = [
    { id: "aguardando", title: "Aguardando", backend: "AGUARDANDO_SUPERVISOR" },
    { id: "encaminhado", title: "Encaminhados", backend: "AGUARDANDO_GESTAO" },
    { id: "aprovado", title: "Aprovados", backend: "HOMOLOGADA" },
    { id: "devolvido", title: "Devolvidos", backend: "DEVOLVIDA" },
];

const ofertaRotulo = { anual: "Anual", semestral: "Semestral" };

// O back devolve datas sem fuso ("2026-09-29" ou "2026-09-29T17:04:06"),
// então formatamos pelo texto para não deslocar o dia.
function formatarData(valor) {
    if (!valor) return "—";
    const [ano, mes, dia] = String(valor).split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(valor) {
    if (!valor) return "—";
    const [, hora] = String(valor).split("T");
    return hora ? `${formatarData(valor)} às ${hora.slice(0, 5)}` : formatarData(valor);
}

function ou(valor) {
    return valor === null || valor === undefined || valor === "" ? "—" : valor;
}

// Converte a inscrição do back no formato que os cards já usam.
function paraForm(inscricao, tabId) {
    const { monitor, termo } = inscricao;

    return {
        id: inscricao.id,
        status: tabId,
        name: monitor?.nome ?? "Monitor não encontrado",
        ra: monitor?.ra ?? "—",
        course: monitor?.curso ?? "—",
        email: monitor?.email ?? "—",
        discipline: termo?.disciplina ?? "—",
        period: termo
            ? `${formatarData(termo.periodoInicio)} a ${formatarData(termo.periodoFim)}`
            : "—",
        date: formatarData(inscricao.dataSubmissao),
        signatureDate: termo?.dataEnvio
            ? formatarDataHora(termo.dataEnvio)
            : formatarData(termo?.dataAssinatura),
        termId: termo?.id ? `#${termo.id.slice(0, 8)}` : "—",
        signature: termo?.assinaturaEstudante ?? null,
        justificativa: inscricao.justificativaDevolucao ?? null,
        monitor: monitor ?? null,
        termo: termo ?? null,
        termoDados: termo
            ? {
                nomeEstudante: ou(termo.nomeEstudante),
                ra: ou(termo.ra),
                cpf: ou(termo.cpf),
                curso: ou(termo.curso),
                disciplina: ou(termo.disciplina),
                oferta: ofertaRotulo[termo.oferta] ?? ou(termo.oferta),
                cargaHoraria:
                    termo.cargaHoraria != null ? `${termo.cargaHoraria}h semanais` : "—",
                editalNumero: ou(termo.editalNumero),
                nomeProfessor: ou(termo.nomeProfessor),
                nomeCoordenador: ou(termo.nomeCoordenador),
                unidade: ou(termo.unidade),
                cidade: ou(termo.cidade),
                dataAssinatura: formatarData(termo.dataAssinatura),
                numeroVias: ou(termo.numeroVias),
            }
            : null,
    };
}

function mensagemDeErro(error, padrao) {
    if (error.response?.status === 403) {
        return "Você não tem permissão para esta ação.";
    }
    return error.response?.data?.message || padrao;
}

export default function SupervisorAprovar() {
    const [isActive, setIsActive] = useState("aguardando");
    const [selectedId, setSelectedId] = useState(null);
    const [devolvendoId, setDevolvendoId] = useState(null);

    const [forms, setForms] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async () => {
        try {
            const listas = await Promise.all(
                statusData.map((tab) => listarInscricoes(tab.backend))
            );

            setForms(
                listas.flatMap((lista, indice) =>
                    lista.map((item) => paraForm(item, statusData[indice].id))
                )
            );
            setErro(null);
        } catch (requestError) {
            console.error(requestError);
            setErro("Não foi possível carregar as fichas. Verifique a conexão com o servidor.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function handleAprovar(id) {
        setProcessando(true);
        setErro(null);

        try {
            await aprovarInscricao(id);
            setSelectedId(null);
            await carregar();
        } catch (requestError) {
            console.error(requestError);
            setErro(mensagemDeErro(requestError, "Não foi possível aprovar a ficha."));
        } finally {
            setProcessando(false);
        }
    }

    async function handleDevolver(justificativa) {
        setProcessando(true);
        setErro(null);

        try {
            await devolverInscricao(devolvendoId, justificativa);
            setDevolvendoId(null);
            setSelectedId(null);
            await carregar();
        } catch (requestError) {
            console.error(requestError);
            setErro(mensagemDeErro(requestError, "Não foi possível devolver a ficha."));
        } finally {
            setProcessando(false);
        }
    }

    //filtra os forms para cada tab
    const filteredForms = forms.filter((form) => form.status === isActive);
    //numero de forms pendentes
    const qntdAguardando = forms.filter((form) => form.status === "aguardando").length;

    const modalForm = forms.find((form) => form.id === selectedId);
    const devolverForm = forms.find((form) => form.id === devolvendoId);

    return (
        <div>
            <div className="w-full flex items-center gap-4 border-b border-gray-200 px-6  ">
                {statusData.map((tab) => (
                    <button
                        key={tab.id}
                        className={`group relative cursor-pointer py-3 border-b px-1 hover:text-black transition ${isActive === tab.id ? "border-black text-black" : "border-transparent text-[#939E95]"}`}
                        onClick={() => setIsActive(tab.id)}
                    >
                        {tab.title}
                        {tab.id === "aguardando" && (
                            <div className={`flex items-center justify-center absolute top-0 -right-2 bg-amber-700 text-white text-xs w-5 h-5 rounded-full group-hover:opacity-100 ${isActive === "aguardando" ? "opacity-100" : "opacity-40"}`}>
                                {qntdAguardando}
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {erro && (
                <p className="mx-6 mt-4 text-sm text-[#a34d46]" role="alert">
                    {erro}
                </p>
            )}

            <div className="grid grid-cols-3 gap-4 p-6">
                {carregando ? (
                    <div className="col-span-3 text-center text-gray-500">
                        Carregando fichas...
                    </div>
                ) : filteredForms.length > 0 ? (
                    filteredForms.map((form) => (
                        <SupervisorCard
                            key={form.id}
                            form={form}
                            onClick={() => setSelectedId(form.id)}
                            onAprovar={handleAprovar}
                            onDevolver={setDevolvendoId}
                            desabilitado={processando}
                        />
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500">
                        Nenhuma ficha encontrada.
                    </div>
                )}
            </div>

            <div
                onClick={(event) => {
                    if (event.target === event.currentTarget) setSelectedId(null)
                }}
                className={`fixed inset-0 z-40 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-all ${modalForm ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div className={`${modalForm ? "translate-x-0" : "translate-x-full"} transition-all h-full p-2 w-[800px]`}>
                    <SupervisorModalCard
                        form={modalForm}
                        onAprovar={handleAprovar}
                        onDevolver={setDevolvendoId}
                        onClose={() => setSelectedId(null)}
                        desabilitado={processando}
                    />
                </div>
            </div>

            {devolverForm && (
                <DevolverModal
                    form={devolverForm}
                    enviando={processando}
                    onConfirmar={handleDevolver}
                    onCancelar={() => setDevolvendoId(null)}
                />
            )}
        </div>
    );
}