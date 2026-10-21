import { Navigate, Outlet } from 'react-router-dom'

import { lerSessaoValida } from '../../services/authStorage'

// Uso como "layout" de rotas:
//   <Route element={<RotaProtegida perfis={['SUPERVISOR', 'ADMIN']} />}>
//     <Route path="/supervisor" element={<SupervisorPainel />} />
//   </Route>
//
// Uso envolvendo um elemento:
//   <RotaProtegida perfis={['SUPERVISOR']}><SupervisorPainel /></RotaProtegida>
export default function RotaProtegida({ perfis, children }) {
  const sessao = lerSessaoValida()

  if (!sessao?.token) {
    return <Navigate to="/entrar" replace />
  }

  // entrou com a senha temporária do supervisor: precisa criar a própria antes de continuar
  if (sessao.usuario?.senhaTemporaria) {
    return <Navigate to="/trocar-senha" replace />
  }

  if (perfis && !perfis.includes(sessao.usuario?.role)) {
    return <Navigate to="/" replace />
  }

  return children ?? <Outlet />
}