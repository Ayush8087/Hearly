"use client"

import AlbumCard from "@/components/cards/album";
import Next from "@/components/cards/next";
import SongCard from "@/components/cards/song";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { NextContext } from "@/hooks/use-context";
import { getSongsSuggestions } from "@/lib/fetch";
import { useContext, useEffect, useState } from "react";

export default function Recomandation({ id }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const next = useContext(NextContext);

    const getData = async () => {
        try {
            const api = `/api/recommendations?songId=${id}`;
            const res = await fetch(api);
            if (!res.ok) throw new Error('rec_error');
            const { recommendations } = await res.json();
            const ids = Array.isArray(recommendations) ? recommendations : [];
            if (!ids.length) {
                setData(false);
                setLoading(false);
                return;
            }
            // hydrate minimal display data from suggestions endpoint for UI
            const base = await getSongsSuggestions(id).then(r => r.json()).catch(() => ({ data: [] }));
            const map = new Map((Array.isArray(base?.data) ? base.data : []).map(c => [c.id, c]));
            const results = ids.map(rid => map.get(rid)).filter(Boolean);
            setData(results.length ? results : false);
            if (results.length) {
                const d = results[0];
                next.setNextData({
                    id: d.id,
                    name: d.name,
                    artist: d?.artists?.primary?.[0]?.name || "unknown",
                    album: d?.album?.name,
                    image: d?.image?.[2]?.url || d?.image?.[1]?.url || d?.image?.[0]?.url || ""
                });
            }
        } catch {
            setData(false);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        getData();
    }, [id])
    return (
        <section className="py-10 px-6 md:px-20 lg:px-32">
            <div>
                <h1 className="text-base font-medium">Recomandation</h1>
                <p className="text-xs text-muted-foreground">You might like this</p>
            </div>
            <div className="rounded-md mt-6">
                {!loading && data && (
                    <div className="grid sm:grid-cols-2 gap-3 overflow-hidden">
                        {data.map((song) => (
                            <Next
                                next={false}
                                key={song.id}
                                image={song?.image?.[2]?.url || song?.image?.[1]?.url || song?.image?.[0]?.url || ""}
                                name={song.name}
                                artist={song?.artists?.primary?.[0]?.name || "unknown"}
                                id={song.id}
                            />
                        ))}
                    </div>
                )}
                {loading && (
                    <div className="grid gap-3">
                        <div className="grid gap-2">
                            <Skeleton className="h-14 w-full" />
                        </div>
                        <div className="grid gap-2">
                            <Skeleton className="h-14 w-full" />
                        </div>
                        <div className="grid gap-2">
                            <Skeleton className="h-14 w-full" />
                        </div>
                        <div className="grid gap-2">
                            <Skeleton className="h-14 w-full" />
                        </div>
                    </div>
                )}
            </div>
            {!loading && !data && (
                <div className="flex items-center justify-center text-center h-[100px]">
                    <p className="text-sm text-muted-foreground">No recomandation for this song.</p>
                </div>
            )}
        </section>
    )
}