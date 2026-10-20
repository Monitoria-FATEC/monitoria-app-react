import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import PreCadastro from '../pages/cadastro/PreCadastro'
import VerificarEmail from '../pages/cadastro/VerificarEmail'
import TermoCompromisso from '../pages/termo/TermoCompromisso'
import Login from '../pages/login/Login'
import SupervisorPainel from '../pages/supervisor/SupervisorPainel'
import { supervisorRoutes } from '../routes/supervisorRoutes'
import SupervisorHome from '../pages/supervisor/SupervisorHome'
import RotaProtegida from './auth/RotaProtegida'
import MonitorDashboard from '../pages/monitor/MonitorDashboard'
import EsqueciSenha from '../pages/senha/EsqueciSenha'
import VerificarCodigo from '../pages/senha/VerificarCodigo'
import RedefinirSenha from '../pages/senha/RedefinirSenha'

export default function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<PreCadastro />} />
        <Route path="/cadastro/verificar" element={<VerificarEmail />} />
        <Route path="/cadastro/termo" element={<TermoCompromisso />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route
          path="/esqueci-senha/verificar"
          element={<VerificarCodigo />}
        />
        <Route
          path="/esqueci-senha/redefinir"
          element={<RedefinirSenha />}
        />
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