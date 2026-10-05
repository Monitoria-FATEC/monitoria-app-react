import { useState } from "react";
import Button from "./SupervisorButton";

const LIMITE = 500;

export default function DevolverModal({ form, enviando, onConfirmar, onCancelar }) {
    const [justificativa, setJustificativa] = useState("");

    const texto = justificativa.trim();
    const podeEnviar = texto.length > 0 && !enviando;

    function handleSubmit(event) {
        event.preventDefault();
        if (!podeEnviar) return;
        onConfirmar(texto);
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="devolver-titulo"
            onClick={(event) => {
                if (event.target === event.currentTarget && !enviando) onCancelar();
            }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg rounded-2xl bg-[#FAF9F6] p-6 shadow-xl"
            >
                <h2 id="devolver-titulo" className="text-xl font-bold text-[#2E4039]">
                    Devolver ficha ao monitor
                </h2>

                <p className="mt-2 text-sm text-[#939E95]">
                    Ficha de <span className="font-bold text-[#2E4039]">{form.name}</span>
                    {" "}(RA {form.ra}). O monitor verá este motivo para corrigir e reenviar.
                </p>

                <label className="mt-4 flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase text-gray-400">
                        Motivo da devolução
                    </span>
                    <textarea
                        value={justificativa}
                        onChange={(event) => setJustificativa(event.target.value)}
                        maxLength={LIMITE}
                        rows={5}
                        autoFocus
                        required
                        placeholder="Ex.: Assinatura ilegível. Assine novamente e reenvie o termo."
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#2E4039] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15"
                    />
                    <span className="self-end text-xs text-gray-400">
                        {justificativa.length}/{LIMITE}
                    </span>
                </label>

                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-4">
                    <Button onClick={onCancelar}>Cancelar</Button>

                    <button
                        type="submit"
                        disabled={!podeEnviar}
                        className="rounded-xl border border-red-500 bg-red-500 p-2 px-4 text-sm font-bold text-white transition-all hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {enviando ? "Devolvendo..." : "Devolver ficha"}
                    </button>
                </div>
            </form>
        </div>
    );
}