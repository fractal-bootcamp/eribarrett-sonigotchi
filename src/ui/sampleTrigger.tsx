export const useSampleTrigger = () => {
    // Dummy implementations – replace with actual logic later
    const playRandomBeat = async () => {
        console.log("Playing random beat");
        // Beat-playing logic will go here
    };

    const playRandomRadio = async () => {
        console.log("Playing random radio");
        // Radio-playing logic will go here
    };

    const playRandomFX = async () => {
        console.log("Playing random FX");
        // FX-playing logic will go here
    };

    return {
        playRandomBeat,
        playRandomRadio,
        playRandomFX,
    };
};
