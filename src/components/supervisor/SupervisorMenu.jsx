import { NavLink } from "react-router-dom";
import { supervisorRoutes } from "../../routes/supervisorRoutes";
import logo from '../../assets/img/logo/logo.png'

export default function SupervisorMenu() {

    return(

    <aside className="w-60 bg-[#E9F0E5] h-screen sticky top-0 px-4 py-6 shrink-0">
        <NavLink to="/supervisor" className="inline-flex items-center gap-3 text-[#243d38] no-underline">
          <img className="h-14 w-14 object-contain" src={logo} alt="Logo da Monitoria" />
          <span className="flex flex-col leading-tight">
            <strong className="text-lg font-semibold tracking-[-.3px]">Nome do site</strong>
            <small className="mt-1 text-[10px] tracking-[.5px]">MONITORIA ACADÊMICA</small>
          </span>
        </NavLink>

        <ul className="mt-8 space-y-4 font-medium text-[#243d38]">
          {supervisorRoutes.map((r) => (
            <li key={r.path ?? 'inicio'}>
              <NavLink
                to={r.index ? '/supervisor' : `/supervisor/${r.path}`}
                end={r.index}
                className={({ isActive }) =>
                  `block hover:underline ${isActive ? 'font-bold underline' : ''}`
                }
              >
                {r.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
    )
}