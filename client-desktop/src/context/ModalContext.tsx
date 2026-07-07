// src/context/ModalContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";
import { modalConfig, ModalConfigItem } from "../config/modalConfig";
import { GlobalModal } from "../components/modals/GlobalModal";

interface ModalState extends ModalConfigItem {
    isOpen: boolean;
    onConfirm: (value?: string) => void;
    onCancel: () => void;
}

const ModalContext = createContext<any>(null);

export function ModalProvider({ children }: { children: ReactNode }) {

    const [modal, setModal] = useState<ModalState | null>(null);

    const openModal = (errorCode: string) => {
        const config = modalConfig[errorCode];

        return new Promise((resolve) => {
            setModal({
                ...config,
                isOpen: true,
                onConfirm: (val) => {
                    setModal(null);
                    resolve(val);
                },
                onCancel: () => {
                    setModal(null);
                    resolve(null);
                }
            })
        })

    }

    return (
        <ModalContext.Provider value={{ openModal }}>
            {children}
            {modal && <GlobalModal {...modal} />}
        </ModalContext.Provider>
    )

}

export const useModal = () => useContext(ModalContext);