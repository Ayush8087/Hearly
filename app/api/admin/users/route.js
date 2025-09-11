import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const allow = parseAdminEmails();
  const isAllowed = allow.length === 0 ? false : allow.includes(session.user.email.toLowerCase());
  if (!isAllowed) return new Response("Forbidden", { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });

  return Response.json({ users });
}


