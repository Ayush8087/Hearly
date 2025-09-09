import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user;
}

export async function GET() {
  if (!prisma) return new Response("Server not ready (database)", { status: 500 });
  const user = await requireSession();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const lists = await prisma.playlist.findMany({ where: { userId: user.id }, include: { songs: true } });
  return Response.json(lists);
}

export async function POST(req) {
  try {
    if (!prisma) return new Response("Server not ready (database)", { status: 500 });
    const user = await requireSession();
    if (!user) return new Response("Unauthorized", { status: 401 });
    const { name } = await req.json();
    if (!name) return new Response("Name required", { status: 400 });
    
    console.log('Creating playlist for user:', user.id, 'with name:', name);
    const created = await prisma.playlist.create({ data: { name, userId: user.id } });
    console.log('Playlist created successfully:', created.id);
    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return new Response(JSON.stringify({ error: "Failed to create playlist", details: error.message }), { status: 500 });
  }
}


