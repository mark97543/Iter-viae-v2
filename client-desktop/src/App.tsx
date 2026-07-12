import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import LoadMapModal from './components/modals/LoadMapModal';
import TacticalMap from './components/map/TacticalMap';
import { TripProvider } from './context/TripContext';
import { ModalProvider } from './context/ModalContext';
import ShortcutMenu from './components/menus/ShortcutMenu';
import LoadTripModal from './components/modals/LoadTripModal';
import { LayoutProvider } from './context/LayoutContext';




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
          <LayoutProvider>
            <TacticalMap />
            {loadMapModalOpen && <LoadMapModal onClose={closeMapModal} />}
            <ShortcutMenu />
            < LoadTripModal />
          </LayoutProvider>
        </TripProvider>
      </ModalProvider>
    </div>

  );
}

export default App;
