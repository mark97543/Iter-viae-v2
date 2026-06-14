import {listen} from '@tauri-apps/api/event';
import {useEffect, useState} from 'react';
import LoadMapModal from './assets/LoadMapModal.tsx';
import TacticalMap from './assets/Map/TacticalMap.tsx'



function App() {
  
  const [loadMapModalOpen, setLoadMapModalOpen] = useState(false);

  const closeMapModal =()=>{
    setLoadMapModalOpen(false);
  }

  useEffect(()=>{
    const unlistenMapLoad = listen('open-load-map-modal',() =>{
      setLoadMapModalOpen(true);
    });

    return () => {
      unlistenMapLoad.then((f)=>f());
    }
  },[]);

  return (
    <div className="bg-canvas-panel text-ui-text h-screen w-screen overflow-hidden">
      <TacticalMap/>
      {loadMapModalOpen && <LoadMapModal onClose={closeMapModal}/>}
    </div>
    
  );
}

export default App;
