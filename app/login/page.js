"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/Providers";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [role, setRole] = useState(searchParams.get("role") === "student" ? "student" : "sme");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, email: email.trim(), password }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }
    await refreshUser();
    router.push(role === "sme" ? "/company/dashboard" : "/student/dashboard");
  }

  const demoHint = role === "sme" ? "hr@greenfieldslogistics.nl / demo1234" : "s.okafor@student.maastrichtuniversity.nl / demo1234";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head">
          <h1>Log in to SkillBid</h1>
          <p>Pick your account type to continue.</p>
        </div>
        <div className="tabs" style={{ margin: "0 auto 24px", justifyContent: "center" }}>
          <button className={"tab" + (role === "sme" ? " active" : "")} onClick={() => setRole("sme")} type="button">Company</button>
          <button className={"tab" + (role === "student" ? " active" : "")} onClick={() => setRole("student")} type="button">Student</button>
        </div>
        <div className="card card-pad">
          <form onSubmit={submit}>
            <div className="field">
              <label className="field-label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === "sme" ? "you@company.com" : "you@university.edu"} />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div className="field-error mt-8">{error}</div>}
            <button className="btn btn-primary btn-block mt-8" type="submit" disabled={submitting}>{submitting ? "Logging in…" : "Log in"}</button>
          </form>
          <p className="text-faint text-sm mono mt-16">Try the demo: {demoHint}</p>
        </div>
        <div className="auth-switch">No account yet? <Link href="/signup" style={{ fontWeight: 600, textDecoration: "underline" }}>Sign up</Link></div>
      </div>
    </div>
  );
}
