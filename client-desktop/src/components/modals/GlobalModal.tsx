// src/components/modals/GlobalModal.tsx
import { useState, ReactNode } from 'react';

interface GlobalModalProps {
    title: string;
    message: ReactNode;
    type: 'alert' | 'prompt' | 'choice' | 'choice3';
    onConfirm: (value?: string) => void;
    onCancel: () => void;
}

export function GlobalModal({ title, message, type, onConfirm, onCancel }: GlobalModalProps) {
    const [inputValue, setInputValue] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-96 bg-neutral-900 border border-neutral-700 p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
                <div className="text-neutral-400 mb-6">{message}</div>

                {type === 'prompt' && (
                    <input
                        autoFocus
                        className="w-full bg-neutral-800 border border-neutral-600 text-white p-2 mb-6 rounded"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter trip title..."
                    />
                )}

                <div className="flex justify-end gap-3">
                    {type === 'choice3' && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-neutral-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    )}
                    {type !== 'alert' && (
                        <button
                            onClick={() => (type === 'choice' || type === 'choice3') ? onConfirm('no') : onCancel()}
                            className="px-4 py-2 text-neutral-400 hover:text-white"
                        >
                            {(type === 'choice' || type === 'choice3') ? 'No' : 'Cancel'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (type === 'choice' || type === 'choice3') return onConfirm('yes');
                            if (type === 'prompt') return onConfirm(inputValue);
                            onConfirm(undefined); // works for 'alert'
                        }}
                        className="bg-red-900 text-white px-4 py-2 rounded hover:bg-red-800"
                    >
                        {(type === 'choice' || type === 'choice3') ? 'Yes' : type === 'alert' ? 'OK' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}