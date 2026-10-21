import { Link } from "react-router-dom";
import MenuUsuario from "../auth/MenuUsuario";

export default function SupervisorHeader({titulo}) {
	return(
		<header className="flex w-full justify-between items-center p-6 shadow-2xs bg-[#E9F0E5]">
			<h1 className="text-[#2E4039] font-bold text-3xl mb-2.5">{titulo}</h1>
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