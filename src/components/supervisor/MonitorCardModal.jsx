import Button from "./SupervisorButton";

function Dado({ rotulo, valor }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase text-gray-400">{rotulo}</p>
      <span className="wrap-break-word font-bold text-[#2E4039]">{valor}</span>
    </div>
  );
}

export default function MonitorCardModal({ monitor, onClose }) {
  const aberto = Boolean(monitor);
  const dataCriacao = monitor?.dataCriacao
    ? new Date(monitor.dataCriacao).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-40 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-all ${
        aberto ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        className={`h-full w-full p-2 transition-all sm:w-150 ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="monitor-modal-title"
          className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#FAF9F6] shadow-xl sm:rounded-l-2xl"
        >
          {monitor && (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-6">
                <h2 id="monitor-modal-title" className="text-2xl font-bold">
                  Detalhes do Monitor
                </h2>
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
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300" />
                  <div>
                    <p className="text-2xl font-bold text-[#2E4039]">{monitor.nome}</p>
                    <p className="font-medium text-[#939E95]">
                      {monitor.ativo ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-6">
                  <p className="mb-4 text-lg font-bold uppercase text-[#939E95]">
                    dados do cadastro
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Dado rotulo="e-mail" valor={monitor.email || "—"} />
                    <Dado rotulo="perfil" valor={monitor.role || "—"} />
                    <Dado rotulo="data de criação" valor={dataCriacao} />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-end border-t gap-4 border-gray-200 p-6">
                <Button
                  variant="reprovar"
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 font-medium text-[#2E4039] transition-colors hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  variant="aprovar"
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 font-medium text-[#2E4039] transition-colors hover:bg-gray-100"
                >
                  Confirmar
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
