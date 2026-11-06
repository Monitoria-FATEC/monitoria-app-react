import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SupervisorHeader from '../../components/supervisor/SupervisorHeader';
import { supervisorRoutes } from '../../routes/supervisorRoutes';
import SupervisorMenu from '../../components/supervisor/SupervisorMenu';

const MENU_ID = 'menu-supervisor';

export default function SupervisorPainel() {
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoMenuRef = useRef(null);
  const botaoFecharRef = useRef(null);

  const todayDate = new Date()

  const day = todayDate.getDate();
  const month = todayDate.toLocaleDateString('pt-BR', { month: 'long' });
  const year = todayDate.getFullYear();

  const atual =
    supervisorRoutes.find((r) => r.path && pathname.endsWith(r.path)) ||
    supervisorRoutes.find((r) => r.path == '/');

  // Com a gaveta aberta: trava a rolagem da página, leva o foco para dentro dela
  // e fecha com Esc ou se a tela crescer até o tamanho em que o menu fica fixo.
  useEffect(() => {
    if (!menuAberto) return undefined;

    const botaoMenu = botaoMenuRef.current;
    const telaGrande = window.matchMedia('(min-width: 48rem)');
    const fechar = () => setMenuAberto(false);
    const aoPressionar = (event) => {
      if (event.key === 'Escape') fechar();
    };

    document.body.style.overflow = 'hidden';
    botaoFecharRef.current?.focus();
    document.addEventListener('keydown', aoPressionar);
    telaGrande.addEventListener('change', fechar);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', aoPressionar);
      telaGrande.removeEventListener('change', fechar);
      botaoMenu?.focus();
    };
  }, [menuAberto]);

  return (
    <div className="flex w-full min-h-screen ">
      <SupervisorMenu
        id={MENU_ID}
        aberto={menuAberto}
        onFechar={() => setMenuAberto(false)}
        botaoFecharRef={botaoFecharRef}
      />
      {/* inert: com a gaveta aberta, o teclado não alcança a página atrás dela */}
      <div inert={menuAberto} className="flex min-w-0 flex-1 flex-col bg-white">
        <SupervisorHeader
          titulo={atual.titulo}
          menuId={MENU_ID}
          menuAberto={menuAberto}
          onAbrirMenu={() => setMenuAberto(true)}
          botaoMenuRef={botaoMenuRef}
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
