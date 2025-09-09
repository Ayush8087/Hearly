import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/options";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user;
}

export async function DELETE(_req, { params }) {
  const user = await requireSession();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const playlist = await prisma.playlist.findFirst({ where: { id: params.id, userId: user.id } });
  if (!playlist) return new Response("Not found", { status: 404 });
  await prisma.playlistSong.deleteMany({ where: { playlistId: params.id, songId: params.songId } });
  return new Response(null, { status: 204 });
}


