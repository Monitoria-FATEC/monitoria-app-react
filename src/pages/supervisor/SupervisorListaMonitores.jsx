import { useCallback, useEffect, useState } from "react";
import SearchBar from "../../components/supervisor/Searchbar";
import Button from "../../components/supervisor/SupervisorButton";
import MonitorCard from "../../components/supervisor/MonitorCard";
import MonitorCardModal from "../../components/supervisor/MonitorCardModal";
import ExcluirMonitorModal from "../../components/supervisor/ExcluirMonitorModal";
import NovoMonitorModal from "../../components/supervisor/NovoMonitorModal";
import NovaSenhaModal from "../../components/supervisor/NovaSenhaModal";
import ConformationModal from "../../components/ConfirmationModal";
import {
  alterarAtivoMonitor,
  atualizarMonitor,
  excluirMonitor,
  listarMonitores,
} from "../../api/supervisor";

// Converte o monitor que vem do back no formato que o card e o modal já usam.
function paraCard(monitor) {
  return {
    ...monitor,
    _id: monitor.id,
    role: "MONITOR",
    conta: monitor.numeroConta ?? "",
    agencia: monitor.agencia ?? "",
    dataCriacao: monitor.dataCadastro,
  };
}

function mensagemDeErro(error, padrao) {
  if (error.response?.status === 403) {
    return "Você não tem permissão para esta ação.";
  }
  return error.response?.data?.message || padrao;
}

export default function SupervisorListaMonitores() {
  const [monitores, setMonitores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [monitorSelecionado, setMonitorSelecionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [idParaDesativar, setIdParaDesativar] = useState(null);
  const [monitorParaExcluir, setMonitorParaExcluir] = useState(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [monitorNovaSenha, setMonitorNovaSenha] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const lista = await listarMonitores();
      setMonitores(lista.map(paraCard));
      setErro(null);
    } catch (requestError) {
      console.error(requestError);
      setErro(
        mensagemDeErro(
          requestError,
          "Não foi possível carregar os monitores. Verifique a conexão com o servidor."
        )
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O aviso de sucesso some sozinho depois de alguns segundos.
  useEffect(() => {
    if (!aviso) return undefined;

    const timer = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(timer);
  }, [aviso]);

  function substituir(monitorAtualizado) {
    setMonitores((anteriores) =>
      anteriores.map((monitor) =>
        monitor._id === monitorAtualizado.id ? paraCard(monitorAtualizado) : monitor
      )
    );
  }

  // Entra na lista na posição certa (ordem alfabética). O modal continua aberto mostrando a senha.
  function handleMonitorCriado(monitor) {
    setMonitores((anteriores) =>
      [...anteriores, paraCard(monitor)].sort((a, b) =>
        (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", { sensitivity: "base" })
      )
    );
    setErro(null);
    setAviso(`${monitor.nome} foi cadastrado(a).`);
  }

  // Ativo: pede confirmação para desativar. Inativo: ativa na hora.
  async function handleAlternarAtivo(monitor) {
    if (monitor.ativo) {
      setIdParaDesativar(monitor._id);
      setModalOpen(true);
      return;
    }

    try {
      const resposta = await alterarAtivoMonitor(monitor._id, true);
      substituir(resposta);
      setErro(null);
      setAviso(`${monitor.nome} foi reativado(a).`);
    } catch (requestError) {
      console.error(requestError);
      setErro(mensagemDeErro(requestError, "Não foi possível ativar o monitor."));
    }
  }

  async function handleConfirmarDesativacao() {
    const id = idParaDesativar;
    const monitor = monitores.find((item) => item._id === id);
    setModalOpen(false);
    setIdParaDesativar(null);
    if (!id) return;

    try {
      const resposta = await alterarAtivoMonitor(id, false);
      substituir(resposta);
      setErro(null);
      setAviso(
        `${monitor?.nome ?? "O monitor"} foi desativado(a). Para reativar, passe o mouse no card e clique em Ativar.`
      );
    } catch (requestError) {
      console.error(requestError);
      setErro(mensagemDeErro(requestError, "Não foi possível desativar o monitor."));
    }
  }

  // Se der erro, o modal de exclusão mostra a mensagem e continua aberto.
  async function handleConfirmarExclusao(monitor) {
    const resumo = await excluirMonitor(monitor._id);

    setMonitores((anteriores) => anteriores.filter((item) => item._id !== monitor._id));
    setMonitorParaExcluir(null);
    setErro(null);
    setAviso(
      `${resumo.nome} foi excluído(a): ${resumo.inscricoes} inscrição(ões) e ${resumo.termos} termo(s) apagados` +
        (resumo.contaDeAcesso ? ", além da conta de acesso." : ".")
    );
  }

  async function handleSalvarMonitor(atualizado) {
    const original = monitores.find((monitor) => monitor._id === atualizado._id);

    try {
      let resposta = await atualizarMonitor(atualizado._id, {
        nome: atualizado.nome,
        email: atualizado.email,
        curso: atualizado.curso,
        numeroConta: atualizado.conta,
        agencia: atualizado.agencia,
      });

      if (original && original.ativo !== atualizado.ativo) {
        resposta = await alterarAtivoMonitor(atualizado._id, atualizado.ativo);
      }

      substituir(resposta);
      setMonitorSelecionado(null);
      setErro(null);
    } catch (requestError) {
      console.error(requestError);
      setErro(mensagemDeErro(requestError, "Não foi possível salvar as alterações."));
      // recarrega para a tela não ficar diferente do que está salvo
      carregar();
    }
  }

  return (
    <div className="px-6">
      {erro && (
        <div
          className="fixed right-4 top-4 z-[60] max-w-md rounded-xl bg-[#fce8e5] px-4 py-3 text-sm text-[#a64e49] shadow-lg"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span>{erro}</span>
            <button
              type="button"
              onClick={() => setErro(null)}
              aria-label="Fechar aviso"
              className="cursor-pointer text-[#a64e49]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {aviso && (
        <div
          className="fixed right-4 top-4 z-[60] max-w-md rounded-xl bg-[#e6f2ea] px-4 py-3 text-sm text-[#2F5146] shadow-lg"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span>{aviso}</span>
            <button
              type="button"
              onClick={() => setAviso(null)}
              aria-label="Fechar aviso"
              className="cursor-pointer text-[#2F5146]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 py-2">
        <div className="min-w-[200px] flex-1">
          <SearchBar />
        </div>
        <Button onClick={() => setNovoAberto(true)} variant="aprovar">
          + Novo monitor
        </Button>
      </div>

      {carregando && (
        <p className="py-6 text-sm text-[#939E95]">Carregando monitores...</p>
      )}

      {!carregando && monitores.length === 0 && !erro && (
        <p className="py-6 text-sm text-[#939E95]">
          Nenhum monitor cadastrado. Use <strong>+ Novo monitor</strong> para cadastrar o primeiro.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 py-6">
        {monitores.map((monitor) => (
          <MonitorCard
            key={monitor._id}
            form={monitor}
            onClick={() => setMonitorSelecionado(monitor)}
            onAlternarAtivo={() => handleAlternarAtivo(monitor)}
            onNovaSenha={() => setMonitorNovaSenha(monitor)}
            onExcluir={() => setMonitorParaExcluir(monitor)}
            // Passando como callback para não executar direto na renderização
            onDelete={() => handleSolicitarExclusao(monitor._id)}
          />
        ))}
      </div>

      <MonitorCardModal
        key={monitorSelecionado?._id ?? "fechado"}
        monitor={monitorSelecionado}
        onClose={() => setMonitorSelecionado(null)}
        onSave={handleSalvarMonitor}
      />

      <ConformationModal
        open={modalOpen}
        titulo="Desativar Monitor"
        descricao="O monitor não será apagado, só ficará inativo. Você pode reativar na edição."
        onCancel={() => {
          setModalOpen(false);
          setIdParaDesativar(null);
        }}
        onConfirm={handleConfirmarDesativacao}
      />

      <ExcluirMonitorModal
        monitor={monitorParaExcluir}
        onCancelar={() => setMonitorParaExcluir(null)}
        onConfirmar={handleConfirmarExclusao}
      />

      <NovoMonitorModal
        aberto={novoAberto}
        onFechar={() => setNovoAberto(false)}
        onCriado={handleMonitorCriado}
      />

      <NovaSenhaModal
        monitor={monitorNovaSenha}
        onFechar={() => setMonitorNovaSenha(null)}
      />

      {modalOpen && (
        <ConformationModal 
          titulo="Excluir Monitor" 
          descricao="Tem certeza que deseja excluir este monitor?" 
          onCancel={() => {
            setModalOpen(false);
            setIdParaExcluir(null);
          }} 
          onConfirm={handleConfirmarExclusao}
        />
      )}
    </div>
  );
}