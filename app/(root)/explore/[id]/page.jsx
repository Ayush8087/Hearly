"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { getSongsById } from "@/lib/fetch";

export default function PublicPlaylistDetail() {
  const params = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/public/playlists/${params.id}`);
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setPlaylist(data);
    if (Array.isArray(data.songs) && data.songs.length) {
      const items = await Promise.all(
        data.songs.slice(0, 50).map(async (s) => { // cap client hydration to 50 to avoid N+1 spikes
          try {
            const r = await getSongsById(s.songId);
            const j = await r.json();
            const d = j?.data?.[0];
            return d ? {
              id: d.id,
              name: d.name,
              artist: d?.artists?.primary?.[0]?.name || "unknown",
              image: d?.image?.[1]?.url || d?.image?.[0]?.url || "",
            } : { id: s.songId };
          } catch { return { id: s.songId }; }
        })
      );
      setSongs(items);
    } else {
      setSongs([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [params.id]);

  if (loading) return <div className="px-6 py-10">Loading…</div>;
  if (!playlist) return <div className="px-6 py-10">Not found</div>;

  return (
    <div className="px-6 py-10 md:px-20 lg:px-32">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">{playlist.name}</h1>
          <p className="text-xs text-muted-foreground">{playlist.songs?.length || 0} songs{playlist.ownerName ? ` · by ${playlist.ownerName}` : ""}</p>
        </div>
        <Button asChild variant="ghost"><Link href="/explore">Back</Link></Button>
      </div>

      <div className="grid gap-2">
        {songs.length ? songs.map((s) => (
          <div key={s.id || s.songId} className="p-3 rounded-md border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {s.image ? <img src={s.image} alt={s.name} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-secondary" />}
              <div>
                <p className="text-sm font-medium">{s.name || s.id || s.songId}</p>
                <p className="text-xs text-muted-foreground">{s.artist || ""}</p>
              </div>
            </div>
          </div>
        )) : <p className="text-sm text-muted-foreground">No songs found.</p>}
      </div>
    </div>
  );
}


