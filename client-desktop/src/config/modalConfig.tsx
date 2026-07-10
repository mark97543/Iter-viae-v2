// src/config/modalConfig.tsx
import { ReactNode } from 'react';

export interface ModalConfigItem {
    title: string;
    message: ReactNode;
    type: 'alert' | 'prompt' | 'choice' | 'choice3';
}

export const modalConfig: Record<string, ModalConfigItem> = {
    "ERR_NO_TITLE": {
        title: "A trip title is required",
        message: "Please enter a title before saving",
        type: "prompt"
    },
    "NEW_TRIP": {
        title: "Warning Unsaved Progress",
        message: "Would you like to save your current trip?",
        type: "choice"
    },
    "SHORTCUTS": {
        title: "Keyboard Shortcuts",
        message: (
            <div className="flex flex-col gap-2 text-sm mt-2">
                <div className="flex justify-between border-b border-neutral-700 pb-2">
                    <span>Save Trip</span>
                    <kbd className="bg-neutral-800 border border-neutral-600 px-2 rounded text-neutral-300">Ctrl + S</kbd>
                </div>
                <div className="flex justify-between border-b border-neutral-700 pb-2">
                    <span>Exit Application</span>
                    <kbd className="bg-neutral-800 border border-neutral-600 px-2 rounded text-neutral-300">Cmd/Ctrl + Q</kbd>
                </div>
                <div className="flex justify-between border-b border-neutral-700 pb-2">
                    <span>New Trip</span>
                    <kbd className="bg-neutral-800 border border-neutral-600 px-2 rounded text-neutral-300">Cmd/Ctrl + N</kbd>
                </div>
                <div className="flex justify-between border-b border-neutral-700 pb-2">
                    <span>Load Trip</span>
                    <kbd className="bg-neutral-800 border border-neutral-600 px-2 rounded text-neutral-300">Cmd/Ctrl + O</kbd>
                </div>
                <div className="flex justify-between border-b border-neutral-700 pb-2">
                    <span>Import Trip</span>
                    <kbd className="bg-neutral-800 border border-neutral-600 px-2 rounded text-neutral-300">Cmd/Ctrl + I</kbd>
                </div>
                <div className="flex justify-between border-b border-neutral-700 pb-2">
                    <span>Export Trip</span>
                    <kbd className="bg-neutral-800 border border-neutral-600 px-2 rounded text-neutral-300">Cmd/Ctrl + E</kbd>
                </div>
            </div>
        ),
        type: "alert"
    },
    "SAVE_PROGRESS": {
        title: "Save Progress",
        message: "Would you like to save your current trip before you continue? Selecting no you will lose all unsaved data",
        type: "choice3"
    }
};
