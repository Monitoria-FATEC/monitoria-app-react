import { useState } from "react";
import { cadastrarMonitor } from "../api/monitorApi";

export default function PreCadastroForm() {
  const [form, setForm] = useState({ nome: "", ra: "", email: "", curso: "" });
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    setMensagem(null);

    try {
      const resultado = await cadastrarMonitor(form);
      setMensagem(`Cadastro enviado! Status: ${resultado.status}`);
      setForm({ nome: "", ra: "", email: "", curso: "" });
    } catch (err) {
      setErro("Erro ao enviar cadastro. Verifique os dados.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full space-y-4"
    >
      <h2 className="text-xl font-bold text-indigo-400">Pré-cadastro de Monitor</h2>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
        <input type="text" name="nome" value={form.nome} onChange={handleChange} required
          className="w-full rounded-lg px-3 py-2 bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">RA</label>
        <input type="text" name="ra" value={form.ra} onChange={handleChange} required
          className="w-full rounded-lg px-3 py-2 bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required
          className="w-full rounded-lg px-3 py-2 bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Curso</label>
        <input type="text" name="curso" value={form.curso} onChange={handleChange} required
          className="w-full rounded-lg px-3 py-2 bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500" />
      </div>

      <button type="submit" disabled={enviando}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50">
        {enviando ? "Enviando..." : "Enviar cadastro"}
      </button>

      {mensagem && <p className="text-green-400 text-sm">{mensagem}</p>}
      {erro && <p className="text-red-400 text-sm">{erro}</p>}
    </form>
  );
}