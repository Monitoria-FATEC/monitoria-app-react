import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import PreCadastro from '../pages/cadastro/PreCadastro'
import TermoCompromisso from '../pages/termo/TermoCompromisso'

export default function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<PreCadastro />} />
        <Route path="/cadastro/termo" element={<TermoCompromisso />} />
      </Routes>
    </BrowserRouter>
  )
}