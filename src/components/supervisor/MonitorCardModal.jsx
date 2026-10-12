import { useState } from "react";
import Button from "./SupervisorButton";

export default function MonitorCardModal({ monitor, onClose, onSave }) {
  const aberto = Boolean(monitor);
  const dataCriacao = monitor?.dataCriacao
    ? new Date(monitor.dataCriacao).toLocaleDateString("pt-BR")
    : "—";
  const [formulario, setFormulario] = useState(() => ({
    nome: monitor?.nome ?? "",
    ra: monitor?.ra ?? "",
    email: monitor?.email ?? "",
    ativo: monitor?.ativo ?? false,
  }));

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!monitor) return;
    onSave({ ...monitor, ...formulario });
  }

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
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-6">
                <h2 id="monitor-modal-title" className="text-2xl font-bold">
                  Editar Informações do Monitor
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar edição do monitor"
                  className="cursor-pointer p-2 text-xl text-gray-400 transition-colors hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300" />
                  <label className="flex flex-1 flex-col gap-1">
                    <span className="text-xs font-bold uppercase text-gray-500">
                      Nome
                    </span>
                    <input
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xl font-bold text-[#2E4039] outline-none focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15"
                      type="text"
                      name="nome"
                      value={formulario.nome}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-6">
                  <p className="mb-4 text-lg font-bold uppercase text-[#939E95]">
                    dados do cadastro
                  </p>
                  <div className="grid gap-4">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase text-gray-500">
                        RA
                      </span>
                      <input
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[#2E4039] outline-none focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15"
                        type="text"
                        name="ra"
                        value={formulario.ra}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase text-gray-500">
                        E-mail
                      </span>
                      <input
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[#2E4039] outline-none focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15"
                        type="email"
                        name="email"
                        value={formulario.email}
                        onChange={handleChange}
                        required
                      />
                    </label>
                    <label className="flex items-center gap-3 font-medium text-[#2E4039]">
                      <input
                        type="checkbox"
                        name="ativo"
                        checked={formulario.ativo}
                        onChange={handleChange}
                        className="h-4 w-4 accent-[#2F5146]"
                      />
                      Monitor ativo
                    </label>
                    <p className="text-sm text-[#939E95]">
                      Perfil: {monitor.role || "—"} · Data de criação:{" "}
                      {dataCriacao}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-4 border-t border-gray-200 p-6">
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
                  type="submit"
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 font-medium text-[#2E4039] transition-colors hover:bg-gray-100"
                >
                  Salvar alterações
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
