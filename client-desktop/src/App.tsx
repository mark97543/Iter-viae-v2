import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import LoadMapModal from './components/modals/LoadMapModal';
import TacticalMap from './components/map/TacticalMap';
import { TripProvider } from './context/TripContext';
import { ModalProvider } from './context/ModalContext';


function App() {

  const [loadMapModalOpen, setLoadMapModalOpen] = useState(false);

  const closeMapModal = () => {
    setLoadMapModalOpen(false);
  }

  useEffect(() => {
    const unlistenMapLoad = listen('open-load-map-modal', () => {
      setLoadMapModalOpen(true);
    });

    return () => {
      unlistenMapLoad.then((f) => f());
    }
  }, []);

  return (
    <div className="bg-canvas-panel text-ui-text h-screen w-screen overflow-hidden">
      <ModalProvider>
        <TripProvider>
          <TacticalMap />
          {loadMapModalOpen && <LoadMapModal onClose={closeMapModal} />}
        </TripProvider>
      </ModalProvider>
    </div>

  );
}

export default App;
