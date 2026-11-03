// Linha do tempo da inscrição: quem mudou o status, quando e por quê.
// Os registros vêm do back (campo "historico"), do mais antigo para o mais novo.

const ACOES = {
    ENVIO_DO_TERMO: { titulo: "Termo enviado pelo monitor", cor: "bg-gray-400" },
    DEVOLUCAO: { titulo: "Ficha devolvida para correção", cor: "bg-red-500" },
    REENVIO_DO_TERMO: { titulo: "Termo corrigido e reenviado", cor: "bg-amber-500" },
    APROVACAO: { titulo: "Aprovada pela supervisão", cor: "bg-green-600" },
    ENVIO_PARA_ASSINATURA: { titulo: "PDF enviado à Gestão para assinatura", cor: "bg-blue-500" },
    HOMOLOGACAO: { titulo: "Inscrição homologada", cor: "bg-green-700" },
};

const PERFIS = {
    MONITOR: "monitor",
    SUPERVISOR: "supervisor",
    GESTAO: "gestão",
    ADMIN: "administrador",
};

// O back manda "2026-11-02T21:03:47.4003672"; formatamos pelo texto para não deslocar o dia.
function formatarDataHora(valor) {
    if (!valor) return "—";
    const [data, hora] = String(valor).split("T");
    const [ano, mes, dia] = data.split("-");
    return hora ? `${dia}/${mes}/${ano} às ${hora.slice(0, 5)}` : `${dia}/${mes}/${ano}`;
}

export default function HistoricoInscricao({ historico }) {
    const registros = Array.isArray(historico) ? historico : [];

    return (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-6">
            <p className="mb-4 text-lg font-bold uppercase text-[#939E95]">
                histórico da inscrição
            </p>

            {registros.length === 0 ? (
                <p className="text-sm text-gray-400">
                    Nenhum registro. Esta inscrição é anterior ao histórico.
                </p>
            ) : (
                <ol className="ml-2 border-l-2 border-gray-200">
                    {registros.map((registro, indice) => {
                        const acao = ACOES[registro.acao] ?? {
                            titulo: registro.acao,
                            cor: "bg-gray-400",
                        };
                        const perfil = PERFIS[registro.perfil] ?? registro.perfil;

                        return (
                            <li key={`${registro.acao}-${indice}`} className="relative pb-5 pl-6 last:pb-0">
                                <span
                                    className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-2 ring-white ${acao.cor}`}
                                    aria-hidden="true"
                                />
                                <p className="font-bold text-[#2E4039]">{acao.titulo}</p>
                                <p className="text-sm text-[#68766e]">
                                    {registro.nomeUsuario ?? "Usuário"}
                                    {perfil ? ` (${perfil})` : ""} · {formatarDataHora(registro.data)}
                                </p>
                                {registro.justificativa && (
                                    <p className="mt-1 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                                        Motivo: {registro.justificativa}
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}