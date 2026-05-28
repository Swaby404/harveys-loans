"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, SendHorizonal } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/authSchemas";

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.toLowerCase().trim() }),
      });
      if (!res.ok) {
        const j = await res.json();
        if (res.status === 429) {
          setError("Too many requests. Please wait before trying again.");
        } else {
          setError(j.error || "Something went wrong. Please try again.");
        }
        return;
      }
      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-display font-bold text-navy-800">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {success ? (
            <Alert type="success">
              If an account exists for that email address, a password reset link has been sent. Please check your inbox (and spam folder).
            </Alert>
          ) : (
            <>
              {error && <Alert type="error" className="mb-4">{error}</Alert>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="relative">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    required
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <Mail size={16} className="absolute right-3 top-9 text-gray-400" />
                </div>
                <Button type="submit" loading={loading} className="w-full py-3.5">
                  <SendHorizonal size={16} /> Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
