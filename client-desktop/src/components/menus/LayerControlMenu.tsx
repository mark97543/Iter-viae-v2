import pinIcon from '../../assets/icons/pin.png';
import gasIcon from '../../assets/icons/gas.png';
import itinIcon from '../../assets/icons/itin.png';
import { useState, useEffect } from 'react'
import ItinSheet from './LayerControlMenuFiles/ItinSheet';
import { useLayout } from '../../context/LayoutContext';

interface LayerControlProps {
    layerVisibility: Record<string, boolean>;
    toggleLayer: (layerId: string) => void;
}

function LayerControlMenu({ layerVisibility, toggleLayer }: LayerControlProps) {
    const [button1, setButton1] = useState(false)
    const { setIsLeftBarOpen, summaryBar, setSummaryBar } = useLayout();

    const handleButton1Click = () => {
        setButton1(!button1);
        if (!button1) setSummaryBar(false);
    };

    const handleButton2Click = () => {
        setSummaryBar(!summaryBar);
        if (!summaryBar) setButton1(false);
        setIsLeftBarOpen(false);
    };

    return (

        <div className='absolute inset-y-0 right-4 z-50 flex flex-col justify-center pointer-events-none'>

            <div className='bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-2 rounded-2xl shadow-2xl flex flex-col gap-2 pointer-events-auto'>

                {/* Button 1 */}
                <button
                    className={`
                        cursor-pointer 
                        p-3 
                        rounded-xl border
                        border-red-700 
                        hover:bg-neutral-800 
                        transition-colors
                        ${button1 ? 'bg-neutral-800' : ' bg-tactical-red '}`}
                    onClick={handleButton1Click}
                >
                    <img src={pinIcon} className='h-5 w-5' alt="Pin" />
                </button>

                {/* Divider Line */}
                <div className='w-full h-px bg-neutral-800 my-1' />

                {/* Button 2 */}
                <button className={`
                        cursor-pointer 
                        p-3 
                        rounded-xl border
                        border-red-700 
                        hover:bg-neutral-800 
                        transition-colors
                        ${summaryBar ? 'bg-neutral-800' : ' bg-tactical-red '}`}
                    onClick={handleButton2Click}
                >
                    <img src={itinIcon} className='h-5 w-5' alt="Layers" />
                </button>

                <Button1Window visible={button1} layerVisibility={layerVisibility} toggleLayer={toggleLayer} />
                <ItinSheet visible={summaryBar} />

            </div>
        </div >
    )
}

export default LayerControlMenu;

interface Button1WindowProps {
    visible: boolean;
    layerVisibility: Record<string, boolean>;
    toggleLayer: (layerId: string) => void;
}

function Button1Window({ visible, layerVisibility, toggleLayer }: Button1WindowProps) {

    if (!visible) return null;

    //Check if the fuel layer is curent
    const isFuelVisible = layerVisibility['poi-fuel'];

    return (
        <div
            className='
                absolute
                right-16
                top-0
                w-64
                bg-neutral-950/90
                backdrop-blur-lg
                border
                border-neutral-800
                rounded-2xl
                shadow-2xl
                p-4
                flex
                flex-col
                gap-3
                animate-in
                fade-in
                slide-in-from-right-2
                duration-150
                cursor-pointer'
        >
            <div>
                <div
                    className='
                        flex 
                        items-center 
                        gap-2.5 
                        px-2 
                        py-1.5 
                        rounded-lg 
                        hover:bg-neutral-900/40 
                        transition-colors 
                        group 
                        cursor-pointer'
                    onClick={() => toggleLayer('poi-fuel')}
                >
                    <img
                        src={gasIcon}
                        className='h-4 w-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity'
                        alt="Fuel POI"
                    />
                    <span className='text-xs font-medium font-mono uppercase tracking-wide text-neutral-300 group-hover:text-white transition-colors'>
                        Fuel Station {isFuelVisible ? '(On)' : '(Off)'}
                    </span>
                </div>
            </div>

        </div>
    )
}



