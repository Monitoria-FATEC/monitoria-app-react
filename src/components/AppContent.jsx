import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import PreCadastro from '../pages/cadastro/PreCadastro'
import SupervisorPainel from '../pages/supervisor/SupervisorPainel'
import { supervisorRoutes } from '../routes/supervisorRoutes'
import SupervisorHome from '../pages/supervisor/SupervisorHome'

export default function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<PreCadastro />} />
        <Route path="/supervisor" element={<SupervisorPainel />}>
          {supervisorRoutes.map(({ index, path, element }) =>
            index ? <Route key={path} path={path} element={<SupervisorHome />}/> : <Route key={path} path={path} element={element} />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
