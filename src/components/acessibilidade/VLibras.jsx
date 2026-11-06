import { useEffect } from 'react'

// Widget oficial do governo federal que traduz o texto da página para Libras.
// https://vlibras.gov.br
const URL_APP = 'https://vlibras.gov.br/app'

// O script só pode ser carregado uma vez, mesmo que o componente monte de novo.
let carregando = false

export default function VLibras() {
  useEffect(() => {
    if (carregando) return

    carregando = true
    const script = document.createElement('script')
    script.src = `${URL_APP}/vlibras-plugin.js`
    script.async = true
    script.onload = () => {
      if (window.VLibras) new window.VLibras.Widget(URL_APP)
    }
    script.onerror = () => {
      // sem internet ou servidor fora do ar: permite tentar de novo no próximo carregamento
      carregando = false
      script.remove()
    }
    document.body.appendChild(script)
  }, [])

  // Estrutura exigida pelo plugin: ele monta o botão e a janela do intérprete aqui dentro.
  return (
    <div vw="true" className="enabled">
      <div vw-access-button="true" className="active" />
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  )
}