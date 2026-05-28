"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { signInSchema, type SignInInput } from "@/lib/validations/authSchemas";

export default function SignInPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInInput) => {
    setError("");
    setLoading(true);
    try {
      const result = await signIn("client-login", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });
      if (result?.error === "TOO_MANY_REQUESTS") {
        setError("Too many login attempts. Please wait 15 minutes and try again.");
      } else if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
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
          <p className="mt-2 text-navy-300 text-sm">Client Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-navy-800">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to access your account</p>
          </div>

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

            <div className="relative">
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                required
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-9 text-gray-400 hover:text-navy-600"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-gold-500 hover:text-gold-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full text-base py-3.5">
              <Lock size={16} />
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-gold-500 font-semibold hover:text-gold-600">
              Apply Now
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link href="/admin-login" className="text-xs text-navy-400 hover:text-navy-600">
              Admin Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
