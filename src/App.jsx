export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-400 mb-2">
          Monitoria React
        </h1>
        <p className="text-slate-400 text-sm md:text-base mb-6">
          Layout totalmente responsivo rodando no Vite + Tailwind v4!
        </p>
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
          Testar Botão
        </button>
      </div>
    </div>
  )
}