import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import PreCadastro from '../pages/cadastro/PreCadastro'

export default function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<PreCadastro />} />
      </Routes>
    </BrowserRouter>
  )
}
