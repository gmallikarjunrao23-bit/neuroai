"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const API_BASE = "https://backend-production-87c9.up.railway.app";

export default function SupabaseCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign in...");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      // Get access_token from URL fragment
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const errorDesc = params.get("error_description");

      if (errorDesc) {
        setStatus("Sign in failed");
        setError(decodeURIComponent(errorDesc));
        return;
      }

      if (!accessToken) {
        setStatus("No session found");
        setError("Could not complete sign in. Please try again.");
        return;
      }

      try {
        const res = await fetch(API_BASE + "/api/v1/auth/supabase/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: accessToken }),
        });
        const data = await res.json();

        if (data.access_token) {
          api.setToken(data.access_token);
          setStatus("Sign in successful! Redirecting...");
          // Clear the URL fragment
          window.location.hash = "";
          setTimeout(() => router.push(data.user?.role === "admin" ? "/admin" : "/chat"), 500);
        } else {
          setStatus("Sign in failed");
          setError(data.detail || "Authentication failed");
        }
      } catch {
        setStatus("Something went wrong");
        setError("Could not connect to authentication server.");
      }
    };

    handleCallback();
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
            </div>
            <button onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
