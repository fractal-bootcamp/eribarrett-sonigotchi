"use client";

import { useState } from 'react';
import { useSampleTrigger } from './sampleTrigger';

interface EmojiGridProps {
    emojis: string[];
}

export const EmojiGrid = ({ emojis }: EmojiGridProps) => {
    // Calculate emoji size based on count - smaller as more are added
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

    const handleTrigger = async () => {
        onEmojiAdd('🥁');
        try {
            await playRandomBeat();
        } catch (error) {
            console.error('Error playing beat:', error);
        }
    };

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

export const DiceButton = ({ emojis, setEmojis }: { emojis: string[], setEmojis: (emojis: string[]) => void }) => {
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
            // Shuffle the emojis
            const shuffledEmojis = shuffleArray(emojis);
            setEmojis(shuffledEmojis);

            // Play sounds for each emoji in the new order
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

export const DeleteLastButton = ({ emojis, setEmojis }: { emojis: string[], setEmojis: (emojis: string[]) => void }) => {
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

export const AddRandomButton = ({ emojis, setEmojis }: { emojis: string[], setEmojis: (emojis: string[]) => void }) => {
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
                <ClearButton onClick={handleClear} />
            </div>
        </div>
    );
};
