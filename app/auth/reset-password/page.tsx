"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/authSchemas";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <Alert type="error">
        Invalid or missing reset token. Please request a new password reset link.
      </Alert>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error || "Failed to reset password. The link may have expired.");
        return;
      }
      router.push("/auth/signin?reset=1");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="relative">
          <Input
            label="New Password"
            type={showPw ? "text" : "password"}
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-gray-400 hover:text-navy-600" tabIndex={-1}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter your password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" loading={loading} className="w-full py-3.5">
          <Lock size={16} /> Reset Password
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo variant="light" size="md" className="justify-center" />
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Link href="/auth/signin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-600 mb-6">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-navy-800">Reset Password</h1>
            <p className="text-gray-500 text-sm mt-1">Create a new secure password for your account.</p>
          </div>
          <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
