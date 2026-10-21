import { useEffect, useState } from "react";
import { gerarSenhaTemporariaMonitor } from "../../api/supervisor";
import { mensagemDoErro } from "../../utils/errosApi";
import Button from "./SupervisorButton";
import CartaoSenhaTemporaria from "./CartaoSenhaTemporaria";

// Gera outra senha temporária para um monitor. Pede confirmação antes, porque a atual deixa de valer.
export default function NovaSenhaModal({ monitor, onFechar }) {
  const aberto = Boolean(monitor);

  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    setGerando(false);
    setErro(null);
    setResultado(null);
  }, [monitor]);

  useEffect(() => {
    if (!aberto) return undefined;

    function aoPressionar(event) {
      if (event.key === "Escape" && !gerando && !resultado) onFechar();
    }

    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [aberto, gerando, resultado, onFechar]);

  async function handleGerar() {
    setGerando(true);
    setErro(null);

    try {
      setResultado(await gerarSenhaTemporariaMonitor(monitor._id));
    } catch (requestError) {
      console.error(requestError);
      setErro(
        requestError.response?.status === 403
          ? "Você não tem permissão para esta ação."
          : mensagemDoErro(requestError, "Não foi possível gerar a senha. Tente novamente.")
      );
    } finally {
      setGerando(false);
    }
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !gerando && !resultado) onFechar();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-all duration-200 ease-in-out ${
        aberto ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-senha-titulo"
        className={`max-h-[92vh] w-full max-w-md transform overflow-y-auto rounded-xl bg-white p-5 transition-all duration-200 ease-in-out ${
          aberto ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {resultado ? (
          <>
            <h2 id="nova-senha-titulo" className="m-0 text-xl font-bold text-[#2E4039]">
              Nova senha gerada
            </h2>
            <p className="mb-4 mt-2 text-sm text-[#4b5b54]">
              A senha anterior de <strong>{monitor?.nome}</strong> não funciona mais.
            </p>

            <CartaoSenhaTemporaria nome={monitor?.nome} email={resultado.email} senha={resultado.senhaTemporaria} />

            <div className="mt-5 flex justify-end">
              <Button onClick={onFechar} variant="aprovar">
                Já anotei, fechar
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="nova-senha-titulo" className="m-0 text-xl font-bold text-[#2E4039]">
              Gerar nova senha
            </h2>
            <p className="mb-0 mt-2 text-sm text-[#4b5b54]">
              Vamos gerar uma senha temporária para <strong>{monitor?.nome}</strong>. A senha atual deixa de
              funcionar, e ele vai criar uma nova no próximo acesso.
            </p>

            {erro && (
              <p className="mb-0 mt-3 rounded-lg bg-[#fce8e5] p-3 text-xs text-[#a34d46]" role="alert">
                {erro}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <Button onClick={onFechar} variant="default">
                Cancelar
              </Button>
              <button
                type="button"
                onClick={handleGerar}
                disabled={gerando}
                className="cursor-pointer rounded-xl border border-[#2F5146] bg-[#2F5146] p-2 px-4 text-sm font-bold text-white transition-all hover:bg-[#24483d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {gerando ? "Gerando..." : "Gerar nova senha"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}