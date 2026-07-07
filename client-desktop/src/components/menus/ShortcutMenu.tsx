//src/components/menus/ShortcutMenu.tsx

import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useModal } from "../../context/ModalContext";

function ShortcutMenu() {
    const { openModal } = useModal();

    useEffect(() => {
        const unlisten = listen("open-shortcuts-modal", async () => {
            openModal("SHORTCUTS");
        });
        return () => {
            unlisten.then(f => f());
        };
    }, [openModal]);

    return null;
}

export default ShortcutMenu;