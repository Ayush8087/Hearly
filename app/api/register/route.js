import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email, password, name } = body || {};

    if (typeof email !== "string" || typeof password !== "string") {
      return new Response(JSON.stringify({ error: "Email and password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name: name || null, password: hashedPassword },
      select: { id: true, email: true, name: true },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = typeof e?.message === "string" ? e.message : "Server error";
    // Handle Prisma unique constraint (safety in case race condition)
    if (e?.code === "P2002") {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


