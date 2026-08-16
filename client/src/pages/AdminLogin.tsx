import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Lock, ShieldCheck, ArrowLeft, LogOut, Home, BarChart3, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminLoginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setPassword("");
      setLocation("/admin");
    },
    onError: (error: { message?: string }) => {
      setLoginError(error.message || "Username atau password admin salah.");
      setIsSubmitting(false);
    },
  });

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    adminLoginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <img
            src="/manus-storage/primedeal-logo-new_719501eb.webp"
            alt="Primedeal Logo"
            className="h-16 w-16"
          />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Portal Kelola Admin
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Primedeal Property Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {isAuthenticated && user ? (
            <div className="space-y-6">
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">
                      Berhasil Masuk sebagai {user.name || "Admin"}
                    </h3>
                    <p className="text-xs text-green-700 mt-0.5">
                      Role: {user.role === "admin" ? "Admin (Akses Penuh)" : "User Biasa"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setLocation("/listing")}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  Buka Halaman Listing & Kelola Properti
                </Button>
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/admin/dashboard")}
                    className="w-full gap-2"
                  >
                    <BarChart3 size={16} />
                    Lihat Dashboard Pengunjung
                  </Button>
                )}
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/admin/reviews")}
                    className="w-full gap-2"
                  >
                    Kelola Rating & Ulasan
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="w-full gap-2"
                >
                  <Home size={16} />
                  Kembali ke Beranda
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                >
                  <LogOut size={16} />
                  Keluar (Logout)
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleAdminLogin}>
              <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <span className="font-semibold block mb-1">Akses Terbatas Pemilik</span>
                    Masuk dengan akun admin Primedeal untuk menambah, mengedit, menghapus, dan mengunggah media listing.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-username">Username Admin</Label>
                <Input
                  id="admin-username"
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password Admin</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white gap-2 py-6 text-base touch-manipulation"
                aria-label="Login ke Akun Admin"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {isSubmitting ? "Memeriksa..." : "Login ke Akun Admin"}
              </Button>
              {loginError && (
                <p role="alert" className="text-center text-sm text-red-600" aria-live="polite">
                  {loginError}
                </p>
              )}

              <div className="text-center">
                <a
                  href="/"
                  className="text-sm font-medium text-slate-600 hover:text-primary inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Kembali ke Website Utama
                </a>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
