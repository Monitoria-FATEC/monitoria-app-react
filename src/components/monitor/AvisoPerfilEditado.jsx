function formatarDataHora(valor) {
  if (!valor) return ''
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Aparece no topo do painel quando a supervisão editou os dados do monitor.
// Fica até o monitor clicar em "Entendi".
export default function AvisoPerfilEditado({ dashboard, onEntendi, lendo }) {
  if (!dashboard.avisoPerfilEm) return null

  const campos = dashboard.avisoPerfilCampos ?? []
  const quando = formatarDataHora(dashboard.avisoPerfilEm)

  return (
    <div className="mb-5 rounded-xl border border-[#e8d8a8] bg-[#fdf6dd] px-4 py-4 text-sm text-[#6b5a1e]" role="alert">
      <p className="m-0 font-bold">A supervisão editou o seu cadastro{quando ? ` em ${quando}` : ''}.</p>
      {campos.length > 0 && (
        <p className="m-0 mt-1">Campos alterados: {campos.join(', ')}.</p>
      )}
      <p className="m-0 mt-1">Confira se está tudo certo nas abas Meu perfil e Conta e agência. Se algo estiver errado, fale com a supervisão.</p>
      <button
        type="button"
        onClick={onEntendi}
        disabled={lendo}
        className="mt-3 min-h-11 cursor-pointer rounded-lg border-0 bg-[#315c50] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {lendo ? 'Salvando...' : 'Entendi'}
      </button>
    </div>
  )
}