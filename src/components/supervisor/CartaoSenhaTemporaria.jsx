import { useState } from "react";

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // navegadores sem permissão de área de transferência: tenta o jeito antigo
    try {
      const area = document.createElement("textarea");
      area.value = texto;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

// Mostra a senha temporária (só aparece agora) com botões para copiar e o passo a passo.
export default function CartaoSenhaTemporaria({ nome, email, senha }) {
  const [copiado, setCopiado] = useState(null);

  const link = `${window.location.origin}/entrar`;
  const mensagem =
    `Olá${nome ? `, ${nome.split(" ")[0]}` : ""}! Seu acesso ao sistema de Monitoria da Fatec foi criado.\n` +
    `Endereço: ${link}\n` +
    `E-mail: ${email}\n` +
    `Senha temporária: ${senha}\n` +
    `No primeiro acesso você vai criar a sua própria senha.`;

  async function handleCopiar(tipo, texto) {
    const ok = await copiar(texto);
    setCopiado(ok ? tipo : "erro");
    setTimeout(() => setCopiado(null), 2500);
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-[#cfe3d3] bg-[#f1f8f2] p-4">
        <p className="m-0 text-xs font-bold uppercase tracking-[.08em] text-[#769c8d]">E-mail de acesso</p>
        <p className="m-0 mt-1 break-all text-sm font-semibold text-[#243d38]">{email}</p>

        <p className="m-0 mt-3 text-xs font-bold uppercase tracking-[.08em] text-[#769c8d]">Senha temporária</p>
        <p className="m-0 mt-1 select-all font-mono text-2xl font-bold tracking-widest text-[#2F5146]">{senha}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCopiar("senha", senha)}
            className="cursor-pointer rounded-lg border border-[#2F5146] bg-white px-3 py-2 text-xs font-bold text-[#2F5146] transition hover:bg-[#2F5146] hover:text-white"
          >
            {copiado === "senha" ? "Senha copiada ✓" : "Copiar senha"}
          </button>
          <button
            type="button"
            onClick={() => handleCopiar("mensagem", mensagem)}
            className="cursor-pointer rounded-lg border border-[#d5e2d2] bg-white px-3 py-2 text-xs font-bold text-[#243d38] transition hover:border-[#2F5146]"
          >
            {copiado === "mensagem" ? "Mensagem copiada ✓" : "Copiar mensagem pronta"}
          </button>
        </div>

        {copiado === "erro" && (
          <p className="m-0 mt-2 text-xs text-[#a34d46]" role="alert">
            Não foi possível copiar automaticamente. Selecione o texto e copie.
          </p>
        )}
      </div>

      <ol className="m-0 grid list-decimal gap-1.5 pl-5 text-sm text-[#4b5b54]">
        <li>Passe o e-mail e a senha para o monitor. <strong>Ela não aparece de novo.</strong></li>
        <li>No primeiro acesso, o sistema pede para ele criar a própria senha.</li>
        <li>Depois ele preenche o termo de compromisso pelo painel.</li>
      </ol>

      <p className="m-0 text-xs text-[#68766e]">
        Se a senha se perder, use <strong>Nova senha</strong> no card do monitor para gerar outra.
      </p>
    </div>
  );
}