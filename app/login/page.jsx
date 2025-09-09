"use client"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      console.log('Attempting login for:', email);
      const res = await signIn("credentials", { email, password, redirect: false });
      console.log('Login response:', res);
      
      if (res?.error) {
        setError(`Login failed: ${res.error}`);
        return;
      }
      
      if (res?.ok) {
        console.log('Login successful, redirecting...');
        router.replace("/");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="px-6 py-10 md:px-20 lg:px-32 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="mt-2">Sign in</Button>
      </form>
    </div>
  );
}


