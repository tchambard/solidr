
export default ({ text, children }: { text: string; children: React.ReactNode }) => {
    return (
        <div className="relative inline-block text-left group">
            {children}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-no-wrap invisible group-hover:visible">
                {text}
            </div>
        </div>
    );
};