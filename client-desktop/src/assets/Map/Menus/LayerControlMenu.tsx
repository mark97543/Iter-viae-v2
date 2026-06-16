
function LayerControlMenu(){

    return (

        <div className='absolute inset-y-0 right-4 z-50 flex flex-col justify-center pointer-events-none'>
            
            <div className='bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-2 rounded-2xl shadow-2xl flex flex-col gap-2 pointer-events-auto'>

                {/* Button 1 */}
                <button className='cursor-pointer p-3 bg-neutral-900 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors'>
                    <img src="/pin.png" className='h-5 w-5' alt="Pin" />
                </button>

                {/* Divider Line */}
                {/* <div className='w-full h-px bg-neutral-800 my-1' /> */}

                {/* Button 2 */}
                {/* <button className='p-3 bg-transparent rounded-xl border border-transparent hover:bg-neutral-800 hover:border-neutral-700 transition-colors'>
                    <img src="/layers.svg" className='h-5 w-5 opacity-50 hover:opacity-100' alt="Layers" />
                </button> */}

            </div>
        </div>
    )
    }

export default LayerControlMenu;

