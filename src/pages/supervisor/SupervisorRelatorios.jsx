import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/supervisor/SupervisorButton";
import { listarInscricoes } from "../../api/inscricaoApi";
import {
    GRUPOS,
    contar,
    exportarExcel,
    exportarPdf,
    filtrar,
    montarLinhas,
} from "../../utils/relatorioInscricoes";

// Cor de cada situação na tabela.
const COR_SITUACAO = {
    entregues: "bg-green-100 text-green-800",
    aguardando: "bg-amber-100 text-amber-800",
    atrasados: "bg-red-100 text-red-700",
    devolvidos: "bg-orange-100 text-orange-800",
    outros: "bg-gray-100 text-gray-700",
};

// Cartões do topo: mostram o total e funcionam como filtro.
const CARTOES = [
    { id: "entregues", titulo: "Entregues", ajuda: "Inscrições homologadas", destaque: "border-green-300" },
    { id: "aguardando", titulo: "Aguardando", ajuda: "Com o supervisor ou em assinatura", destaque: "border-amber-300" },
    { id: "atrasados", titulo: "Atrasados", ajuda: "Devolvidas com prazo vencido", destaque: "border-red-300" },
    { id: "devolvidos", titulo: "Devolvidos", ajuda: "Devolvidas ainda no prazo", destaque: "border-orange-300" },
];

export default function SupervisorRelatorios() {
    const [inscricoes, setInscricoes] = useState([]);
    const [filtro, setFiltro] = useState("todas");
    const [carregando, setCarregando] = useState(true);
    const [exportando, setExportando] = useState(null);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async () => {
        try {
            setInscricoes(await listarInscricoes());
            setErro(null);
        } catch (requestError) {
            console.error(requestError);
            setErro("Não foi possível carregar o relatório. Verifique a conexão com o servidor.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const { linhas, semMonitor } = useMemo(() => montarLinhas(inscricoes), [inscricoes]);
    const totais = useMemo(() => contar(linhas), [linhas]);
    const visiveis = useMemo(() => filtrar(linhas, filtro), [linhas, filtro]);

    const tituloDoFiltro = GRUPOS.find((grupo) => grupo.id === filtro)?.titulo ?? "Todas";
    const semDados = !carregando && visiveis.length === 0;

    async function exportar(tipo) {
        setExportando(tipo);
        setErro(null);
        try {
            if (tipo === "pdf") await exportarPdf(visiveis, filtro, tituloDoFiltro);
            else await exportarExcel(visiveis, filtro);
        } catch (exportError) {
            console.error(exportError);
            setErro("Não foi possível gerar o arquivo. Tente novamente.");
        } finally {
            setExportando(null);
        }
    }

    const bloqueio = semDados || exportando ? "opacity-50 pointer-events-none" : "";

    return (
        <div className="px-6 pb-6">
            {erro && (
                <p className="mb-4 text-sm text-[#a34d46]" role="alert">
                    {erro}
                </p>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {CARTOES.map((cartao) => (
                    <button
                        key={cartao.id}
                        type="button"
                        onClick={() => setFiltro(filtro === cartao.id ? "todas" : cartao.id)}
                        aria-pressed={filtro === cartao.id}
                        className={`cursor-pointer rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                            filtro === cartao.id
                                ? `${cartao.destaque} bg-[#FAF9F6] shadow-md`
                                : "border-gray-200 bg-white"
                        }`}
                    >
                        <p className="text-sm font-medium uppercase text-[#939E95]">{cartao.titulo}</p>
                        <p className="mt-1 text-3xl font-bold text-[#2E4039]">
                            {carregando ? "…" : totais[cartao.id]}
                        </p>
                        <p className="mt-1 text-xs text-[#68766e]">{cartao.ajuda}</p>
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar relatório">
                    {GRUPOS.map((grupo) => (
                        <button
                            key={grupo.id}
                            type="button"
                            onClick={() => setFiltro(grupo.id)}
                            aria-pressed={filtro === grupo.id}
                            className={`cursor-pointer rounded-full border px-4 py-1 text-sm font-bold transition-all ${
                                filtro === grupo.id
                                    ? "border-[#2F5146] bg-[#2F5146] text-white"
                                    : "border-gray-200 bg-white text-[#2E4039] hover:border-gray-400"
                            }`}
                        >
                            {grupo.titulo} ({carregando ? "…" : totais[grupo.id]})
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="default" className={bloqueio} onClick={() => exportar("excel")}>
                        {exportando === "excel" ? "Gerando Excel…" : "Exportar Excel"}
                    </Button>
                    <Button variant="aprovar" className={bloqueio} onClick={() => exportar("pdf")}>
                        {exportando === "pdf" ? "Gerando PDF…" : "Exportar PDF"}
                    </Button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[820px] text-left text-sm">
                    <caption className="sr-only">Relatório de inscrições de monitoria — {tituloDoFiltro}</caption>
                    <thead className="bg-[#E9F0E5] text-[#2E4039]">
                        <tr>
                            <th scope="col" className="p-3 font-bold">Monitor</th>
                            <th scope="col" className="p-3 font-bold">RA</th>
                            <th scope="col" className="p-3 font-bold">Disciplina</th>
                            <th scope="col" className="p-3 font-bold">Situação</th>
                            <th scope="col" className="p-3 font-bold">Enviado em</th>
                            <th scope="col" className="p-3 font-bold">Prazo de correção</th>
                            <th scope="col" className="p-3 font-bold">Atualizado em</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carregando ? (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-500">
                                    Carregando relatório...
                                </td>
                            </tr>
                        ) : semDados ? (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-500">
                                    Nenhuma inscrição neste filtro.
                                </td>
                            </tr>
                        ) : (
                            visiveis.map((linha) => (
                                <tr key={linha.id} className="border-t border-gray-100">
                                    <td className="p-3 font-bold text-[#2E4039]">{linha.nome}</td>
                                    <td className="p-3">{linha.ra}</td>
                                    <td className="p-3">{linha.disciplina}</td>
                                    <td className="p-3">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${COR_SITUACAO[linha.grupo]}`}>
                                            {linha.situacao}
                                            {linha.atraso > 0 ? ` há ${linha.atraso} ${linha.atraso === 1 ? "dia" : "dias"}` : ""}
                                        </span>
                                    </td>
                                    <td className="p-3">{linha.enviadoEm}</td>
                                    <td className="p-3">{linha.prazo}</td>
                                    <td className="p-3">{linha.atualizadoEm}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {semMonitor > 0 && (
                <p className="mt-3 text-xs text-[#939E95]">
                    {semMonitor} {semMonitor === 1 ? "inscrição foi ignorada" : "inscrições foram ignoradas"} porque o monitor
                    vinculado não existe mais.
                </p>
            )}
        </div>
    );
}