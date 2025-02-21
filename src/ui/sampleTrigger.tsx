import { useState, useEffect } from 'react';
import { api } from '~/trpc/react';

interface Sample {
    id: string;
    filename: string;
    type: 'BEAT' | 'FX' | 'RADIO';
    path: string;
}

export const useSampleTrigger = () => {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [samples, setSamples] = useState<Sample[]>([]);

    // Initialize audio context
    useEffect(() => {
        const ctx = new AudioContext();
        setAudioContext(ctx);
        return () => {
            void ctx.close();
        };
    }, []);

    // Fetch samples from DB
    useEffect(() => {
        const fetchSamples = async () => {
            const samplesData = await api.samples.getAll.query();
            setSamples(samplesData);
        };
        void fetchSamples();
    }, []);

    const playAudioBuffer = async (audioBuffer: AudioBuffer) => {
        if (!audioContext) return;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    };

    const loadAndPlaySample = async (filepath: string) => {
        try {
            const response = await fetch(filepath);
            const arrayBuffer = await response.arrayBuffer();
            if (!audioContext) return;
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            await playAudioBuffer(audioBuffer);
        } catch (error) {
            console.error('Error loading sample:', error);
        }
    };

    const playRandomBeat = async () => {
        const beatSamples = samples.filter(sample => sample.type === 'BEAT');
        if (beatSamples.length === 0) return;
        const randomBeat = beatSamples[Math.floor(Math.random() * beatSamples.length)];
        if (randomBeat) {
            await loadAndPlaySample(randomBeat.path);
        }
    };

    const playRandomFX = async () => {
        const fxSamples = samples.filter(sample => sample.type === 'FX');
        if (fxSamples.length === 0) return;
        const randomFX = fxSamples[Math.floor(Math.random() * fxSamples.length)];
        if (randomFX) {
            await loadAndPlaySample(randomFX.path);
        }
    };

    const playRandomRadio = async () => {
        const radioSamples = samples.filter(sample => sample.type === 'RADIO');
        if (radioSamples.length === 0) return;
        const randomRadio = radioSamples[Math.floor(Math.random() * radioSamples.length)];
        if (randomRadio) {
            await loadAndPlaySample(randomRadio.path);
        }
    };

    return {
        playRandomBeat,
        playRandomFX,
        playRandomRadio,
    };
};
