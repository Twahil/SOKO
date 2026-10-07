import { FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { signIn, signUp } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") await signUp(name.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kuna tatizo. Jaribu tena.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">SOKO Tanzania</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">
        {mode === "login" ? "Ingia kwenye SOKO" : "Fungua akaunti"}
      </h1>
      <p className="mt-2 text-muted">Akaunti yako inadhibitiwa na SOKO yenyewe.</p>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-xl bg-surface p-6 shadow-border">
        {mode === "signup" && (
          <div className="space-y-2"><Label htmlFor="name">Jina</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        )}
        <div className="space-y-2"><Label htmlFor="email">Barua pepe</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Nenosiri</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></div>
        {error ? <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Subiri…" : mode === "login" ? "Ingia" : "Jisajili"}</Button>
        <button type="button" className="w-full text-sm text-muted underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Huna akaunti? Fungua akaunti" : "Una akaunti? Ingia"}
        </button>
        <Link to="/" className="block text-center text-sm text-muted">Rudi SOKO</Link>
      </form>
    </div>
  );
}
