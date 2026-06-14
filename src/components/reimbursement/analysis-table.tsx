'use client'

import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import type { ReimbursementAnalysis } from '@/api/modules/reimbursement'

interface Props {
  data: ReimbursementAnalysis
  onChange: (data: ReimbursementAnalysis) => void
}

const DATE_KEYWORDS = ['日期', '时间', 'date', 'time', '日', '创建', '更新']
const SEQ_KEYWORDS = ['序号', '编号', 'no.', 'seq', 'index', '#']

function isDateColumn(colName: string): boolean {
  return DATE_KEYWORDS.some((k) => colName.toLowerCase().includes(k))
}

function findSequenceColumn(columns: string[]): string | undefined {
  return columns.find((col) =>
    SEQ_KEYWORDS.some((k) => col.toLowerCase().includes(k)),
  )
}

function toDateInputValue(v: unknown): string {
  if (!v) return ''
  const s = String(v).trim()
  const d = new Date(s)
  if (isNaN(d.getTime())) {
    const parts = s.split(/[-/]/)
    if (parts.length === 3) {
      const [a, b, c] = parts.map(Number)
      if (a > 1000) return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`
      return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`
    }
    return s
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function renumberSequence(
  rows: Record<string, unknown>[],
  seqCol: string | undefined,
  startRow: number,
) {
  if (!seqCol) return
  rows.forEach((row, i) => {
    row[seqCol] = startRow + i
  })
}

export function AnalysisTable({ data, onChange }: Props) {
  const { columnMapping, rowsData } = data
  const columns = Object.keys(columnMapping)
  const excelColumns = Object.values(columnMapping)
  const seqCol = findSequenceColumn(columns)

  // Delete confirmation dialog state
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  function updateCell(rowIndex: number, col: string, value: unknown) {
    const newRows = rowsData.map((row, i) =>
      i === rowIndex ? { ...row, [col]: value } : row,
    )
    onChange({ ...data, rowsData: newRows })
  }

  function confirmDelete() {
    if (deleteIndex === null) return
    const newRows = rowsData.filter((_, i) => i !== deleteIndex)
    renumberSequence(newRows, seqCol, data.dataStartRow)
    onChange({
      ...data,
      rowsData: newRows,
      dataEndRow: data.dataStartRow + newRows.length - 1,
    })
    setDeleteIndex(null)
  }

  function insertRow(afterIndex: number) {
    const newRow: Record<string, unknown> = {}
    columns.forEach((col) => {
      newRow[col] = ''
    })
    const newRows = [...rowsData]
    newRows.splice(afterIndex + 1, 0, newRow)
    renumberSequence(newRows, seqCol, data.dataStartRow)
    onChange({
      ...data,
      rowsData: newRows,
      dataEndRow: data.dataStartRow + newRows.length - 1,
    })
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              {columns.map((col) => (
                <TableHead key={col} className="text-center">
                  <div className="text-xs text-muted-foreground">
                    → {excelColumns[columns.indexOf(col)]}
                  </div>
                  {col}
                </TableHead>
              ))}
              <TableHead className="sticky right-0 z-10 w-24 border-l bg-background text-center">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowsData.map((row, ri) => (
              <TableRow key={ri} className="group">
                <TableCell className="text-xs text-muted-foreground">
                  {data.dataStartRow + ri}
                </TableCell>
                {columns.map((col) =>
                  isDateColumn(col) ? (
                    <TableCell key={col}>
                      <input
                        type="date"
                        value={toDateInputValue(row[col])}
                        onChange={(e) => updateCell(ri, col, e.target.value)}
                        className="h-8 min-w-[130px] rounded-md border bg-background px-2 text-sm"
                      />
                    </TableCell>
                  ) : (
                    <TableCell key={col}>
                      <Input
                        value={String(row[col] ?? '')}
                        onChange={(e) => updateCell(ri, col, e.target.value)}
                        className="h-8 min-w-[100px] text-sm"
                      />
                    </TableCell>
                  ),
                )}
                <TableCell className="sticky right-0 z-10 border-l bg-background">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => insertRow(ri)}
                      className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                      新增
                    </button>
                    <button
                      onClick={() => setDeleteIndex(ri)}
                      className="inline-flex items-center gap-0.5 text-xs text-destructive hover:underline"
                    >
                      <Trash2 className="h-3 w-3" />
                      删除
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rowsData.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">暂无数据</p>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除第 {deleteIndex !== null ? data.dataStartRow + deleteIndex : ''} 行吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
