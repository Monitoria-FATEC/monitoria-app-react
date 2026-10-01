import SupervisorAprovar from "../pages/supervisor/SupervisorAprovar";
import SupervisorHome from "../pages/supervisor/SupervisorHome";

export const supervisorRoutes = [
  {
    index: true,
    path: '',
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
    element: <SupervisorAprovar />,
  },

]