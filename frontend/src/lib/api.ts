"use client";

const API_BASE = "https://backend-production-87c9.up.railway.app";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("modelhub_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("modelhub_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("modelhub_token");
  }

  getToken() { return this.token; }

  private async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(errData.detail || `Request failed: ${res.status}`);
    }
    return res;
  }

  async get(path: string) { return (await this.request(path)).json(); }
  
  async post(path: string, data?: any) {
    return (await this.request(path, { method: "POST", body: data ? JSON.stringify(data) : undefined })).json();
  }

  async uploadFormData(path: string, formData: FormData) {
    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: formData });
    return res.json();
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.uploadFormData("/api/v1/upload", formData);
  }

  async register(email: string, password: string, name: string) {
    const data = await this.post("/api/v1/auth/register", { email, password, name });
    if (data.access_token) this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.post("/api/v1/auth/login", { email, password });
    if (data.access_token) this.setToken(data.access_token);
    return data;
  }

  getModels() { return this.get("/api/v1/models"); }
  
  chat(model: string, message: string, session_id?: string, files?: Array<{name:string;url:string;type:string}>) {
    return this.post("/api/v1/chat", { model, message, session_id, files });
  }
  
  getSessions() { return this.get("/api/v1/sessions"); }
  
  getChatHistory(session_id?: string) {
    return this.get(session_id ? `/api/v1/chat/history?session_id=${session_id}` : "/api/v1/chat/history");
  }
  
  getUsage() { return this.get("/api/v1/usage"); }
  getPaymentPlans() { return this.get("/api/v1/payments/plans"); }
  initiatePayment(formData: FormData) { return this.uploadFormData("/api/v1/payments/initiate", formData); }
  getMyPayments() { return this.get("/api/v1/payments/my-payments"); }
  getAdminDashboard() { return this.get("/api/v1/admin/dashboard"); }
  getAdminUsers() { return this.get("/api/v1/admin/users"); }
  getAdminPayments(status?: string) { return this.get(status ? `/api/v1/admin/payments?status_filter=${status}` : "/api/v1/admin/payments"); }
  approvePayment(id: string, st: string, notes?: string) { return this.post(`/api/v1/admin/payments/${id}/approve`, { status: st, admin_notes: notes }); }
  toggleKyc(userId: string) { return this.post(`/api/v1/admin/users/${userId}/toggle-kyc`, {}); }
}

export const api = new ApiClient();
