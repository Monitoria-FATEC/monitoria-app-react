import logo from '../../assets/img/logo/logo.png'

export default function Navbar({ buttonBase }) {
  return (
    <header className="mx-auto flex min-h-[82px] w-[calc(100%-3rem)] max-w-[1020px] items-center justify-between gap-[30px] max-[760px]:min-h-[72px]">
      <a className="inline-flex items-center gap-2 text-[#243d38] no-underline" href="#inicio" aria-label="Monitoria FATEC - início">
        <img className="h-9 w-12 object-contain" src={logo} alt="Logo da Monitoria" />
        <span className="flex flex-col leading-none"><strong className="text-base font-semibold tracking-[-.3px]">Nome do site</strong><small className="mt-[5px] text-[5px] tracking-[.45px]">MONITORIA ACADÊMICA</small></span>
      </a>
      <nav className="ml-auto flex gap-[50px] max-[760px]:hidden" aria-label="Navegação principal"><a className="text-[10px] text-[#5f6964] no-underline" href="#encontrar">Encontrar monitoria</a><a className="text-[10px] text-[#5f6964] no-underline" href="#como-funciona">Como funciona</a><a className="text-[10px] text-[#5f6964] no-underline" href="#sobre">Sobre o projeto</a></nav>
      <div className="flex items-center gap-[23px] max-[760px]:ml-auto max-[760px]:gap-3"><a className="text-[10px] text-[#5f6964] no-underline max-[760px]:hidden" href="#entrar">Entrar</a><a className={`${buttonBase} bg-[#315c50] px-[22px] py-2.5 text-white`} href="#monitor">Sou Monitor</a></div>
    </header>
  )
}
