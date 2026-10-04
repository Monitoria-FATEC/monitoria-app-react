export default function Button({ children, variant = "default", value, onClick, className = "" }) {
    const baseStyle = "p-2 px-4 font-bold text-sm rounded-xl transition-all cursor-pointer";

    const variants = {
        default: "bg-white text-black border border-gray-200 hover:border-gray-400",
        aprovar: "bg-[#2F5146] text-white border border-transparent hover:text-[#2F5146] hover:bg-white hover:border-[#2F5146]",
        reprovar: "bg-white border border-red-200 text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white",
        // outline: "border border-gray-300 text-gray-700 hover:bg-gray-100"
    };

    return (
        <button
            type="button"
            value={value}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}