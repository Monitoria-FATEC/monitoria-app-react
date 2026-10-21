import { useEffect, useState } from "react";
import { resumirExclusaoMonitor } from "../../api/supervisor";
import Button from "./SupervisorButton";

const PALAVRA_DE_CONFIRMACAO = "EXCLUIR";

function plural(quantidade, singular, pluralTexto) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;
}

// Janela de exclusão definitiva: mostra o que será apagado (vem do back)
// e só libera o botão depois que o supervisor digita EXCLUIR.
export default function ExcluirMonitorModal({ monitor, onCancelar, onConfirmar }) {
  const aberto = Boolean(monitor);

  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  // Cada vez que abre para um monitor, pergunta ao back o que será apagado.
  useEffect(() => {
    if (!monitor) return undefined;

    let cancelado = false;

    setResumo(null);
    setErro(null);
    setConfirmacao("");
    setExcluindo(false);
    setCarregando(true);

    resumirExclusaoMonitor(monitor._id)
      .then((dados) => {
        if (!cancelado) setResumo(dados);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (!cancelado) {
          setErro(
            requestError.response?.data?.message ||
              "Não foi possível verificar o que será apagado. Tente novamente."
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [monitor]);

  // Esc fecha a janela (menos enquanto está excluindo).
  useEffect(() => {
    if (!aberto) return undefined;

    function aoPressionar(event) {
      if (event.key === "Escape" && !excluindo) onCancelar();
    }

    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [aberto, excluindo, onCancelar]);

  const confirmacaoCorreta =
    confirmacao.trim().toUpperCase() === PALAVRA_DE_CONFIRMACAO;
  const podeExcluir = Boolean(resumo) && confirmacaoCorreta && !excluindo;

  async function handleConfirmar() {
    if (!podeExcluir) return;

    setExcluindo(true);
    setErro(null);

    try {
      await onConfirmar(monitor);
    } catch (requestError) {
      console.error(requestError);
      setErro(
        requestError.response?.data?.message ||
          "Não foi possível excluir o monitor. Nada foi apagado por completo; tente novamente."
      );
      setExcluindo(false);
    }
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !excluindo) onCancelar();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-all duration-200 ease-in-out ${
        aberto ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="excluir-monitor-titulo"
        className={`max-h-[90vh] w-full max-w-md transform overflow-y-auto rounded-xl bg-white p-5 transition-all duration-200 ease-in-out ${
          aberto ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 id="excluir-monitor-titulo" className="m-0 text-xl font-bold text-[#2E4039]">
          Excluir monitor definitivamente
        </h2>

        <p className="mt-2 text-sm text-[#4b5b54]">
          Você vai excluir <strong>{monitor?.nome}</strong>
          {monitor?.ra ? ` (RA ${monitor.ra})` : ""}. Esta ação{" "}
          <strong>não pode ser desfeita</strong>.
        </p>

        {carregando && (
          <p className="mt-4 text-sm text-[#939E95]">Verificando o que será apagado...</p>
        )}

        {resumo && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-[#fbfcfa] p-3 text-sm text-[#2E4039]">
            <p className="m-0 font-bold">Serão apagados:</p>
            <ul className="mb-0 mt-2 list-disc pl-5">
              <li>o cadastro do monitor, com conta bancária e perfil</li>
              {resumo.contaDeAcesso && <li>a conta de acesso (login) dele</li>}
              <li>{plural(resumo.termos, "termo de compromisso", "termos de compromisso")}</li>
              <li>{plural(resumo.inscricoes, "inscrição", "inscrições")}</li>
            </ul>
          </div>
        )}

        {resumo?.possuiTermoHomologado && (
          <p
            className="mt-3 rounded-lg bg-[#fff6d8] p-3 text-sm font-medium text-[#856c31]"
            role="alert"
          >
            Atenção: este monitor tem um termo <strong>homologado</strong>. Excluir apaga
            esse registro oficial do sistema.
          </p>
        )}

        <p className="mt-3 text-xs text-[#68766e]">
          Se você só quer tirar o acesso por um tempo, use <strong>Desativar</strong>: dá para
          reativar depois.
        </p>

        <label className="mt-4 grid gap-1.5">
          <span className="text-xs font-bold text-[#39544c]">
            Para confirmar, digite {PALAVRA_DE_CONFIRMACAO}
          </span>
          <input
            type="text"
            value={confirmacao}
            onChange={(event) => setConfirmacao(event.target.value)}
            disabled={!resumo || excluindo}
            autoComplete="off"
            placeholder={PALAVRA_DE_CONFIRMACAO}
            className="w-full rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-sm text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#c9736b] focus:ring-4 focus:ring-[#c9736b]/15 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        {erro && (
          <p className="mt-3 text-xs text-[#a34d46]" role="alert">
            {erro}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button onClick={onCancelar} variant="default">
            Cancelar
          </Button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!podeExcluir}
            className="rounded-xl border border-red-500 bg-red-500 p-2 px-4 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {excluindo ? "Excluindo..." : "Excluir definitivamente"}
          </button>
        </div>
      </section>
    </div>
  );
}