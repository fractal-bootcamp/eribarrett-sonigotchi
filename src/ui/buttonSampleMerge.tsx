"use client";

import { useCallback, useState, useEffect, useRef } from 'react';

// ======= Sample Trigger Hook =======

// Define base paths for different sample types
const BEATS_PATH = '/Users/ijane/Documents/coding/fractal/genUIhack/sonigotchi/src/assets/loop/beats';
const RADIOS_PATH = '/Users/ijane/Documents/coding/fractal/genUIhack/sonigotchi/src/assets/loop/radio';
const FX_PATH = '/Users/ijane/Documents/coding/fractal/genUIhack/sonigotchi/src/assets/loop/FX';

// Helper function to get all files from a directory
const getFilesFromDirectory = async (dirPath: string): Promise<string[]> => {
    try {
        const response = await fetch(dirPath);
        if (!response.ok) {
            console.warn(`Failed to fetch directory ${dirPath} with status ${response.status}`);
            return [];
        }
        const files = await response.json();
        // Filter for audio files (mp3 and wav)
        return files.filter((file: string) =>
            file.endsWith('.mp3') || file.endsWith('.wav')
        );
    } catch (error) {
        console.warn(`Error accessing directory ${dirPath}:`, error);
        return [];
    }
};

// Audio context and buffer management
const audioContext = new AudioContext();
const audioBuffers = new Map<string, AudioBuffer>();
const activeNodes = new Map<string, AudioBufferSourceNode>();

// Helper to load and cache audio buffer
const loadAudioBuffer = async (url: string): Promise<AudioBuffer> => {
    if (audioBuffers.has(url)) {
        return audioBuffers.get(url)!;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBuffers.set(url, audioBuffer);
    return audioBuffer;
};

// Helper to play an audio sample with looping
const playAudioLoop = async (url: string, shouldLoop = false) => {
    try {
        // Stop any existing playback of this sample
        if (activeNodes.has(url)) {
            activeNodes.get(url)?.stop();
            activeNodes.delete(url);
        }

        const buffer = await loadAudioBuffer(url);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = shouldLoop;
        source.connect(audioContext.destination);
        source.start();

        if (shouldLoop) {
            activeNodes.set(url, source);
        }

        return new Promise<void>((resolve) => {
            source.onended = () => {
                if (!shouldLoop) {
                    resolve();
                }
            };
        });
    } catch (error) {
        console.warn(`Error playing audio from ${url}:`, error);
    }
};

// Hook for managing looping samples
const useLoopingSamples = () => {
    const startLooping = async () => {
        const loadAndPlayDirectory = async (dirPath: string) => {
            const files = await getFilesFromDirectory(dirPath);
            for (const file of files) {
                const fileUrl = new URL(file, dirPath).toString();
                await playAudioLoop(fileUrl, true);
            }
        };

        await Promise.all([
            loadAndPlayDirectory(BEATS_PATH),
            loadAndPlayDirectory(RADIOS_PATH),
            loadAndPlayDirectory(FX_PATH)
        ]);
    };

    const stopLooping = () => {
        activeNodes.forEach((node) => {
            node.stop();
        });
        activeNodes.clear();
    };

    return { startLooping, stopLooping };
};

// Hook for triggering one-shot samples
export const useSampleTrigger = () => {
    const playRandomSample = useCallback(async (dirPath: string) => {
        const files = await getFilesFromDirectory(dirPath);
        if (files.length === 0) return;

        const randomFile = files[Math.floor(Math.random() * files.length)];
        if (!randomFile) return;

        const fileUrl = new URL(randomFile, dirPath).toString();
        await playAudioLoop(fileUrl, false);
    }, []);

    const playRandomBeat = useCallback(() => playRandomSample(BEATS_PATH), [playRandomSample]);
    const playRandomRadio = useCallback(() => playRandomSample(RADIOS_PATH), [playRandomSample]);
    const playRandomFX = useCallback(() => playRandomSample(FX_PATH), [playRandomSample]);

    return { playRandomBeat, playRandomRadio, playRandomFX };
};

// ======= UI Components =======

interface EmojiGridProps {
    emojis: string[];
}

export const EmojiGrid = ({ emojis }: EmojiGridProps) => {
    // Calculate emoji size based on count—smaller as more are added
    const emojiSize = Math.max(16, 48 - Math.floor(emojis.length / 5) * 4);

    return (
        <div className="grid grid-cols-9 gap-2 p-4 border rounded-lg h-[400px] overflow-y-auto">
            {emojis.map((emoji, index) => (
                <span
                    key={index}
                    style={{ fontSize: `${emojiSize}px` }}
                    className="flex items-center justify-center"
                >
                    {emoji}
                </span>
            ))}
        </div>
    );
};

interface SoundButtonProps {
    onEmojiAdd?: (emoji: string) => void;
}

export const BeatButton = ({ onEmojiAdd = () => { } }: SoundButtonProps) => {
    const { playRandomBeat } = useSampleTrigger();
    const { startLooping, stopLooping } = useLoopingSamples();

    const handleTrigger = async () => {
        onEmojiAdd('🥁');
        try {
            await playRandomBeat();
        } catch (error) {
            console.error('Error playing beat:', error);
        }
    };

    useEffect(() => {
        void startLooping();
        return () => stopLooping();
    }, []);

    return (
        <button
            onClick={handleTrigger}
            className="px-6 py-3 text-2xl bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
        >
            🥁
        </button>
    );
};

export const RadioButton = ({ onEmojiAdd = () => { } }: SoundButtonProps) => {
    const { playRandomRadio } = useSampleTrigger();

    const handleTrigger = async () => {
        onEmojiAdd('📻');
        try {
            await playRandomRadio();
        } catch (error) {
            console.error('Error playing radio:', error);
        }
    };

    return (
        <button
            onClick={handleTrigger}
            className="px-6 py-3 text-2xl bg-green-500 rounded-full hover:bg-green-600 transition-colors"
        >
            📻
        </button>
    );
};

export const FXButton = ({ onEmojiAdd = () => { } }: SoundButtonProps) => {
    const { playRandomFX } = useSampleTrigger();

    const handleTrigger = async () => {
        onEmojiAdd('🎛️');
        try {
            await playRandomFX();
        } catch (error) {
            console.error('Error playing FX:', error);
        }
    };

    return (
        <button
            onClick={handleTrigger}
            className="px-6 py-3 text-2xl bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
        >
            🎛️
        </button>
    );
};

export const ClearButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="px-6 py-3 text-2xl bg-red-500 rounded-full hover:bg-red-600 transition-colors"
        >
            🗑️
        </button>
    );
};

export const DiceButton = ({
    emojis,
    setEmojis,
}: {
    emojis: string[];
    setEmojis: (emojis: string[]) => void;
}) => {
    const { playRandomBeat, playRandomRadio, playRandomFX } = useSampleTrigger();

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleRetrigger = async () => {
        try {
            const shuffledEmojis = shuffleArray(emojis);
            setEmojis(shuffledEmojis);

            for (const emoji of shuffledEmojis) {
                switch (emoji) {
                    case '🥁':
                        await playRandomBeat();
                        break;
                    case '📻':
                        await playRandomRadio();
                        break;
                    case '🎛️':
                        await playRandomFX();
                        break;
                }
            }
        } catch (error) {
            console.error('Error retriggering samples:', error);
        }
    };

    return (
        <button
            onClick={handleRetrigger}
            className="px-6 py-3 text-2xl bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
            disabled={emojis.length === 0}
        >
            🎲
        </button>
    );
};

export const DeleteLastButton = ({
    emojis,
    setEmojis,
}: {
    emojis: string[];
    setEmojis: (emojis: string[]) => void;
}) => {
    const handleDelete = () => {
        setEmojis(prev => prev.slice(0, -1));
    };

    return (
        <button
            onClick={handleDelete}
            className="px-6 py-3 text-2xl bg-gray-500 rounded-full hover:bg-gray-600 transition-colors"
            disabled={emojis.length === 0}
        >
            ❌
        </button>
    );
};

export const AddRandomButton = ({
    emojis,
    setEmojis,
}: {
    emojis: string[];
    setEmojis: (emojis: string[]) => void;
}) => {
    const availableEmojis = ['🥁', '📻', '🎛️'];

    const handleAddRandom = () => {
        const randomIndex = Math.floor(Math.random() * availableEmojis.length);
        setEmojis(prev => [...prev, availableEmojis[randomIndex]]);
    };

    return (
        <button
            onClick={handleAddRandom}
            className="px-6 py-3 text-2xl bg-indigo-500 rounded-full hover:bg-indigo-600 transition-colors"
        >
            ➕
        </button>
    );
};

export const SpiralButton = ({
    emojis,
    setEmojis,
}: {
    emojis: string[];
    setEmojis: (emojis: string[]) => void;
}) => {
    const { playRandomBeat, playRandomRadio, playRandomFX } = useSampleTrigger();
    const availableEmojis = ['🥁', '📻', '🎛️'];

    const handleSpiralTrigger = async () => {
        try {
            const remainingSlots = 30 - emojis.length;
            if (remainingSlots <= 0) return;

            const newEmojis: string[] = [];
            for (let i = 0; i < remainingSlots; i++) {
                const randomIndex = Math.floor(Math.random() * availableEmojis.length);
                newEmojis.push(availableEmojis[randomIndex]);
            }

            const allEmojis = [...emojis, ...newEmojis];
            setEmojis(allEmojis);

            for (const emoji of newEmojis) {
                switch (emoji) {
                    case '🥁':
                        await playRandomBeat();
                        break;
                    case '📻':
                        await playRandomRadio();
                        break;
                    case '🎛️':
                        await playRandomFX();
                        break;
                }
            }
        } catch (error) {
            console.error('Error in spiral trigger:', error);
        }
    };

    return (
        <button
            onClick={handleSpiralTrigger}
            className="px-6 py-3 text-2xl bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
            disabled={emojis.length >= 30}
        >
            🌀
        </button>
    );
};

export const SoundButtons = () => {
    const [emojis, setEmojis] = useState<string[]>([]);

    const handleAddEmoji = (emoji: string) => {
        setEmojis(prev => [...prev, emoji]);
    };

    const handleClear = () => {
        setEmojis([]);
    };

    return (
        <div className="flex gap-8 p-4">
            <div className="flex-1 flex items-center justify-center">
                <EmojiGrid emojis={emojis} />
            </div>
            <div className="flex flex-col gap-4">
                <BeatButton onEmojiAdd={handleAddEmoji} />
                <RadioButton onEmojiAdd={handleAddEmoji} />
                <FXButton onEmojiAdd={handleAddEmoji} />
                <DiceButton emojis={emojis} setEmojis={setEmojis} />
                <DeleteLastButton emojis={emojis} setEmojis={setEmojis} />
                <AddRandomButton emojis={emojis} setEmojis={setEmojis} />
                <SpiralButton emojis={emojis} setEmojis={setEmojis} />
                <ClearButton onClick={handleClear} />
            </div>
        </div>
    );
};