import { useState } from 'react'
import Footer from '../../components/footer/Footer'
import Navbar from '../../components/navbar/Navbar'
import AccessPanel from '../../components/access/AccessPanel'
import heroImage from '../../assets/img/home/hero.png'
import studentImage from '../../assets/img/illustrations/student.png'
import monitorImage from '../../assets/img/illustrations/monitor.png'
import supervisorImage from '../../assets/img/illustrations/supervisor.png'

const steps = [
  { number: '01', title: 'Encontre seu apoio', description: 'Filtre por disciplina e escolha o horário que combina com você.' },
  { number: '02', title: 'Converse sem pressa', description: 'Conheça o monitor e escolha o melhor canal para trocar ideias.' },
  { number: '03', title: 'Aprenda em conjunto', description: 'Uma pergunta pode ser o começo de uma grande descoberta.' },
]

const audiences = [
  { className: 'bg-[#dcebdd]', role: 'aluno', title: 'Para quem estuda', description: 'Veja os horários, descubra quem pode te ajudar e escolha o jeito mais confortável de conversar.', action: 'Encontrar monitor', image: studentImage, imageAlt: 'Pessoa estudando com notebook' },
  { className: 'bg-[#fff1b9]', role: 'monitor', title: 'Para quem compartilha', description: 'Organize seus horários, receba pedidos de ajuda e acompanhe o impacto do seu conhecimento.', action: 'Sou monitor', image: monitorImage, imageAlt: 'Pessoa compartilhando conhecimento' },
  { className: 'bg-[#f2dfd0]', role: 'supervisor', title: 'Para quem cuida', description: 'Supervisione monitores, aprove perfis e mantenha a rede segura e acolhedora.', action: 'Área do supervisor', image: supervisorImage, imageAlt: 'Pessoa supervisionando um calendário' },
]

const buttonBase = 'inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium no-underline transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(39,70,59,0.12)]'

export default function Home() {
  const [selectedRole, setSelectedRole] = useState('aluno')

  function openAccess(role) {
    setSelectedRole(role === 'supervisor' ? 'aluno' : role)
    window.requestAnimationFrame(() => document.getElementById('acesso')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <main className="min-h-screen bg-white font-sans text-left text-[#243d38]">
      <Navbar buttonBase={buttonBase} />

      <section className="mx-auto grid min-h-103.75 w-[calc(100%-3rem)] max-w-255 grid-cols-2 items-center py-13.75 pb-11.75 max-[760px]:grid-cols-1 max-[760px]:min-h-0 max-[760px]:py-10.5 max-[760px]:pb-5.5" id="inicio">
        <div>
          <h1 className="m-0 mb-4.5 font-serif text-[54px] font-normal leading-[0.98] tracking-[-1.5px] max-[760px]:text-[50px]">Tem dúvida?<br /><em className="text-[#769c8d]">Tem<br />monitoria.</em></h1>
          <p className="mb-5.5 max-w-97.5 text-base leading-[1.65] text-[#68766e]">Encontre apoio para estudar, compartilhe o que você sabe e faça parte de uma rede que aprende em conjunto.</p>
          <div className="flex flex-wrap gap-3">
            <button className={`${buttonBase} border-0 bg-[#315c50] text-white`} type="button" onClick={() => openAccess('aluno')}>Encontrar uma monitoria <span aria-hidden="true">→</span></button>
            <button className={`${buttonBase} border-0 bg-[#f3efdf] text-[#315c50]`} type="button" onClick={() => openAccess('monitor')}>Sou monitor <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <img className="mx-auto h-75 w-full max-w-107.5 object-contain max-[760px]:my-2.5 max-[760px]:h-61.25" src={heroImage} alt="Mesa de estudos com notebook, luminária e cadernos" />
      </section>

      <section className="border-y border-[#ebf0e7] bg-[#f2f6ee]" id="como-funciona" aria-label="Como funciona">
        <div className="mx-auto grid w-[calc(100%-3rem)] max-w-255 grid-cols-3 py-8.5 max-[760px]:grid-cols-1 max-[760px]:py-3">
          {steps.map((step) => <article className="grid grid-cols-[40px_1fr] gap-2 border-r border-[#cbd4cb] px-7.5 first:pl-1 last:border-0 max-[760px]:border-b max-[760px]:border-r-0 max-[760px]:px-0 max-[760px]:py-5 max-[760px]:last:border-0" key={step.number}><span className="font-serif text-sm italic text-[#78867e]">{step.number}</span><div><h2 className="m-0 mb-2 font-serif text-lg font-semibold">{step.title}</h2><p className="max-w-62.5 text-sm leading-[1.55] text-[#68766e]">{step.description}</p></div></article>)}
        </div>
      </section>

      <section className="mx-auto w-[calc(100%-3rem)] max-w-255 py-14.25 pb-19 max-[760px]:py-11 max-[760px]:pb-13.75" id="encontrar">
        <h2 className="mb-10.5 font-serif text-[39px] font-normal leading-[1.05] tracking-[-1.2px] max-[760px]:mb-8 max-[760px]:text-[35px]">Um espaço para<br /><em className="text-[#769c8d]">todo mundo aprender.</em></h2>
        <div className="grid grid-cols-3 gap-4.25 max-[760px]:grid-cols-1 max-[760px]:gap-4">
          {audiences.map((audience) => <article className={`relative min-h-62.5 overflow-hidden rounded-xl p-[27px_22px] max-[760px]:min-h-57.5 ${audience.className}`} key={audience.title}><h3 className="m-0 mb-3 font-serif text-xl font-normal">{audience.title}</h3><p className="mb-4 max-w-51.25 text-sm leading-normal text-[#68766e]">{audience.description}</p><button className="relative z-10 border-0 bg-transparent p-0 text-sm font-semibold text-[#243d38]" type="button" onClick={() => openAccess(audience.role)}>{audience.action} <span aria-hidden="true">→</span></button><img className="absolute bottom-0 right-0 h-28 w-35 object-contain object-bottom" src={audience.image} alt={audience.imageAlt} /></article>)}
        </div>
      </section>

      <section className="bg-[#315c50] px-4 py-11.5 pb-14 text-center text-white max-[760px]:py-9.5 max-[760px]:pb-11" id="sobre"><div className="mx-auto w-[calc(100%-3rem)] max-w-255"><span className="block h-10.5 font-serif text-[48px] leading-none text-[#e5cc5e]">“</span><blockquote className="m-0 font-serif text-[21px] leading-[1.45] max-[760px]:text-[18px]">Quando a gente ensina, também encontra<br className="max-[760px]:hidden" /> novas formas de aprender.</blockquote></div></section>

      <section className="mx-auto flex min-h-58 w-[calc(100%-3rem)] max-w-255 items-center justify-between gap-8 max-[760px]:block max-[760px]:min-h-0 max-[760px]:py-12.5" id="monitor"><h2 className="m-0 font-serif text-[39px] font-normal leading-[1.05] tracking-[-1.2px] max-[760px]:mb-8 max-[760px]:text-[35px]">Comece por uma<br /><em className="text-[#769c8d]">boa pergunta.</em></h2><button className={`${buttonBase} border-0 bg-[#315c50] text-white max-[760px]:mt-5.5`} type="button" onClick={() => openAccess('monitor')}>Quero ser monitor <span aria-hidden="true">→</span></button></section>

      <AccessPanel selectedRole={selectedRole} onSelectRole={setSelectedRole} />
      <Footer />
    </main>
  )
}
