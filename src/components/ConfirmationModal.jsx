import Button from "./supervisor/SupervisorButton";

export default function ConformationModal({ titulo, descricao, onCancel, onConfirm, open }) {
	return (
		<div className={`fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/30 transition-all duration-200 ease-in-out ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
			<div
				className={`h-40 w-full max-w-100 transform rounded-xl bg-white p-4 transition-all duration-200 ease-in-out ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
				<div className="flex h-full flex-col items-start justify-between">
					<div className="flex flex-col gap-2">
						<span className="text-xl font-bold">{titulo}</span>
						<span className="text-md font-medium">{descricao}</span>
					</div>
					<div className="flex w-full items-center justify-around">
						<Button onClick={onCancel} variant="reprovar">Cancelar</Button>
						<Button onClick={onConfirm} variant="aprovar">confirmar</Button>
					</div>
				</div>
			</div>
		</div>
	)
}