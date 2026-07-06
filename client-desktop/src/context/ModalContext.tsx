// src/context/ModalContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";
import errorData from "../assets/Json/error.json";
import { GlobalModal } from "../components/modals/GlobalModal";

interface ModalConfig {
    title: string;
    message: string;
    type: 'alert' | 'prompt';
}

interface ModalState extends ModalConfig {
    isOpen: boolean;
    onConfirm: (value?: string) => void;
    onCancel: () => void;
}

const ModalContext = createContext<any>(null);

export function ModalProvider({ children }: { children: ReactNode }) {

    const [modal, setModal] = useState<ModalState | null>(null);

    const openModal = (errorCode: string) => {
        const config = (errorData as any)[errorCode];

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