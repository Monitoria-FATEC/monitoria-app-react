import { useState } from "react";
import SupervisorCard from "../../components/supervisor/SupervisorCard";
import SupervisorModalCard from "../../components/supervisor/SupervisorModalCard";

export default function SupervisorAprovar() {

    const statusData = [
        { id: "aguardando", title: "Aguardando" },
        { id: "encaminhado", title: "Encaminhados" },
        { id: "aprovado", title: "Aprovados" },
        { id: "reprovado", title: "Reprovados" }
    ]

    const [isActive, setIsActive] = useState("aguardando")
    const [selectedRa, setSelectedRa] = useState(null)

    const [forms, setForms] = useState([
        {
            "name": "Lucas Tavares",
            "ra": "222222",
            "course": "Análise e Desenvolvimento de Sistemas",
            "discipline": "Estrutura de Dados",
            "period": "4º semestre",
            "email": "lucas.tavares2@fatec.sp.gov.br",
            "date": "28/09/2026",
            "status": "aguardando",
            "signatureDate": "28/09/2026 às 19:41",
            "termId": "#6abc19b7"
        },
        {
            "name": "Lucas Tavares",
            "ra": "1223344",
            "course": "Análise e Desenvolvimento de Sistemas",
            "discipline": "Estrutura de Dados",
            "period": "4º semestre",
            "email": "lucas.tavares@fatec.sp.gov.br",
            "date": "28/09/2026",
            "status": "aguardando",
            "signatureDate": "28/09/2026 às 19:41",
            "termId": "#6abc19b7"
        },
        {
            "name": "Lucas Tavares",
            "ra": "3333333",
            "course": "Análise e Desenvolvimento de Sistemas",
            "discipline": "Estrutura de Dados",
            "period": "4º semestre",
            "email": "lucas.tavares3@fatec.sp.gov.br",
            "date": "28/09/2026",
            "status": "aguardando",
            "signatureDate": "28/09/2026 às 19:41",
            "termId": "#6abc19b7"
        },
        {
            "name": "Marina Alves",
            "ra": "1198765",
            "course": "Gestão Empresarial",
            "discipline": "Contabilidade Geral",
            "period": "2º semestre",
            "email": "marina.alves@fatec.sp.gov.br",
            "date": "29/09/2026",
            "status": "reprovado",
            "signatureDate": "29/09/2026 às 10:20",
            "termId": "#7xyz89c2"
        },
        {
            "name": "Pedro Henrique Lima",
            "ra": "1204455",
            "course": "Comércio Exterior",
            "discipline": "Logística Internacional",
            "period": "6º semestre",
            "email": "pedro.lima@fatec.sp.gov.br",
            "date": "30/09/2026",
            "status": "aprovado",
            "signatureDate": "30/09/2026 às 14:35",
            "termId": "#9qwe45d1"
        }
    ])

    const handleStatusChange = (event, ra) => {
        const status = event.currentTarget.value

        setForms((currentForms) => currentForms.map((form) => (
            form.ra === ra ? { ...form, status } : form
        )))
        setSelectedRa(null)
    }

    //filtra os forms para cada tab
    const filteredForms = forms.filter((form) => form.status === isActive);
    //numero de forms pendentes
    const statusAguardando = forms.filter((form) => form.status === "aguardando")
    const qntdAguardando = statusAguardando.length

    const modalForm = forms.find((form) => form.ra === selectedRa)

    return (
        <div>
            <div className="w-full flex items-center gap-4 border-b border-gray-200 px-6  ">
                {statusData.map((tab) => ( 
                    <button
                        key={tab.id}
                        className={`group relative cursor-pointer py-3 border-b px-1 hover:text-black transition ${isActive === tab.id ? "border-black text-black" : "border-transparent text-[#939E95]"}`}
                        onClick={() => setIsActive(tab.id)}
                    >
                        {tab.title}
                        {tab.id === "aguardando" && (
                            <div className={`flex items-center justify-center absolute top-0 -right-2 bg-amber-700 text-white text-xs w-5 h-5 rounded-full group-hover:opacity-100 ${isActive === "aguardando" ? "opacity-100" : "opacity-40"}`}>
                                {qntdAguardando}
                            </div>
                        )}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
                {filteredForms.length > 0 ? (
                    filteredForms.map((form) => (
                        <SupervisorCard
                            key={form.ra}
                            form={form}
                            onClick={() => setSelectedRa(form.ra)}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500">
                        Nenhuma ficha encontrada.
                    </div>
                )}
            </div>

            <div 
                onClick={(event) => {
                    if (event.target === event.currentTarget) setSelectedRa(null)
                }} 
                className={`fixed inset-0 z-40 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-all ${modalForm ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div className={`${modalForm ? "translate-x-0" : "translate-x-full"} transition-all h-full p-2 w-[800px]`}>
                    <SupervisorModalCard
                    form={modalForm}
                    onStatusChange={handleStatusChange}
                    onClose={() => setSelectedRa(null)}
                />
                </div>
            </div>
        </div>
    );
}   