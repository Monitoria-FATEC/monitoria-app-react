export default function SupervisorHeader({titulo}) {
    return(
        <header className="flex w-full justify-between items-center p-6 shadow-2xs bg-[#E9F0E5]">
            <h1 className="text-[#2E4039] font-bold text-3xl mb-2.5">{titulo}</h1>
            <div className="flex items-center gap-8">
                <div className="">
                    <img src="/" alt="" />
                </div>
                <button className="h-10 w-10 rounded-full overflow-hidden  border-none outline-none">
                    <img className="w-full h-full bg-gray-100 " src="/" alt="" />
                </button>
            </div>
        </header>
    )
}