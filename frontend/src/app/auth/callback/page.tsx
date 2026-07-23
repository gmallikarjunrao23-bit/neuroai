"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_BASE = "https://backend-production-87c9.up.railway.app";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const provider = searchParams.get("provider") || "google";
    const code = searchParams.get("code");

    if (!code) {
      setStatus("No authorization code found");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    const handleOAuth = async () => {
      try {
        const res = await fetch(API_BASE + "/api/v1/auth/oauth/" + provider + "/callback?code=" + code, {
          method: "POST",
        });
        const data = await res.json();

        if (data.access_token) {
          localStorage.setItem("modelhub_token", data.access_token);
          setStatus("Sign in successful! Redirecting...");
          setTimeout(() => router.push(data.user?.role === "admin" ? "/admin" : "/chat"), 1000);
        } else {
          setStatus(data.detail || "Authentication failed");
          setTimeout(() => router.push("/login"), 2000);
        }
      } catch {
        setStatus("Something went wrong");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleOAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>}>
      <CallbackContent />
    </Suspense>
  );
}
