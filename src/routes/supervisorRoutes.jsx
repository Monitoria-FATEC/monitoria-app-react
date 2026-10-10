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
  },
  {
    path: 'aprovacoes',
    label: 'Aprovações',
    titulo: 'Aprovações',
    subtitulo: 'Gerencie as solicitações pendentes',
    desc: 'Dê aceite, devolva com justificativa, ou encaminhe para a Gestão (diretor e coordenador do curso)',
    element: <SupervisorAprovar />,
  },
  {
    path: 'lista-monitores',
    label: 'Lista de Monitores',
    titulo: 'Lista de Monitores',
    subtitulo: 'Gerencie os monitores cadastrados',
    desc: 'Controle os perfis dos monitores, verifique os dados, edite ou exclua.',
    element: <SupervisorListaMonitores />,
  },
  {
    path: 'contas-bancarias',
    label: 'Contas Bancárias',
    titulo: 'Formulários de Contas Bancárias',
    subtitulo: 'Gerencie as informações de contas bancárias',
    desc: 'Controle os dados dos formulparios das contas bancárias dos monitores, verifique os dados, edite ou exclua.',
    element: <SupervisorContaBanco />,
  }

]