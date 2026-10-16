import { useCallback, useEffect, useState } from "react";
import SearchBar from "../../components/supervisor/Searchbar";
import MonitorCard from "../../components/supervisor/MonitorCard";
import MonitorCardModal from "../../components/supervisor/MonitorCardModal";
import ConformationModal from "../../components/ConfirmationModal";
import {
  alterarAtivoMonitor,
  atualizarMonitor,
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

  const [monitorSelecionado, setMonitorSelecionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [idParaDesativar, setIdParaDesativar] = useState(null);

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

  function substituir(monitorAtualizado) {
    setMonitores((anteriores) =>
      anteriores.map((monitor) =>
        monitor._id === monitorAtualizado.id ? paraCard(monitorAtualizado) : monitor
      )
    );
  }

  function handleSolicitarDesativacao(id) {
    setIdParaDesativar(id);
    setModalOpen(true);
  }

  async function handleConfirmarDesativacao() {
    const id = idParaDesativar;
    setModalOpen(false);
    setIdParaDesativar(null);
    if (!id) return;

    try {
      const resposta = await alterarAtivoMonitor(id, false);
      substituir(resposta);
      setErro(null);
    } catch (requestError) {
      console.error(requestError);
      setErro(mensagemDeErro(requestError, "Não foi possível desativar o monitor."));
    }
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

      <div className="py-2 border-b border-gray-200">
        <SearchBar />
      </div>

      {carregando && (
        <p className="py-6 text-sm text-[#939E95]">Carregando monitores...</p>
      )}

      {!carregando && monitores.length === 0 && !erro && (
        <p className="py-6 text-sm text-[#939E95]">Nenhum monitor cadastrado.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 py-6">
        {monitores.map((monitor) => (
          <MonitorCard
            key={monitor._id}
            form={monitor}
            onClick={() => setMonitorSelecionado(monitor)}
            onDelete={() => handleSolicitarDesativacao(monitor._id)}
          />
        ))}
      </div>

      <MonitorCardModal
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
    </div>
  );
}