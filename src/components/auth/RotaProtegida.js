import { Navigate, Outlet } from 'react-router-dom'

import { lerSessao } from '../../services/authStorage'

export default function RotaProtegida({ perfis, children }) {
  const sessao = lerSessao()

  if (!sessao?.token) {
    return <Navigate to="/entrar" replace />
  }

  if (perfis && !perfis.includes(sessao.usuario?.role)) {
    return <Navigate to="/" replace />
  }

  return children ?? <Outlet />
}