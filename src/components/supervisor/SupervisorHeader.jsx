import { Link } from "react-router-dom";
import MenuUsuario from "../auth/MenuUsuario";

export default function SupervisorHeader({titulo, menuId, menuAberto, onAbrirMenu, botaoMenuRef}) {
	return(
		<header className="flex w-full flex-wrap justify-between items-center gap-x-2 md:gap-x-6 gap-y-2 p-6 shadow-2xs bg-[#E9F0E5]">
			<div className="flex min-w-0 items-center gap-2 w-3/4 md:w-auto">
				<button
					ref={botaoMenuRef}
					type="button"
					onClick={onAbrirMenu}
					aria-label="Abrir menu"
					aria-expanded={menuAberto}
					aria-controls={menuId}
					className="-ml-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#2E4039] transition hover:bg-white/60 md:hidden"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>
				</button>
				<h1 className="text-[#2E4039] font-bold text-xl md:text-2xl  min-w-0 break-words max-md:mb-0">{titulo}</h1>
			</div>
			<div className="flex items-center gap-6">
				<Link
					to="/"
					className="hidden text-sm font-medium text-[#315c50] no-underline hover:underline sm:inline"
				>
					← Página inicial
				</Link>
				<MenuUsuario />
			</div>
		</header>
	)
}
