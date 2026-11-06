import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarContasAgencia } from "../../api/contaAgenciaApi";
import { listarHorariosDosMonitores } from "../../api/horariosApi";
import { listarInscricoes } from "../../api/inscricaoApi";
import { listarMonitores } from "../../api/supervisor";
import { contar, montarLinhas } from "../../utils/relatorioInscricoes";

// Mesmas cores do StatusBadge. A cor só acompanha o rótulo, nunca aparece sozinha.
const COR_ESTADO = {
    pendente: "bg-[#d9ab36]",
    andamento: "bg-[#939E95]",
    concluido: "bg-[#5b9a6f]",
    devolvido: "bg-[#c76b61]",
};

function contarStatus(lista, campo, status) {
    return lista.filter((item) => item[campo] === status).length;
}

function resumirInscricoes(inscricoes) {
    if (!inscricoes) return null;

    const aguardando = contarStatus(inscricoes, "status", "AGUARDANDO_SUPERVISOR");
    const assinatura = contarStatus(inscricoes, "status", "AGUARDANDO_GESTAO");
    const homologados = contarStatus(inscricoes, "status", "HOMOLOGADA");
    const devolvidos = contarStatus(inscricoes, "status", "DEVOLVIDA");

    return {
        aguardando,
        assinatura,
        homologados,
        devolvidos,
        // Soma só os estados das abas, para o total bater com a tela de aprovações.
        total: aguardando + assinatura + homologados + devolvidos,
        semPdf: inscricoes.filter(
            (item) => item.status === "AGUARDANDO_GESTAO" && !item.enviadoParaAssinatura
        ).length,
    };
}

function resumirContas(contas) {
    if (!contas) return null;

    const aguardando = contarStatus(contas, "statusContaAgencia", "AGUARDANDO");
    const aprovadas = contarStatus(contas, "statusContaAgencia", "APROVADO");
    const devolvidas = contarStatus(contas, "statusContaAgencia", "DEVOLVIDO");

    return { aguardando, aprovadas, devolvidas, total: aguardando + aprovadas + devolvidas };
}

function resumirMonitores(monitores) {
    if (!monitores) return null;

    const ativos = monitores.filter((monitor) => monitor.ativo).length;
    return { ativos, inativos: monitores.length - ativos, total: monitores.length };
}

function resumirHorarios(horarios) {
    if (!horarios) return null;

    const vigentes = horarios.filter((horario) => horario.vigente);
    return {
        vigentes: vigentes.length,
        encerrados: horarios.length - vigentes.length,
        monitores: new Set(vigentes.map((horario) => horario.monitorId)).size,
        total: horarios.length,
    };
}

// Lista só o que depende de uma ação do supervisor agora.
function montarPendencias({ inscricoes, contas, relatorio }) {
    const itens = [
        {
            quantidade: inscricoes?.aguardando ?? 0,
            singular: "formulário aguarda sua aprovação",
            plural: "formulários aguardam sua aprovação",
            para: "aprovacoes",
        },
        {
            quantidade: inscricoes?.semPdf ?? 0,
            singular: "termo ainda não foi enviado à Gestão",
            plural: "termos ainda não foram enviados à Gestão",
            para: "aprovacoes",
        },
        {
            quantidade: contas?.aguardando ?? 0,
            singular: "conta bancária aguarda conferência",
            plural: "contas bancárias aguardam conferência",
            para: "contas-bancarias",
        },
        {
            quantidade: relatorio?.atrasados ?? 0,
            singular: "inscrição está com o prazo de correção vencido",
            plural: "inscrições estão com o prazo de correção vencido",
            para: "relatorios",
        },
    ];

    return itens.filter((item) => item.quantidade > 0);
}

function CartaoResumo({ titulo, para, valor, total, unidade, estados, carregando, className = "" }) {
    const falhou = !carregando && valor === undefined;

    return (
        <Link
            to={`/supervisor/${para}`}
            className={`group flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 no-underline transition-all hover:border-gray-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c50] ${className}`}
        >
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[#39544c]">{titulo}</h2>
                <span className="text-[#68766e] transition-transform group-hover:translate-x-1" aria-hidden="true">
                    →
                </span>
            </div>

            {falhou ? (
                <p className="mt-4 text-sm text-[#a34d46]">Não foi possível carregar esta seção.</p>
            ) : (
                <>
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[#2E4039]">
                        <span className="text-4xl font-bold">{carregando ? "…" : valor}</span>
                        {!carregando && total !== undefined && (
                            <span className="text-2xl font-medium text-[#68766e]">/ {total}</span>
                        )}
                        <span className="text-sm text-[#68766e]">{unidade}</span>
                    </p>

                    <dl className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-3 border-t border-gray-100 pt-4">
                        {estados.map((estado) => (
                            <div key={estado.rotulo} className="min-w-0">
                                <dt className="flex items-center gap-1.5 text-xs text-[#68766e]">
                                    {estado.cor && (
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${COR_ESTADO[estado.cor]}`} aria-hidden="true" />
                                    )}
                                    {estado.rotulo}
                                </dt>
                                <dd className="mt-0.5 text-xl font-bold text-[#2E4039]">
                                    {carregando ? "…" : estado.valor}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </>
            )}
        </Link>
    );
}

export default function SupervisorHome() {
    const [dados, setDados] = useState(null);

    useEffect(() => {
        let montado = true;

        // allSettled: se uma seção falhar, as outras continuam aparecendo.
        Promise.allSettled([
            listarInscricoes(),
            listarContasAgencia(),
            listarMonitores(),
            listarHorariosDosMonitores(),
        ]).then((resultados) => {
            if (!montado) return;

            const [inscricoes, contas, monitores, horarios] = resultados.map((resultado) => {
                if (resultado.status === "fulfilled") return resultado.value;
                console.error(resultado.reason);
                return null;
            });

            setDados({ inscricoes, contas, monitores, horarios });
        });

        return () => {
            montado = false;
        };
    }, []);

    const carregando = dados === null;

    const resumo = useMemo(() => {
        if (!dados) return {};

        return {
            inscricoes: resumirInscricoes(dados.inscricoes),
            contas: resumirContas(dados.contas),
            monitores: resumirMonitores(dados.monitores),
            horarios: resumirHorarios(dados.horarios),
            relatorio: dados.inscricoes ? contar(montarLinhas(dados.inscricoes).linhas) : null,
        };
    }, [dados]);

    const { inscricoes, contas, monitores, horarios, relatorio } = resumo;
    const pendencias = montarPendencias(resumo);
    const secaoFalhou = !carregando && Object.values(resumo).some((secao) => secao === null);

    return (
        <div className="grid gap-4 px-6 pb-6 lg:grid-cols-6">
            <CartaoResumo
                className="lg:col-span-3"
                titulo="Formulários"
                para="aprovacoes"
                carregando={carregando}
                valor={inscricoes?.aguardando}
                total={inscricoes?.total}
                unidade="aguardando aprovação"
                estados={[
                    { rotulo: "Aguardando", valor: inscricoes?.aguardando, cor: "pendente" },
                    { rotulo: "Em assinatura", valor: inscricoes?.assinatura, cor: "andamento" },
                    { rotulo: "Homologados", valor: inscricoes?.homologados, cor: "concluido" },
                    { rotulo: "Devolvidos", valor: inscricoes?.devolvidos, cor: "devolvido" },
                ]}
            />

            <CartaoResumo
                className="lg:col-span-3"
                titulo="Contas bancárias"
                para="contas-bancarias"
                carregando={carregando}
                valor={contas?.aguardando}
                total={contas?.total}
                unidade="aguardando conferência"
                estados={[
                    { rotulo: "Aguardando", valor: contas?.aguardando, cor: "pendente" },
                    { rotulo: "Aprovadas", valor: contas?.aprovadas, cor: "concluido" },
                    { rotulo: "Devolvidas", valor: contas?.devolvidas, cor: "devolvido" },
                ]}
            />

            <CartaoResumo
                className="lg:col-span-2"
                titulo="Monitores"
                para="lista-monitores"
                carregando={carregando}
                valor={monitores?.ativos}
                total={monitores?.total}
                unidade="ativos"
                estados={[{ rotulo: "Inativos", valor: monitores?.inativos }]}
            />

            <CartaoResumo
                className="lg:col-span-2"
                titulo="Horários"
                para="horarios"
                carregando={carregando}
                valor={horarios?.vigentes}
                total={horarios?.total}
                unidade="vigentes"
                estados={[
                    { rotulo: "Monitores", valor: horarios?.monitores },
                    { rotulo: "Encerrados", valor: horarios?.encerrados },
                ]}
            />

            <CartaoResumo
                className="lg:col-span-2"
                titulo="Relatórios"
                para="relatorios"
                carregando={carregando}
                valor={relatorio?.entregues}
                total={relatorio?.todas}
                unidade="entregues"
                estados={[
                    { rotulo: "Aguardando", valor: relatorio?.aguardando, cor: "pendente" },
                    { rotulo: "Devolvidos", valor: relatorio?.devolvidos, cor: "devolvido" },
                    { rotulo: "Atrasados", valor: relatorio?.atrasados, cor: "devolvido" },
                ]}
            />

            <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-6">
                <h2 className="text-sm font-bold text-[#39544c]">Precisa da sua atenção</h2>

                {carregando ? (
                    <p className="mt-3 text-sm text-[#68766e]" role="status">Carregando pendências...</p>
                ) : (
                    <>
                        {pendencias.length > 0 && (
                            <ul className="mt-2 divide-y divide-gray-100">
                                {pendencias.map((item) => (
                                    <li key={item.singular}>
                                        <Link
                                            to={`/supervisor/${item.para}`}
                                            className="flex items-center justify-between gap-3 py-2.5 text-sm text-[#2E4039] no-underline hover:underline"
                                        >
                                            <span>
                                                <strong>{item.quantidade}</strong>{" "}
                                                {item.quantidade === 1 ? item.singular : item.plural}
                                            </span>
                                            <span className="text-[#68766e]" aria-hidden="true">→</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {pendencias.length === 0 && !secaoFalhou && (
                            <p className="mt-3 text-sm text-[#68766e]">Tudo em dia. Nenhuma pendência no momento.</p>
                        )}

                        {secaoFalhou && (
                            <p className="mt-3 text-sm text-[#a34d46]" role="alert">
                                Algumas seções não carregaram, então esta lista pode estar incompleta.
                            </p>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
