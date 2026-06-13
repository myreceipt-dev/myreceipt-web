import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSpreadsheet, PackageOpen } from "lucide-react";

export default function ReimbursementLandingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      {/* Header */}
      <section className="text-center space-y-4 pb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          报销单处理
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          选择适合你的报销方式
        </p>
      </section>

      {/* Feature cards */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Card 1: 报销单填报 */}
        <Card className="flex flex-col">
          <CardHeader>
            <FileSpreadsheet className="h-10 w-10 text-primary mb-2" />
            <CardTitle>报销单填报</CardTitle>
            <CardDescription>
              上传报销 Excel 模板和支付凭证截图，AI 自动识别并填入报销单，
              适合已有模板、只需填表的场景
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Excel 模板 + 支付凭证截图</li>
              <li>• AI 自动提取日期、金额、商户、类别</li>
              <li>• 支持编辑预览，导出填好的 .xlsx</li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/reimbursement/fill">开始填报</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: 全自动报销材料 */}
        <Card className="flex flex-col">
          <CardHeader>
            <PackageOpen className="h-10 w-10 text-primary mb-2" />
            <CardTitle>全自动报销材料</CardTitle>
            <CardDescription>
              上传包含模板、支付凭证截图、电子发票 PDF、打车行程单 PDF 的 ZIP
              压缩包，AI 自动整理命名所有文件并生成报销单
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• ZIP 压缩包，支持多种文件类型</li>
              <li>• 支付凭证与发票金额交叉校验</li>
              <li>• 文件规范化重命名，导出整理好的 .zip</li>
            </ul>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/reimbursement/package">开始打包</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
