import { Link } from 'react-router-dom'

import MonitorSignupForm from '../../components/access/MonitorSignupForm'

import cadastroImage from '../../assets/img/cadastro/login.png'

export default function PreCadastro() {
  return (
    <main className="min-h-screen bg-white text-[#243d38] lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-65 overflow-hidden lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={cadastroImage}
          alt="Mesa de estudos ilustrada com notebook, livros e materiais acadêmicos"
        />
      </div>

      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 sm:py-10 lg:px-[clamp(3rem,8vw,7.5rem)] lg:py-12 xl:px-[clamp(5rem,10vw,9rem)]">
        <div className="mx-auto flex w-full max-w-140 flex-1 flex-col justify-center">
          <Link
            className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#68766e] no-underline transition hover:text-[#0d3524]"
            to="/"
          >
            <span aria-hidden="true">←</span>
            Voltar para o início
          </Link>

          <div className="mb-8 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">
                PRÉ-CADASTRO
              </p>

              <h1 className="m-0 font-serif text-[clamp(2rem,3.2vw,2.75rem)] font-normal leading-[1.08] tracking-[-1.2px] text-[#243d38]">
                Vamos começar seu cadastro?
              </h1>

              <p className="mt-3 max-w-107.5 text-sm leading-relaxed text-[#68766e]">
                Compartilhe seu conhecimento com outros estudantes da FATEC
                Zona Leste.
              </p>
            </div>

            <span
              className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf4ed] text-2xl text-[#315c50] sm:flex"
              aria-hidden="true"
            >
              ✦
            </span>
          </div>

          <MonitorSignupForm />

          <div className="mt-8 border-t border-[#d6ded5] pt-6 text-center text-sm text-[#68766e]">
            Já tem uma conta?{' '}
            <a
              className="font-medium text-[#315c50] underline decoration-[#315c50]/40 underline-offset-4 hover:decoration-[#315c50]"
              href="#entrar"
            >
              Entrar
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}