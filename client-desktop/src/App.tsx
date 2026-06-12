import {listen} from '@tauri-apps/api/event';
import {useEffect} from 'react';


function App() {
  
  useEffect(()=>{
    const unlistenMapLoad = listen('open-load-map-modal',(event) =>{
      console.log("Signal Recives to Load Map", event);
      alert("Map Modal Triggered!");
    });

    return () => {
      unlistenMapLoad.then((f)=>f());
    }
  },[]);

  return (
    <div className="bg-canvas-panel text-ui-text h-screen w-screen overflow-hidden">
      <h1>Hello World!</h1>
    </div>
    
  );
}

export default App;
