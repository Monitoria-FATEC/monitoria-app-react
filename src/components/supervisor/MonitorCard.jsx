import Button from "./SupervisorButton";

export default function MonitorCard({ form, onClick, onDetalhes, onAlternarAtivo, onNovaSenha, onExcluir }) {
  const { nome, email, ativo, role, agencia, conta } = form;

  return (
    <article className={`relative group min-w-0 p-4 border border-gray-200 hover:border-gray-400 rounded-xl transition-all`}>
      <button
        type="button"
        onClick={onDetalhes}
        className={`block w-full cursor-pointer text-left ${ativo ? "opacity-100" : "opacity-50"}`}
        aria-label={`Ver detalhes do monitor ${nome}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gray-300" />
            <span className="min-w-0 break-words font-bold text-[#2E4039]">{nome}</span>
          </div>
          <span className="font-bold text-[#2E4039]">{ativo ? "Ativo" : "Inativo"}</span>
        </div>
        <div className="flex flex-col mt-6 gap-2 break-words font-medium text-[#939E95] [overflow-wrap:anywhere]">
          <p>email: <span className="font-bold text-[#2E4039]">{email || "—"}</span></p>
          <p>perfil: <span className="font-bold text-[#2E4039]">{role}</span></p>
          <p>conta: <span className="font-bold text-[#2E4039]">{conta || "—"}</span></p>
          <p>agencia: <span className="font-bold text-[#2E4039]">{agencia || "—"}</span></p>
        </div>
      </button>
      <div className="group-hover:flex group-hover:opacity-100 group-hover:visible opacity-0 invisible rounded-xl absolute flex-wrap items-center justify-center top-0 left-0 gap-2 w-full h-full z-10 bg-black/20 backdrop-blur-sm">
        <Button onClick={onAlternarAtivo} variant={ativo ? "reprovar" : "ativar"}>
          {ativo ? "Desativar" : "Ativar"}
        </Button>
        <Button onClick={onDetalhes} variant="default">Detalhes</Button>
        <Button onClick={onClick} variant="default">Editar</Button>
        <Button onClick={onNovaSenha} variant="default">Nova senha</Button>
        <Button onClick={onExcluir} variant="excluir">Excluir</Button>
      </div>
    </article>
  );
}
