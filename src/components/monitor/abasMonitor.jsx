// Abas do painel do monitor: ícone, rótulo e textos do cabeçalho.
// "termo" não aparece no menu: é aberta pelo botão "Editar termo".

export const abasMonitor = [
  {
    id: 'inicio',
    label: 'Início',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
    ),
  },
  {
    id: 'visao-geral',
    label: 'Visão geral',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    ),
  },
  {
    id: 'perfil',
    label: 'Meu perfil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
  },
  {
    id: 'conta',
    label: 'Conta e agência',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>
    ),
  },
]

export const metaDasAbas = {
  inicio: {
    titulo: 'Início',
    subtitulo: 'Bem-vindo à sua monitoria',
    desc: 'Acompanhe o andamento da sua inscrição e veja o que fazer agora.',
  },
  'visao-geral': {
    titulo: 'Visão geral',
    subtitulo: 'Resumo da sua jornada',
    desc: 'Status do termo, da conta e agência e do seu perfil de atendimento.',
  },
  perfil: {
    titulo: 'Meu perfil',
    subtitulo: 'Informações de atendimento',
    desc: 'Informe como os alunos poderão encontrar você.',
  },
  conta: {
    titulo: 'Conta e agência',
    subtitulo: 'Dados para pagamento',
    desc: 'Informe apenas o número da conta e a agência. O envio fica aguardando a análise da supervisão.',
  },
  termo: {
    titulo: 'Editar termo',
    subtitulo: 'Ajuste necessário',
    desc: 'Corrija os campos solicitados e reenvie o termo para uma nova análise.',
  },
}