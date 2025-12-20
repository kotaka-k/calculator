import { useCallback } from 'react';

export const useSpeech = () => {
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;

        // Cancel previous utterance
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9; // Slightly slower for kids
        utterance.pitch = 1.1; // Slightly higher

        window.speechSynthesis.speak(utterance);
    }, []);

    return { speak };
};
