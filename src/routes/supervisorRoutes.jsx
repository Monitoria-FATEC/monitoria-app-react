import SupervisorAprovar from "../pages/supervisor/SupervisorAprovar";
import SupervisorContaBanco from "../pages/supervisor/SupervisorContaBanco";
import SupervisorHome from "../pages/supervisor/SupervisorHome";
import SupervisorListaMonitores from "../pages/supervisor/SupervisorListaMonitores";

export const supervisorRoutes = [
  {
    index: true,
    path: 'supervisor',
    label: 'Início',
    titulo: 'Início',
    subtitulo: 'home',
    element: <SupervisorHome />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house preview-icon"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  },
  {
    path: 'aprovacoes',
    label: 'Aprovar Formulários',
    titulo: 'Aprovações',
    subtitulo: 'Gerencie as solicitações pendentes',
    desc: 'Dê aceite, devolva com justificativa, ou encaminhe para a Gestão (diretor e coordenador do curso)',
    element: <SupervisorAprovar />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text preview-icon"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
  },
  {
    path: 'lista-monitores',
    label: 'Lista de Monitores',
    titulo: 'Lista de Monitores',
    subtitulo: 'Gerencie os monitores cadastrados',
    desc: 'Controle os perfis dos monitores, verifique os dados, edite ou exclua.',
    element: <SupervisorListaMonitores />,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-user preview-icon"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M16 22a4 4 0 0 0-8 0"/><circle cx="12" cy="15" r="3"/></svg>
  },
  // {
  //   path: 'contas-bancarias',
  //   label: 'Contas Bancárias',
  //   titulo: 'Formulários de Contas Bancárias',
  //   subtitulo: 'Gerencie as informações de contas bancárias',
  //   desc: 'Controle os dados dos formulparios das contas bancárias dos monitores, verifique os dados, edite ou exclua.',
  //   element: <SupervisorContaBanco />,
  // }

]