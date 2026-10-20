import { useCallback, useEffect, useState } from "react";
import Button from "../../components/supervisor/SupervisorButton";
import DevolverModal from "../../components/supervisor/DevolverModal";
import {
    aprovarContaAgencia,
    devolverContaAgencia,
    listarContasAgencia,
} from "../../api/contaAgenciaApi";

// Cada aba é um status da conta e agência no back.
const abas = [
    { id: "AGUARDANDO", title: "Aguardando", vazio: "Nenhuma conta aguardando conferência." },
    { id: "APROVADO", title: "Aprovadas", vazio: "Nenhuma conta aprovada ainda." },
    { id: "DEVOLVIDO", title: "Devolvidas", vazio: "Nenhuma conta devolvida." },
];

// O back devolve datas sem fuso ("2026-10-20"), então formatamos pelo texto.
function formatarData(valor) {
    if (!valor) return "";
    const [ano, mes, dia] = String(valor).split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
}

function mensagemDeErro(error, padrao) {
    if (error.response?.status === 403) {
        return "Você não tem permissão para esta ação.";
    }
    return error.response?.data?.message || padrao;
}

function Linha({ rotulo, valor, destaque }) {
    return (
        <p>
            {rotulo}:{" "}
            <span className={`font-bold text-[#2E4039] ${destaque ? "font-mono text-base" : ""}`}>
                {valor || "—"}
            </span>
        </p>
    );
}

function ContaCard({ item, onAprovar, onDevolver, desabilitado }) {
    const bloqueio = desabilitado ? "opacity-50 pointer-events-none" : "";
    const status = item.statusContaAgencia;

    return (
        <article className="p-4 border border-gray-200 hover:border-gray-400 rounded-xl transition-all">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300" />
                <span className="font-bold text-[#2E4039]">{item.nome}</span>
            </div>

            <div className="flex flex-col mt-6 gap-2 font-medium text-[#939E95]">
                <Linha rotulo="ra" valor={item.ra} />
                <Linha rotulo="curso" valor={item.curso} />
                <Linha rotulo="e-mail" valor={item.email} />
                <Linha rotulo="conta" valor={item.numeroConta} destaque />
                <Linha rotulo="agência" valor={item.agencia} destaque />
            </div>

            {status === "DEVOLVIDO" && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <span className="font-bold">Motivo da devolução:</span>{" "}
                    {item.justificativaContaAgencia || "—"}
                    {item.dataLimiteContaAgencia && (
                        <span className="block mt-1">
                            Prazo: {formatarData(item.dataLimiteContaAgencia)}
                        </span>
                    )}
                </p>
            )}

            {status === "AGUARDANDO" && (
                <div className="flex items-center gap-2 mt-6 flex-wrap">
                    <Button variant="reprovar" className={bloqueio} onClick={() => onDevolver(item.idMonitor)}>
                        Devolver
                    </Button>
                    <Button variant="aprovar" className={bloqueio} onClick={() => onAprovar(item.idMonitor)}>
                        Aprovar
                    </Button>
                </div>
            )}
        </article>
    );
}

export default function SupervisorContaBanco() {
    const [aba, setAba] = useState("AGUARDANDO");
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState(null);
    const [devolvendoId, setDevolvendoId] = useState(null);

    const carregar = useCallback(async () => {
        try {
            setItens(await listarContasAgencia());
            setErro(null);
        } catch (requestError) {
            console.error(requestError);
            setErro("Não foi possível carregar as contas. Verifique a conexão com o servidor.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function executar(acao, mensagemPadrao) {
        setProcessando(true);
        setErro(null);

        try {
            await acao();
            await carregar();
        } catch (requestError) {
            console.error(requestError);
            setErro(mensagemDeErro(requestError, mensagemPadrao));
        } finally {
            setProcessando(false);
        }
    }

    function handleAprovar(idMonitor) {
        const monitor = itens.find((item) => item.idMonitor === idMonitor);
        const confirmou = window.confirm(
            `Confirmar que a conta e a agência de ${monitor?.nome ?? "este monitor"} estão corretas? ` +
            "O monitor poderá preencher o perfil de atendimento."
        );
        if (!confirmou) return;

        return executar(() => aprovarContaAgencia(idMonitor), "Não foi possível aprovar a conta.");
    }

    function handleDevolver(justificativa, prazo) {
        return executar(async () => {
            await devolverContaAgencia(devolvendoId, justificativa, prazo);
            setDevolvendoId(null);
        }, "Não foi possível devolver a conta.");
    }

    const doStatus = (status) => itens.filter((item) => item.statusContaAgencia === status);
    const exibidos = doStatus(aba);
    const pendentes = doStatus("AGUARDANDO").length;
    const abaAtual = abas.find((a) => a.id === aba);

    const devolvendo = itens.find((item) => item.idMonitor === devolvendoId);

    return (
        <div>
            <div className="w-full flex items-center gap-4 border-b border-gray-200 px-6">
                {abas.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`group relative cursor-pointer py-3 border-b px-1 hover:text-black transition ${aba === tab.id ? "border-black text-black" : "border-transparent text-[#939E95]"}`}
                        onClick={() => setAba(tab.id)}
                    >
                        {tab.title}
                        {tab.id === "AGUARDANDO" && (
                            <div className={`flex items-center justify-center absolute top-0 -right-2 bg-amber-700 text-white text-xs w-5 h-5 rounded-full group-hover:opacity-100 ${aba === "AGUARDANDO" ? "opacity-100" : "opacity-40"}`}>
                                {pendentes}
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
                        Carregando contas...
                    </div>
                ) : exibidos.length > 0 ? (
                    exibidos.map((item) => (
                        <ContaCard
                            key={item.idMonitor}
                            item={item}
                            onAprovar={handleAprovar}
                            onDevolver={setDevolvendoId}
                            desabilitado={processando}
                        />
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500">
                        {abaAtual.vazio}
                    </div>
                )}
            </div>

            {devolvendo && (
                <DevolverModal
                    form={{ name: devolvendo.nome, ra: devolvendo.ra }}
                    enviando={processando}
                    onConfirmar={handleDevolver}
                    onCancelar={() => setDevolvendoId(null)}
                    titulo="Devolver conta e agência"
                    complemento="O monitor verá este motivo para corrigir os dados e reenviar."
                    placeholder="Ex.: Número da agência incompleto. Confira no seu cartão e reenvie."
                    rotuloBotao="Devolver dados"
                />
            )}
        </div>
    );
}