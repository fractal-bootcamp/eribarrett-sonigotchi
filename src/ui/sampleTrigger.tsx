import { useCallback } from 'react';

// Define base paths for different sample types
const BEATS_PATH = '/sonic-garbage/wavs/processed/loop/beats';
const RADIOS_PATH = '/sonic-garbage/wavs/processed/loop/radio';
const FX_PATH = '/sonic-garbage/wavs/processed/loop/FX';

// Helper function to get a random file from a directory
const getRandomFile = async (dirPath: string) => {
    try {
        const response = await fetch(dirPath);
        if (!response.ok) throw new Error('Failed to fetch directory contents');
        const files = await response.json();
        const audioFiles = files.filter((file: string) =>
            file.endsWith('.mp3') || file.endsWith('.wav')
        );
        const randomIndex = Math.floor(Math.random() * audioFiles.length);
        return new URL(audioFiles[randomIndex], dirPath).toString();
    } catch (error) {
        console.error(`Error accessing directory ${dirPath}:`, error);
        return null;
    }
};

// Helper to play an audio sample, returning a promise that resolves when playback ends
const playAudio = (url: string) => {
    return new Promise<void>((resolve, reject) => {
        const audio = new Audio(url);
        audio.addEventListener('ended', () => resolve());
        audio.addEventListener('error', (e) => reject(e));
        void audio.play();
    });
};

export const useSampleTrigger = () => {
    const playRandomBeat = useCallback(async () => {
        const sample = await getRandomFile(BEATS_PATH);
        if (sample) await playAudio(sample);
    }, []);

    const playRandomRadio = useCallback(async () => {
        const sample = await getRandomFile(RADIOS_PATH);
        if (sample) await playAudio(sample);
    }, []);

    const playRandomFX = useCallback(async () => {
        const sample = await getRandomFile(FX_PATH);
        if (sample) await playAudio(sample);
    }, []);

    return {
        playRandomBeat,
        playRandomRadio,
        playRandomFX,
    };
};