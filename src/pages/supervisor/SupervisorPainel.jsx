import { Outlet, useLocation } from 'react-router-dom';
import SupervisorHeader from '../../components/supervisor/SupervisorHeader';
import { supervisorRoutes } from '../../routes/supervisorRoutes';
import SupervisorMenu from '../../components/supervisor/SupervisorMenu';

export default function SupervisorPainel() {
  const { pathname } = useLocation();

  const atual =
    supervisorRoutes.find((r) => r.path && pathname.endsWith(r.path)) ||
    supervisorRoutes.find((r) => r.path);

  return (
    <div className="flex w-full min-h-screen">
      <SupervisorMenu />
      <div className="flex-1 flex flex-col bg-white">
        <SupervisorHeader titulo={atual.titulo} subtitulo={atual.subtitulo} />
        <main className="p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}