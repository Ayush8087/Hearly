"use client"
import { MusicContext } from "@/hooks/use-context";
import { useContext, useEffect, useState } from "react";
import Player from "./cards/player";

export default function MusicProvider({ children }) {
    const [music, setMusic] = useState(null);
    const [current, setCurrent] = useState(null);

    useEffect(() => {
        if (localStorage.getItem("last-played")) {
            setMusic(localStorage.getItem("last-played"));
        }
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            if (ctx.state === 'suspended') {
                const resume = () => {
                    ctx.resume();
                    document.removeEventListener('visibilitychange', resume);
                    document.removeEventListener('click', resume);
                };
                document.addEventListener('visibilitychange', resume);
                document.addEventListener('click', resume, { once: true });
            }
        } catch {}
    }, []);

    return (
        <MusicContext.Provider value={{ music, setMusic, current, setCurrent }}>
            {children}
        </MusicContext.Provider>
    )
}
export const useMusic = () => useContext(MusicContext);