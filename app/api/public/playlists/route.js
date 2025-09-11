import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1), 100);
  const q = (searchParams.get("q") || "").trim();

  const where = q
    ? { name: { contains: q, mode: "insensitive" } }
    : undefined;

  const [total, items] = await Promise.all([
    prisma.playlist.count({ where }),
    prisma.playlist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { songs: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  return Response.json({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      songCount: p._count.songs,
      ownerName: p.user?.name || null,
    })),
  }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } });
}


