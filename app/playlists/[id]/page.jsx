"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSongsById } from "@/lib/fetch";
import Link from "next/link";

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch(`/api/playlists/${params.id}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPlaylist(data);
    // hydrate song metadata from external API
    if (Array.isArray(data?.songs) && data.songs.length) {
      const items = await Promise.all(
        data.songs.map(async (s) => {
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
          } catch {
            return { id: s.songId };
          }
        })
      );
      setSongs(items);
    } else {
      setSongs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  if (loading) return <div className="px-6 py-10">Loading...</div>;
  if (!playlist) return <div className="px-6 py-10">Not found</div>;

  return (
    <div className="px-6 py-10 md:px-20 lg:px-32">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">{playlist.name}</h1>
          <p className="text-xs text-muted-foreground">{playlist.songs?.length || 0} songs</p>
        </div>
        <Button variant="ghost" asChild><Link href="/playlists">Back</Link></Button>
      </div>

      <div className="grid gap-2">
        {songs.length ? songs.map((s) => (
          <div key={s.id} className="p-3 rounded-md border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {s.image ? <img src={s.image} alt={s.name} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-secondary" />}
              <div>
                <p className="text-sm font-medium">{s.name || s.id}</p>
                <p className="text-xs text-muted-foreground">{s.artist || ""}</p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link href={`/${s.id || s.songId}`}>Play</Link>
            </Button>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">No songs yet.</p>
        )}
      </div>
    </div>
  );
}


