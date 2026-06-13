"use client";

import { useState, useEffect } from "react";
import { fetchSettings, updateSettings } from "@/api/modules/user";
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
import { Separator } from "@/components/ui/separator";
import { Save, Check, Loader2 } from "lucide-react";

export function SettingsForm() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // 打开页面时获取已有配置
  useEffect(() => {
    async function load() {
      try {
        const settings = await fetchSettings();
        if (settings.geminiModel) setModel(settings.geminiModel);
        // API Key 出于安全考虑可能不返回或返回脱敏值，缺省显示空
        if (settings.geminiApiKey) setApiKey(settings.geminiApiKey);
      } catch {
        // 首次访问无配置，忽略
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateSettings({
        geminiApiKey: apiKey || undefined,
        geminiModel: model || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI 设置</CardTitle>
          <CardDescription>配置你的 Gemini API Key 和默认模型</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="输入你的 Google Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              密钥加密存储，仅用于 AI 识别支付凭证截图、发票信息
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="model">默认模型</Label>
            <Input
              id="model"
              placeholder="gemini-2.5-flash"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              当前支持：gemini-2.5-flash、gemini-2.5-pro 等
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            {saved ? "已保存" : "修改后点击保存即可"}
          </p>
          <Button onClick={handleSave} disabled={saving}>
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-1" /> 已保存
              </>
            ) : saving ? (
              "保存中..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" /> 保存
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
