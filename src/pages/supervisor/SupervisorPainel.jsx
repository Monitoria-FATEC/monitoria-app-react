import { Outlet, useLocation } from 'react-router-dom';
import PainelHeader from '../../components/PainelHeader';
import { supervisorRoutes } from '../../routes/supervisorRoutes';
import SidebarMenu, { BotaoAbrirMenu } from '../../components/SidebarMenu';
import useMenuLateral from '../../hooks/useMenuLateral';

const MENU_ID = 'menu-supervisor';

const itensDoMenu = supervisorRoutes.map((r) => ({
  id: r.path,
  label: r.label,
  icon: r.icon,
  to: r.index ? '/supervisor' : `/supervisor/${r.path}`,
  end: r.index,
}));

export default function SupervisorPainel() {
  const { pathname } = useLocation();
  const menu = useMenuLateral();

  const todayDate = new Date()

  const day = todayDate.getDate();
  const month = todayDate.toLocaleDateString('pt-BR', { month: 'long' });
  const year = todayDate.getFullYear();

  const atual =
    supervisorRoutes.find((r) => r.path && pathname.endsWith(r.path)) ||
    supervisorRoutes.find((r) => r.path == '/');

  return (
    <div className="flex w-full min-h-screen ">
      <SidebarMenu
        id={MENU_ID}
        label="Menu do supervisor"
        itens={itensDoMenu}
        aberto={menu.aberto}
        onFechar={menu.fechar}
        botaoFecharRef={menu.botaoFecharRef}
      />
      {/* inert: com a gaveta aberta, o teclado não alcança a página atrás dela */}
      <div inert={menu.aberto} className="flex min-w-0 flex-1 flex-col bg-white">
        <PainelHeader
          titulo={atual.titulo}
          botaoMenu={
            <BotaoAbrirMenu aberto={menu.aberto} onAbrir={menu.abrir} botaoRef={menu.botaoAbrirRef} controla={MENU_ID} />
          }
        />
        <div className="bg-[#E9F0E5] w-full h-full md:pb-2 md:pr-2">
          <main className="h-full min-w-0 border md:rounded-2xl rounded-t-2xl bg-white border-gray-200 shadow-md">
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
