import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, RefreshCw } from "lucide-react";
import { useSupabaseAuth } from "@/lib/supabase-auth";
import { getSupabaseHealth, supabaseConfigured, type SupabaseHealth } from "@/lib/supabase";

function DiagnosticStatus({ ok, pending }: { ok: boolean; pending?: boolean }) {
  if (pending) return <Loader2 size={15} className="animate-spin text-slate-400" />;
  return ok ? <CheckCircle2 size={15} className="text-[#1b9975]" /> : <CircleAlert size={15} className="text-[#bd504d]" />;
}

export function SupabaseConnectionDiagnostic() {
  const { session, loading: authLoading, error: authError } = useSupabaseAuth();
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setChecking(true);
    setHealth(await getSupabaseHealth());
    setChecking(false);
  }, []);

  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  if (!import.meta.env.DEV) return null;

  const backendConnected = health?.backendQuery === "connected";
  const authReady = !authLoading;
  const authErrorMessage = authError?.message ?? health?.error;

  return (
    <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1b9975]">Development diagnostic</p>
          <h2 className="mt-2 font-display text-[16px] font-bold text-[#152239]">Supabase connection</h2>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">Only connection state is shown. Credentials are never displayed.</p>
        </div>
        <button
          type="button"
          onClick={() => void checkConnection()}
          disabled={checking}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
          Recheck
        </button>
      </div>
      <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">
        <DiagnosticRow label="SUPABASE CONFIGURED" value={supabaseConfigured ? "Configured" : "Missing configuration"} ok={supabaseConfigured} pending={checking && !health} />
        <DiagnosticRow label="SUPABASE CLIENT INITIALIZED" value={health?.clientInitialized ? "Initialized" : "Not initialized"} ok={health?.clientInitialized === true} pending={checking && !health} />
        <DiagnosticRow label="AUTH SESSION" value={authLoading ? "Checking session" : session ? "Active session" : "No active session"} ok={authReady} pending={authLoading} />
        <DiagnosticRow label="BACKEND QUERY CONNECTIVITY" value={health ? backendConnected ? "Connected" : "Unavailable" : "Checking endpoint"} ok={backendConnected} pending={checking && !health} />
      </div>
      {authErrorMessage && <p className="mt-3 rounded-xl bg-[#fff8f7] px-3 py-2 text-[11px] leading-5 text-[#bd504d]">{authErrorMessage}</p>}
    </section>
  );
}

function DiagnosticRow({ label, value, ok, pending }: { label: string; value: string; ok: boolean; pending: boolean }) {
  return <div className="flex items-center justify-between gap-3 px-3 py-3"><div><p className="text-[10px] font-bold tracking-[0.08em] text-slate-500">{label}</p><p className="mt-1 text-[11px] text-slate-400">{value}</p></div><DiagnosticStatus ok={ok} pending={pending} /></div>;
}
