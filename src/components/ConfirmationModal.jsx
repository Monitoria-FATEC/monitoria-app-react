import Button from "./supervisor/SupervisorButton";

export default function ConformationModal({ titulo, descricao, onCancel, onConfirm}) {
    return(
        <div className="z-50 fixed inset-0 bg-pink-40 w-screen h-screen flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-start justify-between bg-white p-4 rounded-xl max-w-100 w-full h-40">
                <div className="flex flex-col gap-2">
                    <span className="font-bold text-xl">{titulo}</span>
                    <span className="font-medium text-md">{descricao}</span>
                </div>
                <div className="w-full flex justify-around items-center">
                    <Button onClick={onCancel} variant="reprovar">Cancelar</Button>
                    <Button onClick={onConfirm} variant="aprovar">confirmar</Button>
                </div>
            </div>
        </div>
    )
}