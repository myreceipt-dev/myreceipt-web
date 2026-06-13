import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Upload, Sparkles, Download } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero */}
      <section className="text-center space-y-4 pb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          智能报销单处理
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          上传支付凭证截图和报销 Excel 模板，AI 自动识别并生成报销单，告别手动录入
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/reimbursement">
            开始处理报销单 <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="grid gap-6 sm:grid-cols-3 pt-8">
        <Card>
          <CardHeader>
            <Upload className="h-8 w-8 text-primary mb-2" />
            <CardTitle>1. 上传文件</CardTitle>
            <CardDescription>
              上传支付凭证截图和报销 Excel 模板，支持分步上传或 ZIP 打包上传
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Sparkles className="h-8 w-8 text-primary mb-2" />
            <CardTitle>2. AI 识别</CardTitle>
            <CardDescription>
              Gemini AI 自动提取支付凭证截图、发票中的日期、金额、商户、类别等关键信息，ZIP 模式另支持电子发票 PDF、行程单 PDF
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Download className="h-8 w-8 text-primary mb-2" />
            <CardTitle>3. 导出报销单</CardTitle>
            <CardDescription>
              核对 AI 识别结果，一键导出填好的 Excel 文件
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
