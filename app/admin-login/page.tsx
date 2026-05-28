"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { signInSchema, type SignInInput } from "@/lib/validations/authSchemas";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setError("");
    setLoading(true);
    try {
      const result = await signIn("admin-login", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid admin credentials. Access denied.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo variant="light" size="md" className="justify-center" />
          <div className="flex items-center justify-center gap-2 mt-3">
            <Shield size={14} className="text-gold-400" />
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-widest">Admin Access</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-navy-800">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Restricted access — authorised personnel only.</p>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Admin Email"
              type="email"
              placeholder="harveysloansllc@outlook.com"
              required
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Admin password"
                required
                error={errors.password?.message}
                {...register("password")}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-gray-400 hover:text-navy-600" tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3.5">
              <Shield size={16} /> Access Admin Panel
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <a href="/auth/signin" className="text-xs text-gray-400 hover:text-navy-600">← Client Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
