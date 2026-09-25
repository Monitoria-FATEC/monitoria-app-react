import logo from '../../assets/img/logo/logo.png'

export default function Navbar({ buttonBase }) {
  return (
    <header className="mx-auto flex min-h-23 w-[calc(100%-3rem)] max-w-255 items-center justify-between gap-6 max-[760px]:min-h-20.5 max-[760px]:gap-3">
      <a
        className="inline-flex shrink-0 items-center gap-3 text-[#243d38] no-underline"
        href="#inicio"
        aria-label="Monitoria FATEC - início"
      >
        <img
          className="h-14.5 w-14.5 object-contain"
          src={logo}
          alt="Logo da Monitoria"
        />

        <span className="flex flex-col leading-tight">
          <strong className="text-lg font-semibold tracking-[-.3px] max-[380px]:text-base">
            Nome do site
          </strong>

          <small className="mt-1 text-[10px] tracking-[.5px] max-[380px]:text-[9px]">
            MONITORIA ACADÊMICA
          </small>
        </span>
      </a>

      <nav
        className="ml-auto flex gap-8 max-[900px]:gap-4 max-[760px]:hidden"
        aria-label="Navegação principal"
      >
        <a
          className="text-sm text-[#5f6964] no-underline"
          href="#encontrar"
        >
          Encontrar monitoria
        </a>

        <a
          className="text-sm text-[#5f6964] no-underline"
          href="#como-funciona"
        >
          Como funciona
        </a>

        <a
          className="text-sm text-[#5f6964] no-underline"
          href="#sobre"
        >
          Sobre o projeto
        </a>
      </nav>

      <div className="flex shrink-0 items-center gap-5 max-[900px]:gap-3 max-[760px]:ml-auto">
        <a
          className="text-sm text-[#5f6964] no-underline max-[760px]:hidden"
          href="#entrar"
        >
          Entrar
        </a>

        <a
          className={`${buttonBase} bg-[#315c50] px-5 py-3 text-white max-[380px]:px-3 max-[380px]:text-xs`}
          href="/cadastro"
        >
          Sou Monitor
        </a>
      </div>
    </header>
  )
}