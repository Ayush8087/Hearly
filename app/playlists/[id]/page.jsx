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
  const [reordering, setReordering] = useState(false);

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
        <div className="flex items-center gap-2">
          <Button variant={reordering ? "secondary" : "ghost"} onClick={() => setReordering(v => !v)}>{reordering ? "Done" : "Reorder"}</Button>
          <Button variant="ghost" asChild><Link href="/playlists">Back</Link></Button>
        </div>
      </div>

      <div className="grid gap-2">
        {songs.length ? songs.map((s, idx) => (
          <div key={s.id} className="p-3 rounded-md border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {s.image ? <img src={s.image} alt={s.name} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-secondary" />}
              <div>
                <p className="text-sm font-medium">{s.name || s.id}</p>
                <p className="text-xs text-muted-foreground">{s.artist || ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {reordering ? (
                <>
                  <Button size="sm" variant="secondary" onClick={() => {
                    if (idx === 0) return;
                    const nextOrder = [...songs];
                    const [item] = nextOrder.splice(idx, 1);
                    nextOrder.splice(idx - 1, 0, item);
                    setSongs(nextOrder);
                  }}>Up</Button>
                  <Button size="sm" variant="secondary" onClick={() => {
                    if (idx === songs.length - 1) return;
                    const nextOrder = [...songs];
                    const [item] = nextOrder.splice(idx, 1);
                    nextOrder.splice(idx + 1, 0, item);
                    setSongs(nextOrder);
                  }}>Down</Button>
                </>
              ) : (
                <>
                  <Button size="sm" asChild>
                    <Link href={`/${s.id || s.songId}?playlist=${params.id}&pos=${idx}`}>Play</Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    const songId = s.id || s.songId;
                    await fetch(`/api/playlists/${params.id}/songs/${songId}`, { method: 'DELETE' });
                    setSongs(prev => prev.filter(x => (x.id || x.songId) !== songId));
                  }}>Remove</Button>
                </>
              )}
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">No songs yet.</p>
        )}
      </div>

      {reordering && songs.length > 0 && (
        <div className="mt-4 flex gap-2">
          <Button onClick={async () => {
            const ids = songs.map(s => s.id || s.songId);
            await fetch(`/api/playlists/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songs: ids }) });
          }}>Save order</Button>
          <Button variant="ghost" onClick={() => load()}>Reset</Button>
        </div>
      )}
    </div>
  );
}


