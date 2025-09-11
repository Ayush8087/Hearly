"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (nextPage = page, nextQ = q) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
    if (nextQ) params.set("q", nextQ);
    const res = await fetch(`/api/public/playlists?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(1, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  return (
    <div className="px-6 py-10 md:px-20 lg:px-32">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Explore playlists</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search playlists" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
          <Button onClick={() => load(1, q)} disabled={loading}>Search</Button>
        </div>
      </div>

      <div className="grid gap-3">
        {loading ? <div>Loading…</div> : (
          items.length ? items.map(p => (
            <div key={p.id} className="p-3 rounded-md border flex items-center justify-between">
              <div>
                <Link href={`/explore/${p.id}`} className="font-medium underline-offset-2 hover:underline">{p.name}</Link>
                <p className="text-xs text-muted-foreground">{p.songCount} songs{p.ownerName ? ` · by ${p.ownerName}` : ""}</p>
              </div>
              <Button asChild size="sm"><Link href={`/explore/${p.id}`}>Open</Link></Button>
            </div>
          )) : <p className="text-sm text-muted-foreground">No playlists found.</p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => { if (page > 1) { const np = page - 1; setPage(np); load(np); } }} disabled={loading || page <= 1}>Prev</Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => { if (page < totalPages) { const np = page + 1; setPage(np); load(np); } }} disabled={loading || page >= totalPages}>Next</Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Page size</span>
          <select className="h-8 px-2 border rounded" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}


