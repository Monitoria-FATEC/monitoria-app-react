import { useState } from "react";
import SearchBar from "../../components/supervisor/Searchbar";
import MonitorCard from "../../components/supervisor/MonitorCard";
import MonitorCardModal from "../../components/supervisor/MonitorCardModal";
import ConformationModal from "../../components/ConfirmationModal";

export default function SupervisorListaMonitores() {
  const [monitorSelecionado, setMonitorSelecionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  // 1. Transformado em State para que o React atualize a tela ao remover
  const [monitores, setMonitores] = useState([
    {
      _id: "6ac31607b499a5e7e834f3b",
      nome: "Aluno Fatec 1",
      email: "aluno1@fatec.sp.gov.br",
      senha: "$2a$10$OHR3CG42/MrSniij3kxpn08Ku3TyHvjMx.pwOd24ZsmJCIEnoqTWK",
      role: "MONITOR",
      ativo: true,
      dataCriacao: "2026-10-05",
      _class: "com.fatec.monitoria.modules.usuario.domain.Usuario"
    },
    {
      _id: "6ac31607b499a5e7e834f3c",
      nome: "Aluno Fatec 2",
      email: "aluno2@fatec.sp.gov.br",
      senha: "$2a$10$OHR3CG42/MrSniij3kxpn08Ku3TyHvjMx.pwOd24ZsmJCIEnoqTWK",
      role: "MONITOR",
      ativo: true,
      dataCriacao: "2026-10-05",
      _class: "com.fatec.monitoria.modules.usuario.domain.Usuario"
    },
    {
      _id: "6ac31607b499a5e7e834f3d",
      nome: "Aluno Fatec 3",
      email: "aluno3@fatec.sp.gov.br",
      senha: "$2a$10$OHR3CG42/MrSniij3kxpn08Ku3TyHvjMx.pwOd24ZsmJCIEnoqTWK",
      role: "MONITOR",
      ativo: false,
      dataCriacao: "2026-10-05",
      _class: "com.fatec.monitoria.modules.usuario.domain.Usuario"
    },
    {
      _id: "6ac31607b499a5e7e834f3e",
      nome: "Administrador Sistema",
      email: "admin@fatec.sp.gov.br",
      senha: "$2a$10$OHR3CG42/MrSniij3kxpn08Ku3TyHvjMx.pwOd24ZsmJCIEnoqTWK",
      role: "ADMIN",
      ativo: true,
      dataCriacao: "2026-10-05",
      _class: "com.fatec.monitoria.modules.usuario.domain.Usuario"
    },
    {
      _id: "6ac31607b499a5e7e834f3f",
      nome: "Supervisor Acadêmico",
      email: "supervisor@fatec.sp.gov.br",
      senha: "$2a$10$OHR3CG42/MrSniij3kxpn08Ku3TyHvjMx.pwOd24ZsmJCIEnoqTWK",
      role: "SUPERVISOR",
      ativo: true,
      dataCriacao: "2026-10-05",
      _class: "com.fatec.monitoria.modules.usuario.domain.Usuario"
    },
    {
      _id: "6ac31607b499a5e7e834f40",
      nome: "Gestão FATEC",
      email: "gestao@fatec.sp.gov.br",
      senha: "$2a$10$OHR3CG42/MrSniij3kxpn08Ku3TyHvjMx.pwOd24ZsmJCIEnoqTWK",
      role: "GESTAO",
      ativo: true,
      dataCriacao: "2026-10-05",
      _class: "com.fatec.monitoria.modules.usuario.domain.Usuario"
    }
  ]);

  function handleSolicitarExclusao(id) {
    setIdParaExcluir(id);
    setModalOpen(true);
  }

  function handleConfirmarExclusao() {
    if (idParaExcluir) {
      setMonitores((prevMonitores) => 
        prevMonitores.filter((monitor) => monitor._id !== idParaExcluir)
      );
    }
    setModalOpen(false);
    setIdParaExcluir(null);
  }

  const filterMonitores = monitores.filter((monitor) => monitor.role === "MONITOR");

  return (
    <div className="px-6">
      <div className="py-2 border-b border-gray-200">
        <SearchBar />
      </div>
      <div className="grid grid-cols-3 gap-4 p-6">
        {filterMonitores.map((monitor) => (
          <MonitorCard
            key={monitor._id}
            form={monitor}
            onClick={() => setMonitorSelecionado(monitor)}
            // Passando como callback para não executar direto na renderização
            onDelete={() => handleSolicitarExclusao(monitor._id)}
          />
        ))}
      </div>

      <MonitorCardModal
        monitor={monitorSelecionado}
        onClose={() => setMonitorSelecionado(null)}
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