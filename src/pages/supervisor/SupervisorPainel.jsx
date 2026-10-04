import { Outlet, useLocation } from 'react-router-dom';
import SupervisorHeader from '../../components/supervisor/SupervisorHeader';
import { supervisorRoutes } from '../../routes/supervisorRoutes';
import SupervisorMenu from '../../components/supervisor/SupervisorMenu';

export default function SupervisorPainel() {
  const { pathname } = useLocation();

  const todayDate = new Date()

  const day = todayDate.getDate();
  const month = todayDate.toLocaleDateString('pt-BR', { month: 'long' });
  const year = todayDate.getFullYear();

  const atual =
    supervisorRoutes.find((r) => r.path && pathname.endsWith(r.path)) ||
    supervisorRoutes.find((r) => r.path == '/');

  return (
    <div className="flex w-full min-h-screen ">
      <SupervisorMenu />
      <div className="flex-1 flex flex-col bg-white">
        <SupervisorHeader titulo={atual.titulo}/>
        <div className="bg-[#E9F0E5] w-full h-full pb-2 pr-2">
          <main className="h-full border rounded-2xl bg-white border-gray-200 shadow-md">
            <div className="p-6">
              <p className="uppercase text-[#939E95] text-md mb-4">dia {day} de {month} de {year}</p>
              <h1 className='text-xl font-medium mb-2'>{atual.subtitulo}</h1>
              <p className="text-[#939E95] text-md mb-4">{atual.desc}</p>
            </div>
            <Outlet /> 
          </main>
        </div>
      </div>
    </div>
  );
}