import { useNavigate } from 'react-router-dom'

import { limparSessao } from '../../services/authStorage'
import ConformationModal from '../ConfirmationModal'

// Confirmação antes de sair da conta. Confirmando, apaga a sessão e volta para o login.
// Usado no menu lateral (SidebarMenu) e no menu da conta do cabeçalho (MenuUsuario).
export default function ModalSair({ aberto, onCancelar }) {
  const navigate = useNavigate()

  function sair() {
    limparSessao()
    navigate('/entrar', { replace: true })
  }

  return (
    <ConformationModal
      open={aberto}
      titulo="Sair da conta"
      descricao="Deseja mesmo sair da conta?"
      onCancel={onCancelar}
      onConfirm={sair}
    />
  )
}
