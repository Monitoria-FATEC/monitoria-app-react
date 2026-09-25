import logo from '../../assets/img/logo/logo.png'

const linkClass =
  'mb-2.5 block text-sm text-[#68766e] no-underline hover:text-[#315c50]'

export default function Footer() {
  return (
    <footer
      className="bg-[#f3f0e4] text-[#68766e]"
      id="acesso"
    >
      <div className="mx-auto grid min-h-47.5 w-[calc(100%-3rem)] max-w-255 grid-cols-[2fr_1fr_1fr] gap-8 py-9 max-[760px]:grid-cols-1 max-[760px]:gap-6 max-[760px]:py-8">
        <div>
          <a
            className="inline-flex items-center gap-3 text-[#243d38] no-underline"
            href="#inicio"
            aria-label="Monitoria FATEC - início"
          >
            <img
              className="h-13.5 w-13.5 object-contain"
              src={logo}
              alt="Logo da Monitoria"
            />

            <span className="flex flex-col leading-tight">
              <strong className="text-lg font-semibold tracking-[-.3px]">
                Nome do site
              </strong>

              <small className="mt-1 text-[10px] tracking-[.5px]">
                MONITORIA ACADÊMICA
              </small>
            </span>
          </a>

          <p className="mt-3 text-sm leading-[1.6]">
            Conectando quem quer aprender
            <br />
            com quem gosta de ensinar.
          </p>
        </div>

        <div>
          <h3 className="mt-1 mb-4 text-base font-semibold text-[#243d38]">
            Explorar
          </h3>

          <a className={linkClass} href="#encontrar">
            Encontrar monitoria
          </a>

          <a className={linkClass} href="#como-funciona">
            Como funciona
          </a>
        </div>

        <div>
          <h3 className="mt-1 mb-4 text-base font-semibold text-[#243d38]">
            Conta
          </h3>

          <a className={linkClass} href="#entrar">
            Entrar
          </a>

          <a className={linkClass} href="/cadastro">
            Cadastro
          </a>
        </div>
      </div>

      <div className="border-t border-[#d4d3c8] p-4 text-center text-xs">
        © 2026 FATEC ZL.
      </div>
    </footer>
  )
}