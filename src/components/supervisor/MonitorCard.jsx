import Button from "./SupervisorButton";
import { useState } from "react";

export default function MonitorCard({ form, onClick, onDelete }) {
  const { nome, email, ativo, role, dataCriacao } = form;


  return (
    <article className={`relative group  p-4 border border-gray-200 hover:border-gray-400 rounded-xl transition-all`}>
      <button
        type="button"
        onClick={onClick}
        className={`block w-full cursor-pointer text-left ${ativo ? "opacity-100" : "opacity-50"}`}
        aria-label={`Ver detalhes do monitor ${nome}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <span className="font-bold text-[#2E4039]">{nome}</span>
          </div>
          <span className="font-bold text-[#2E4039]">{ativo ? "Ativo" : "Inativo"}</span>
        </div>
        <div className="flex flex-col mt-6 gap-2 font-medium text-[#939E95]">
          <p>email: <span className="font-bold text-[#2E4039]">{email}</span></p>
          <p>perfil: <span className="font-bold text-[#2E4039]">{role}</span></p>
          <p>data de criação: <span className="font-bold text-[#2E4039]">{dataCriacao}</span></p>

        </div>
      </button>
      <div className="group-hover:flex group-hover:opacity-100 group-hover:visible opacity-0 invisible rounded-xl absolute items-center justify-center top-0 left-0  gap-4 w-full h-full z-10 bg-black/20 backdrop-blur-sm">
        <Button onClick={onDelete} variant="reprovar">Excluir</Button>
        <Button onClick={onClick} variant="default">Editar</Button>
      </div>
    </article>
  );
}
