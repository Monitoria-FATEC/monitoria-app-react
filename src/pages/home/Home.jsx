import Footer from '../../components/footer/Footer'
import Navbar from '../../components/navbar/Navbar'
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
  { className: 'bg-[#dcebdd]', title: 'Para quem estuda', description: 'Veja os horários, descubra quem pode te ajudar e escolha o jeito mais confortável de conversar.', action: 'Encontrar monitor', image: studentImage, imageAlt: 'Pessoa estudando com notebook' },
  { className: 'bg-[#fff1b9]', title: 'Para quem compartilha', description: 'Organize seus horários, receba pedidos de ajuda e acompanhe o impacto do seu conhecimento.', action: 'Sou Monitor', image: monitorImage, imageAlt: 'Pessoa compartilhando conhecimento' },
  { className: 'bg-[#f2dfd0]', title: 'Para quem cuida', description: 'Supervisione monitores, aprove perfis e mantenha a rede segura e acolhedora.', action: 'Área do supervisor', image: supervisorImage, imageAlt: 'Pessoa supervisionando um calendário' },
]

const buttonBase = 'inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-2.5 text-[10px] font-medium no-underline transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(39,70,59,0.12)]'

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-left text-[#243d38]">
      <Navbar buttonBase={buttonBase} />
      <section className="mx-auto grid min-h-[415px] w-[calc(100%-3rem)] max-w-[1020px] grid-cols-2 items-center py-[55px] pb-[47px] max-[760px]:grid-cols-1 max-[760px]:min-h-0 max-[760px]:py-[42px] max-[760px]:pb-[22px]" id="inicio">
        <div><h1 className="m-0 mb-[15px] font-serif text-[54px] font-normal leading-[0.95] tracking-[-1.5px] max-[760px]:text-[50px]">Tem dúvida?<br /><em className="text-[#769c8d]">Tem<br />monitoria.</em></h1><p className="mb-[15px] max-w-[300px] text-[11px] leading-[1.5] text-[#87908a]">Encontre apoio para estudar, compartilhe o que você sabe e faça parte de uma rede que aprende em conjunto.</p><div className="flex gap-2.5"><a className={`${buttonBase} bg-[#315c50] text-white`} href="#encontrar">Encontrar uma monitoria <span aria-hidden="true">→</span></a><a className={`${buttonBase} bg-[#f3efdf] text-[#315c50]`} href="#monitor">Sou Monitor <span aria-hidden="true">→</span></a></div></div>
        <img className="mx-auto h-[300px] w-full max-w-[430px] object-contain max-[760px]:my-2.5 max-[760px]:h-[245px]" src={heroImage} alt="Mesa de estudos com notebook, luminária e cadernos" />
      </section>
      <section className="border-y border-[#ebf0e7] bg-[#f2f6ee]" id="como-funciona" aria-label="Como funciona"><div className="mx-auto grid w-[calc(100%-3rem)] max-w-[1020px] grid-cols-3 py-[29px] max-[760px]:grid-cols-1 max-[760px]:py-3">{steps.map((step) => <article className="grid grid-cols-[32px_1fr] gap-1.5 border-r border-[#cbd4cb] px-[30px] first:pl-1 last:border-0 max-[760px]:border-b max-[760px]:border-r-0 max-[760px]:px-0 max-[760px]:py-[17px] max-[760px]:last:border-0" key={step.number}><span className="font-serif text-[10px] italic text-[#8c9690]">{step.number}</span><div><h2 className="m-0 mb-1 font-serif text-[13px] font-semibold">{step.title}</h2><p className="max-w-[190px] text-[9px] leading-[1.35] text-[#8d9790]">{step.description}</p></div></article>)}</div></section>
      <section className="mx-auto w-[calc(100%-3rem)] max-w-[1020px] py-[57px] pb-[76px] max-[760px]:py-11 max-[760px]:pb-[55px]" id="encontrar"><h2 className="mb-[54px] font-serif text-[39px] font-normal leading-[0.95] tracking-[-1.5px] max-[760px]:mb-8 max-[760px]:text-[35px]">Um espaço para<br /><em className="text-[#769c8d]">todo mundo aprender.</em></h2><div className="grid grid-cols-3 gap-[17px] max-[760px]:grid-cols-1 max-[760px]:gap-3">{audiences.map((audience) => <article className={`relative h-[183px] overflow-hidden rounded-xl p-[27px_22px] max-[760px]:h-[170px] ${audience.className}`} key={audience.title}><h3 className="m-0 mb-[13px] font-serif text-[17px] font-normal">{audience.title}</h3><p className="mb-3 max-w-[180px] text-[9px] leading-[1.45] text-[#8a9188]">{audience.description}</p><a className="text-[8px] font-semibold text-[#243d38] no-underline" href="#acesso">{audience.action} <span aria-hidden="true">→</span></a><img className="absolute bottom-[-3px] right-0 h-[105px] w-[145px] object-contain object-bottom" src={audience.image} alt={audience.imageAlt} /></article>)}</div></section>
      <section className="bg-[#315c50] px-4 py-[46px] pb-[56px] text-center text-white max-[760px]:py-[38px] max-[760px]:pb-[44px]" id="sobre"><div className="mx-auto w-[calc(100%-3rem)] max-w-[1020px]"><span className="block h-[42px] font-serif text-[48px] leading-none text-[#e5cc5e]">“</span><blockquote className="m-0 font-serif text-[21px] leading-[1.45] max-[760px]:text-[18px]">Quando a gente ensina, também encontra<br className="max-[760px]:hidden" /> novas formas de aprender.</blockquote></div></section>
      <section className="mx-auto flex min-h-[232px] w-[calc(100%-3rem)] max-w-[1020px] items-center justify-between max-[760px]:block max-[760px]:min-h-0 max-[760px]:py-[50px]" id="monitor"><h2 className="m-0 font-serif text-[39px] font-normal leading-[0.95] tracking-[-1.5px] max-[760px]:mb-8 max-[760px]:text-[35px]">Comece por uma<br /><em className="text-[#769c8d]">boa pergunta.</em></h2><a className={`${buttonBase} bg-[#315c50] text-white max-[760px]:mt-[22px]`} href="#encontrar">Explorar horários <span aria-hidden="true">→</span></a></section>
      <Footer />
    </main>
  )
}
