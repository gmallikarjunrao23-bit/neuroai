"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const API_BASE = "https://backend-production-87c9.up.railway.app";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing...");
  const [error, setError] = useState("");

  useEffect(() => {
    const provider = searchParams.get("provider") || "google";
    const code = searchParams.get("code");

    if (!code) {
      setStatus("No authorization code found");
      setError("Could not complete sign in. Please try again.");
      return;
    }

    const handleOAuth = async () => {
      try {
        setStatus("Completing sign in...");
        
        const res = await fetch(API_BASE + "/api/v1/auth/oauth/" + provider + "/callback?code=" + code, {
          method: "POST",
        });
        
        const data = await res.json();

        if (data.access_token) {
          localStorage.setItem("modelhub_token", data.access_token);
          setStatus("Sign in successful! Redirecting...");
          setTimeout(() => router.push(data.user?.role === "admin" ? "/admin" : "/chat"), 1000);
        } else {
          const errMsg = data.detail || "Authentication failed";
          setStatus("Sign in failed");
          setError(errMsg);
        }
      } catch (err) {
        setStatus("Something went wrong");
        setError("Could not connect to authentication server. Please try again.");
      }
    };

    handleOAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {!error && (
          <div className="w-12 h-12 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )}
        <h2 className="text-lg font-bold mb-2">{status}</h2>
        {error && (
          <div className="mb-6">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
              <p className="text-sm text-red-400">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">This could be a temporary issue. Try again.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                Back to Login
              </Link>
              <button onClick={() => window.location.reload()} 
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground">
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
