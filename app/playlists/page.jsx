"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlaylistsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [lists, setLists] = useState([]);
  const [renaming, setRenaming] = useState({ id: null, name: "" });
  const [name, setName] = useState("");

  const fetchLists = async () => {
    const res = await fetch("/api/playlists");
    if (res.ok) setLists(await res.json());
  };

  useEffect(() => {
    if (status === "authenticated") fetchLists();
  }, [status]);

  if (status === "loading") return <div className="px-6 py-10">Loading...</div>;
  if (!session) {
    return (
      <div className="px-6 py-10 md:px-20 lg:px-32">
        <h1 className="text-xl mb-4">Your playlists</h1>
        <p className="mb-4 text-sm text-muted-foreground">Sign in to manage playlists.</p>
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    );
  }

  const createList = async (e) => {
    e.preventDefault();
    if (!name) return;
    const res = await fetch("/api/playlists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (res.status === 401) return router.push('/login');
    if (res.ok) { setName(""); fetchLists(); }
  };

  return (
    <div className="px-6 py-10 md:px-20 lg:px-32">
      <h1 className="text-xl mb-4">Your playlists</h1>
      <form onSubmit={createList} className="flex gap-2 mb-6 max-w-sm">
        <Input placeholder="New playlist name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Create</Button>
      </form>
      <div className="grid gap-3">
        {lists.map((p) => (
          <div key={p.id} className="p-3 rounded-md border flex items-center justify-between">
            <div>
              {renaming.id === p.id ? (
                <div className="flex gap-2 items-center">
                  <Input value={renaming.name} onChange={(e) => setRenaming({ id: p.id, name: e.target.value })} className="h-8 w-48" />
                  <Button size="sm" onClick={async () => {
                    await fetch(`/api/playlists/${p.id}`, { method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: renaming.name }) });
                    setRenaming({ id: null, name: "" });
                    fetchLists();
                  }}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setRenaming({ id: null, name: "" })}>Cancel</Button>
                </div>
              ) : (
                <>
                  <Link href={`/playlists/${p.id}`} className="font-medium underline-offset-2 hover:underline">{p.name}</Link>
                  <p className="text-xs text-muted-foreground">{p.songs?.length || 0} songs</p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" asChild><Link href={`/playlists/${p.id}`}>Open</Link></Button>
              {renaming.id !== p.id && (
                <Button size="sm" variant="ghost" onClick={() => setRenaming({ id: p.id, name: p.name })}>Rename</Button>
              )}
              <Button size="sm" variant="destructive" onClick={async () => { await fetch(`/api/playlists/${p.id}`, { method: 'DELETE' }); fetchLists(); }}>Delete</Button>
            </div>
          </div>
        ))}
        {!lists.length && <p className="text-sm text-muted-foreground">No playlists yet.</p>}
      </div>
    </div>
  );
}


