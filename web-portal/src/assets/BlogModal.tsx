interface ModalProps {
  onClose: () => void;
  activePost: any; // Or better, use the 'Post' interface we defined above
}


function BlogModal ({onClose, activePost}: ModalProps) {
    
    if (activePost===null) return null;
    
    return (
        /* 1. Backdrop overlay close target */
        <div 
            onClick={onClose}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer' 
        >
            {/* 2. StopPropagation prevents clicks inside the card from accidentally triggering onClose */}
            <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-neutral-800 bg-neutral-950 p-6 md:p-8 shadow-2xl rounded relative cursor-default"
            >
                {/* 3. Upper Right Operational Close Trigger */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 font-mono text-xs tracking-widest text-neutral-500 hover:text-red-500 transition-colors duration-150 p-1"
                    title="Close Entry [ESC]"
                >
                    [X]
                </button>

                <h1 className='text-2xl text-center text-white font-black tracking-tight mt-2'>{activePost.title}</h1>
                
                <div className='text-center mt-4 p-1 flex flex-row justify-center items-center gap-3'>
                    <span className="text-xs font-mono text-red-500 uppercase tracking-wider leading-none">{activePost.category}</span> 
                    <span className="text-xs font-mono text-neutral-500 leading-none">Logged: {new Date(activePost.date_created).toLocaleDateString()}</span>
                </div>
                            
                <div 
                    className="text-neutral-300 space-y-4 my-6 prose prose-invert max-w-none font-sans leading-relaxed text-left"
                    dangerouslySetInnerHTML={{ __html: activePost.body }} 
                />

                {/* 4. Flex wrapper to force absolute horizontal center alignment */}
                <div className="flex justify-center w-full mt-6">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 border border-neutral-800 bg-red-950/20 hover:bg-red-950/50 font-mono text-xs uppercase tracking-wider text-neutral-400 hover:text-white hover:border-neutral-500 transition-all duration-150 rounded"
                    >
                        Exit Core Entry
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BlogModal;