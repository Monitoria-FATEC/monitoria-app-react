import { useEffect, useState } from "react";
import Button from "./SupervisorButton";
import HistoricoInscricao from "./HistoricoInscricao";
import { listarInscricoes } from "../../api/inscricaoApi";
import { formatarData } from "../../utils/relatorioInscricoes";

const STATUS_INSCRICAO = {
  AGUARDANDO_SUPERVISOR: { texto: "Aguardando supervisor", cor: "bg-amber-100 text-amber-800" },
  AGUARDANDO_GESTAO: { texto: "Em assinatura (Gestão)", cor: "bg-amber-100 text-amber-800" },
  DEVOLVIDA: { texto: "Devolvida para correção", cor: "bg-orange-100 text-orange-800" },
  HOMOLOGADA: { texto: "Homologada", cor: "bg-green-100 text-green-800" },
  RECUSADA: { texto: "Recusada", cor: "bg-gray-100 text-gray-700" },
};

const STATUS_CONTA = {
  AGUARDANDO: { texto: "Em análise", cor: "bg-amber-100 text-amber-800" },
  APROVADO: { texto: "Aprovada", cor: "bg-green-100 text-green-800" },
  DEVOLVIDO: { texto: "Devolvida", cor: "bg-orange-100 text-orange-800" },
};

function Dado({ rotulo, valor }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase text-gray-400">{rotulo}</p>
      <span className="break-words font-bold text-[#2E4039]">{valor || "—"}</span>
    </div>
  );
}

function Selo({ info }) {
  if (!info) return <span className="font-bold text-[#2E4039]">—</span>;
  return (
    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${info.cor}`}>{info.texto}</span>
  );
}

function Bloco({ titulo, children }) {
  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-6">
      <p className="mb-4 text-lg font-bold uppercase text-[#939E95]">{titulo}</p>
      {children}
    </div>
  );
}

// Painel só de leitura com tudo o que o supervisor precisa saber de um monitor.
export default function MonitorDetalhesModal({ monitor, onClose, onEditar }) {
  const [inscricao, setInscricao] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const idMonitor = monitor?._id;

  // Busca a inscrição mais recente do monitor sempre que o painel abre.
  useEffect(() => {
    if (!idMonitor) return undefined;

    let cancelado = false;
    setCarregando(true);
    setErro(null);
    setInscricao(null);

    listarInscricoes()
      .then((lista) => {
        if (cancelado) return;
        const doMonitor = lista
          .filter((item) => item.monitor?.id === idMonitor)
          .sort((a, b) => String(b.dataSubmissao).localeCompare(String(a.dataSubmissao)));
        setInscricao(doMonitor[0] ?? null);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (!cancelado) setErro("Não foi possível carregar a inscrição deste monitor.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idMonitor]);

  // Esc fecha o painel.
  useEffect(() => {
    if (!idMonitor) return undefined;

    function aoPressionar(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [idMonitor, onClose]);

  if (!monitor) return null;

  const termo = inscricao?.termo;

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-40 flex items-center justify-end bg-black/40 backdrop-blur-sm"
    >
      <div className="h-full w-full p-2 sm:w-[640px]">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="monitor-detalhes-titulo"
          className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#FAF9F6] shadow-xl sm:rounded-l-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 id="monitor-detalhes-titulo" className="text-2xl font-bold">
                Detalhes do monitor
              </h2>
              <p className="text-sm text-[#68766e]">{monitor.nome}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes do monitor"
              className="cursor-pointer p-2 text-xl text-gray-400 transition-colors hover:text-black"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <Bloco titulo="dados do cadastro">
              <div className="grid grid-cols-2 gap-4">
                <Dado rotulo="nome" valor={monitor.nome} />
                <Dado rotulo="RA" valor={monitor.ra} />
                <Dado rotulo="e-mail" valor={monitor.email} />
                <Dado rotulo="curso" valor={monitor.curso} />
                <Dado rotulo="perfil" valor={monitor.ativo ? "Ativo" : "Inativo"} />
                <Dado rotulo="cadastrado em" valor={formatarData(monitor.dataCadastro)} />
              </div>
            </Bloco>

            <Bloco titulo="conta e agência">
              <div className="grid grid-cols-2 gap-4">
                <Dado rotulo="conta" valor={monitor.conta} />
                <Dado rotulo="agência" valor={monitor.agencia} />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium uppercase text-gray-400">situação</p>
                  {monitor.conta || monitor.agencia ? (
                    <Selo info={STATUS_CONTA[monitor.statusContaAgencia]} />
                  ) : (
                    <span className="font-bold text-[#2E4039]">Ainda não enviada</span>
                  )}
                </div>
              </div>
            </Bloco>

            {carregando && (
              <p className="mb-4 text-sm text-[#939E95]">Carregando inscrição...</p>
            )}

            {erro && (
              <p className="mb-4 text-sm text-[#a34d46]" role="alert">
                {erro}
              </p>
            )}

            {!carregando && !erro && !inscricao && (
              <Bloco titulo="inscrição">
                <p className="text-sm text-gray-400">
                  Este monitor ainda não enviou o termo de compromisso.
                </p>
              </Bloco>
            )}

            {inscricao && (
              <>
                <Bloco titulo="inscrição">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium uppercase text-gray-400">situação</p>
                      <Selo info={STATUS_INSCRICAO[inscricao.status]} />
                    </div>
                    <Dado rotulo="enviada em" valor={formatarData(inscricao.dataSubmissao)} />
                    <Dado rotulo="disciplina" valor={termo?.disciplina} />
                    <Dado rotulo="oferta" valor={termo?.oferta} />
                    <Dado
                      rotulo="período"
                      valor={
                        termo
                          ? `${formatarData(termo.periodoInicio)} a ${formatarData(termo.periodoFim)}`
                          : "—"
                      }
                    />
                    <Dado
                      rotulo="carga horária"
                      valor={termo?.cargaHoraria != null ? `${termo.cargaHoraria}h semanais` : "—"}
                    />
                    <Dado rotulo="professor orientador" valor={termo?.nomeProfessor} />
                    <Dado rotulo="edital nº" valor={termo?.editalNumero} />
                  </div>

                  {inscricao.status === "DEVOLVIDA" && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <p>
                        <span className="font-bold">Motivo da devolução:</span>{" "}
                        {inscricao.justificativaDevolucao || "—"}
                      </p>
                      <p className="mt-1">
                        <span className="font-bold">Prazo para corrigir:</span>{" "}
                        {formatarData(inscricao.dataLimiteCorrecao)}
                      </p>
                    </div>
                  )}
                </Bloco>

                <HistoricoInscricao historico={inscricao.historico} />
              </>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 p-6">
            <Button variant="default" onClick={onClose}>
              Fechar
            </Button>
            <Button variant="aprovar" onClick={() => onEditar(monitor)}>
              Editar monitor
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}