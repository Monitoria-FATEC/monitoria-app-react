import { useEffect, useState } from "react";
import { criarMonitor } from "../../api/supervisor";
import { cursosFatecZonaLeste } from "../../data/cursosFatecZonaLeste";
import { camposDoErro, filtrarCampos, mensagemDoErro } from "../../utils/errosApi";
import {
  normalizarEspacos,
  validarCurso,
  validarEmail,
  validarNomeCompleto,
  validarRa,
} from "../../utils/validacoes";
import FormField from "../monitor/FormField";
import Button from "./SupervisorButton";
import CartaoSenhaTemporaria from "./CartaoSenhaTemporaria";

const CAMPOS = ["nome", "ra", "email", "curso"];
const formularioVazio = { nome: "", ra: "", email: "", curso: "" };

// Cadastro manual de monitor pelo supervisor. Depois de salvar, mostra a senha temporária.
export default function NovoMonitorModal({ aberto, onFechar, onCriado }) {
  const [formulario, setFormulario] = useState(formularioVazio);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Cada vez que abre, começa do zero.
  useEffect(() => {
    if (!aberto) return;
    setFormulario(formularioVazio);
    setErros({});
    setErroGeral(null);
    setEnviando(false);
    setResultado(null);
  }, [aberto]);

  // Esc fecha, menos enquanto envia ou enquanto a senha está na tela.
  useEffect(() => {
    if (!aberto) return undefined;

    function aoPressionar(event) {
      if (event.key === "Escape" && !enviando && !resultado) onFechar();
    }

    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [aberto, enviando, resultado, onFechar]);

  function alterar(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroGeral(null);

    const encontrados = {
      nome: validarNomeCompleto(formulario.nome),
      ra: validarRa(formulario.ra),
      email: validarEmail(formulario.email),
      curso: validarCurso(formulario.curso, cursosFatecZonaLeste),
    };
    const comErro = Object.fromEntries(Object.entries(encontrados).filter(([, mensagem]) => mensagem));
    setErros(comErro);
    if (Object.keys(comErro).length > 0) return;

    setEnviando(true);

    try {
      const resposta = await criarMonitor({
        nome: normalizarEspacos(formulario.nome),
        ra: formulario.ra.trim(),
        email: formulario.email.trim(),
        curso: formulario.curso,
      });

      setResultado(resposta);
      onCriado(resposta.monitor);
    } catch (requestError) {
      console.error(requestError);
      const campos = filtrarCampos(camposDoErro(requestError), CAMPOS);
      setErros(campos);
      setErroGeral(
        Object.keys(campos).length > 0
          ? null
          : mensagemDoErro(requestError, "Não foi possível cadastrar o monitor. Tente novamente.")
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !enviando && !resultado) onFechar();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-all duration-200 ease-in-out ${
        aberto ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="novo-monitor-titulo"
        className={`max-h-[92vh] w-full max-w-lg transform overflow-y-auto rounded-xl bg-white p-5 transition-all duration-200 ease-in-out ${
          aberto ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {resultado ? (
          <>
            <h2 id="novo-monitor-titulo" className="m-0 text-xl font-bold text-[#2E4039]">
              Monitor cadastrado
            </h2>
            <p className="mb-4 mt-2 text-sm text-[#4b5b54]">
              <strong>{resultado.monitor.nome}</strong> já tem acesso. Entregue a senha temporária abaixo.
            </p>

            <CartaoSenhaTemporaria
              nome={resultado.monitor.nome}
              email={resultado.monitor.email}
              senha={resultado.senhaTemporaria}
            />

            <div className="mt-5 flex justify-end">
              <Button onClick={onFechar} variant="aprovar">
                Já anotei, fechar
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <div>
              <h2 id="novo-monitor-titulo" className="m-0 text-xl font-bold text-[#2E4039]">
                Novo monitor
              </h2>
              <p className="mb-0 mt-2 text-sm text-[#4b5b54]">
                Use quando o aluno não conseguiu se cadastrar sozinho. O sistema cria o acesso com uma
                senha temporária, e ele define a própria senha no primeiro login.
              </p>
            </div>

            <FormField
              label="Nome completo"
              value={formulario.nome}
              onChange={(event) => alterar("nome", event.target.value)}
              erro={erros.nome}
              autoComplete="off"
              disabled={enviando}
            />

            <FormField
              label="RA"
              value={formulario.ra}
              onChange={(event) => alterar("ra", event.target.value.replace(/\D/g, "").slice(0, 13))}
              erro={erros.ra}
              hint="13 dígitos"
              inputMode="numeric"
              autoComplete="off"
              disabled={enviando}
            />

            <FormField
              label="E-mail"
              type="email"
              value={formulario.email}
              onChange={(event) => alterar("email", event.target.value)}
              erro={erros.email}
              autoComplete="off"
              disabled={enviando}
            />

            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-[#39544c]">Curso</span>
              <select
                value={formulario.curso}
                onChange={(event) => alterar("curso", event.target.value)}
                disabled={enviando}
                aria-invalid={Boolean(erros.curso)}
                className={`w-full rounded-lg border bg-[#fbfcfa] px-3.5 py-3 text-sm text-[#243d38] outline-none focus:ring-4 ${
                  erros.curso
                    ? "border-[#a34d46] focus:border-[#a34d46] focus:ring-[#a34d46]/15"
                    : "border-[#d7e0d6] focus:border-[#769c8d] focus:ring-[#769c8d]/15"
                }`}
              >
                <option value="">Selecione o curso</option>
                {cursosFatecZonaLeste.map((curso) => (
                  <option key={curso} value={curso}>
                    {curso}
                  </option>
                ))}
              </select>
              {erros.curso && (
                <span className="text-[11px] text-[#a34d46]" role="alert">
                  {erros.curso}
                </span>
              )}
            </label>

            {erroGeral && (
              <p className="m-0 rounded-lg bg-[#fce8e5] p-3 text-xs text-[#a34d46]" role="alert">
                {erroGeral}
              </p>
            )}

            <div className="mt-1 flex items-center justify-end gap-3">
              <Button onClick={onFechar} variant="default">
                Cancelar
              </Button>
              <button
                type="submit"
                disabled={enviando}
                className="cursor-pointer rounded-xl border border-[#2F5146] bg-[#2F5146] p-2 px-4 text-sm font-bold text-white transition-all hover:bg-[#24483d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? "Cadastrando..." : "Cadastrar monitor"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}