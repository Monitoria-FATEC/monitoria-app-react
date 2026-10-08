import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import PreCadastro from '../pages/cadastro/PreCadastro'
import TermoCompromisso from '../pages/termo/TermoCompromisso'
import Login from '../pages/login/Login'
import SupervisorPainel from '../pages/supervisor/SupervisorPainel'
import { supervisorRoutes } from '../routes/supervisorRoutes'
import SupervisorHome from '../pages/supervisor/SupervisorHome'
import RotaProtegida from './auth/RotaProtegida'
import MonitorDashboard from '../pages/monitor/MonitorDashboard'

export default function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<PreCadastro />} />
        <Route path="/cadastro/termo" element={<TermoCompromisso />} />
        <Route path="/entrar" element={<Login />} />
        <Route
          path="/monitor"
          element={
            <RotaProtegida perfis={['MONITOR']}>
              <MonitorDashboard />
            </RotaProtegida>
          }
        />
        <Route
          path="/supervisor"
          element={
            <RotaProtegida perfis={['SUPERVISOR', 'ADMIN']}>
              <SupervisorPainel />
            </RotaProtegida>
          }
        >
          {supervisorRoutes.map(({ index, path, element }) =>
            index ? (
              <Route key={path} path={path} element={<SupervisorHome />} />
            ) : (
              <Route key={path} path={path} element={element} />
            )
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
