import { FormEvent, useEffect, useState } from "react";
import { useCurrentEmployee, useCurrentOrganisation } from "@/lib/supabase-identity";
import { useSupabaseAuth } from "@/lib/supabase-auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signIn } = useSupabaseAuth();
  const employeeState = useCurrentEmployee();
  const organizationState = useCurrentOrganisation();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (employeeState.error) console.error("[MedMap identity] Employee lookup failed", employeeState.error);
    if (organizationState.error) console.error("[MedMap identity] Organisation lookup failed", organizationState.error);
  }, [employeeState.error, organizationState.error]);

  if (authLoading || employeeState.isLoading || organizationState.isLoading) {
    return <IdentityState title="Resolving employee..." message="Checking the authenticated MedMap Operations identity." />;
  }

  if (!user) return <SignInScreen signIn={signIn} />;

  if (employeeState.error || organizationState.error) {
    return <IdentityState title="Identity lookup unavailable" message="We could not verify your MedMap Operations access. Please try again shortly." />;
  }

  if (employeeState.hasNoActiveEmployee) {
    return <IdentityState title="Employee access required" message="Your account is authenticated, but no active MedMap Operations employee profile is associated with it." />;
  }

  if (organizationState.hasNoOrganization) {
    return <IdentityState title="Organisation access required" message="Your active employee profile is not associated with an organisation." />;
  }

  return <>{children}</>;
}

function SignInScreen({ signIn }: { signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await signIn(email.trim(), password);
    if (result.error) setError("The email or password could not be verified.");
    setSubmitting(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f8fb] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_16px_45px_rgba(21,36,58,0.08)] sm:p-9">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#d7f4ea] text-[#13795e]">M</div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1b9975]">MedMap Operations</p>
        <h1 className="mt-2 font-display text-[28px] font-bold tracking-[-0.05em] text-[#152239]">Authentication required.</h1>
        <p className="mt-3 text-[12px] leading-6 text-slate-500">Sign in with your MedMap Operations account to continue.</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block text-[11px] font-bold text-slate-600">Email<input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="block text-[11px] font-bold text-slate-600">Password<input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="rounded-xl bg-[#fff8f7] px-3 py-2 text-[11px] text-[#bd504d]">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#182842] px-4 py-3 text-[11px] font-bold text-white transition hover:bg-[#233958] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Signing in..." : "Sign in"}</button>
        </form>
      </section>
    </div>
  );
}

function IdentityState({ title, message }: { title: string; message: string }) {
  return <div className="grid min-h-screen place-items-center bg-[#f6f8fb] px-5 py-10"><section className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-[0_16px_45px_rgba(21,36,58,0.08)] sm:p-9"><div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#fff2d9] text-[#b3781f]">!</div><h1 className="mt-5 font-display text-[25px] font-bold tracking-[-0.04em] text-[#152239]">{title}</h1><p className="mt-3 text-[12px] leading-6 text-slate-500">{message}</p></section></div>;
}
