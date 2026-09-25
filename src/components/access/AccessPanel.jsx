import MonitorSignupForm from './MonitorSignupForm'

const roleContent = {
  aluno: {
    label: 'Sou aluno',
    title: 'A área do aluno está chegando.',
    description:
      'No próximo semestre, você poderá criar seu cadastro, encontrar monitores e pedir ajuda para estudar. Estamos preparando tudo com carinho para você.',
    icon: '◌',
    subtitle: 'Encontrar apoio',
  },

  monitor: {
    label: 'Sou monitor',
    title: 'Vamos começar seu cadastro?',
    description:
      'Compartilhe seu conhecimento com outros estudantes da FATEC Zona Leste.',
    icon: '✦',
    subtitle: 'Compartilhar conhecimento',
  },
}

export default function AccessPanel({ selectedRole, onSelectRole }) {
  const content = roleContent[selectedRole]

  return (
    <section
      className="scroll-mt-6 border-t border-[#e7ece4] bg-[#f7f6ef] px-6 py-16 sm:py-20"
      id="acesso"
      aria-labelledby="access-title"
    >
      <div className="mx-auto grid max-w-255 items-center gap-10 lg:grid-cols-[.85fr_1fr] lg:gap-14">
        <div className="max-w-87.5 lg:max-w-none">
          <span className="mb-4 block text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">
            SEU PRÓXIMO PASSO
          </span>

          <h2 className="m-0 mb-4 font-serif text-[35px] font-normal leading-tight tracking-[-1.3px] sm:text-[40px]">
            Uma rede feita para
            <br />
            <em className="text-[#769c8d]">aprender junto.</em>
          </h2>

          <p className="mb-7 text-[15px] leading-relaxed text-[#68766e]">
            Escolha como você quer participar agora. O projeto vai crescer com
            a comunidade.
          </p>

          <div
            className="grid gap-2.5"
            aria-label="Escolha seu perfil"
          >
            {Object.entries(roleContent).map(([role, roleData]) => (
              <button
                className={`grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-[13px] border bg-white px-4 py-3 text-left text-[#243d38] shadow-sm transition hover:-translate-y-px hover:border-[#315c50] hover:shadow-[0_5px_16px_rgba(49,92,80,.10)] ${
                  selectedRole === role
                    ? 'border-[#315c50] shadow-[0_5px_16px_rgba(49,92,80,.10)]'
                    : 'border-[#d6ded5]'
                }`}
                type="button"
                onClick={() => onSelectRole(role)}
                key={role}
              >
                <span
                  className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-[#edf4ed] text-xl"
                  aria-hidden="true"
                >
                  {roleData.icon}
                </span>

                <span>
                  <strong className="mb-1 block text-sm">
                    {roleData.label}
                  </strong>

                  <small className="block text-xs text-[#8b9890]">
                    {roleData.subtitle}
                  </small>
                </span>

                <span
                  className="text-lg text-[#315c50]"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-120 rounded-[22px] border border-[#e1e7df] bg-white p-6 shadow-[0_18px_46px_rgba(39,70,59,.08)] sm:p-9.5">
          {selectedRole === 'monitor' ? (
            <MonitorSignupForm />
          ) : (
            <div className="flex min-h-100 flex-col items-start justify-center">
              <span
                className="mb-7 flex h-15 w-15 items-center justify-center rounded-full bg-[#eaf3e9] text-3xl text-[#315c50]"
                aria-hidden="true"
              >
                {content.icon}
              </span>

              <span className="mb-4 block text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">
                EM BREVE
              </span>

              <h3 className="mb-2 font-serif text-[28px] font-normal tracking-[-.5px] text-[#243d38]">
                {content.title}
              </h3>

              <p className="m-0 text-sm leading-relaxed text-[#68766e]">
                {content.description}
              </p>

              <button
                className="mt-7 flex w-full items-center justify-between rounded-[9px] border-0 bg-[#f3efdf] px-4.25 py-3.75 text-sm font-bold text-[#315c50] transition hover:-translate-y-px hover:bg-[#e9e3cb]"
                type="button"
                onClick={() => onSelectRole('monitor')}
              >
                Quero ser monitor

                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}