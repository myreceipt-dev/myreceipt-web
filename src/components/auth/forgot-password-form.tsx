"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { forgotPassword, resetPassword } from "@/api/modules/auth";

const COUNTDOWN_SECONDS = 60;

type Step = "idle" | "code-sent" | "reset-success";

export function ForgotPasswordForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setStep("code-sent");
      setCountdown(COUNTDOWN_SECONDS);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSubmitting(false);
    }
  }, [email]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code.trim() || !/^\d{6}$/.test(code.trim())) {
      setError("请输入 6 位数字验证码");
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 50) {
      setError("新密码需要 6-50 位字符");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      // Auto-login after reset
      await login(email.trim(), newPassword);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "重置失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>忘记密码</CardTitle>
        <CardDescription>请输入注册邮箱以重置密码</CardDescription>
      </CardHeader>

      {/* Step 1 — Send verification code */}
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入注册邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={step === "code-sent"}
          />
        </div>

        {step === "code-sent" ? (
          <div className="space-y-2">
            <p className="text-sm text-green-600 dark:text-green-400">
              验证码已发送至 {email}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={countdown > 0}
              onClick={handleSendCode}
            >
              {countdown > 0 ? `重新发送 (${countdown}s)` : "重新发送"}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            className="w-full"
            disabled={submitting}
            onClick={handleSendCode}
          >
            {submitting ? "发送中..." : "发送验证码"}
          </Button>
        )}

        {/* Step 2 — Reset password (shown after code sent) */}
        {step === "code-sent" && (
          <form onSubmit={handleReset} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <Input
                id="code"
                placeholder="请输入 6 位验证码"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="6-50 位字符"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "重置中..." : "重置密码"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            ← 返回登录
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
