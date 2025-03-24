"use client"

import { BackupRestore } from "@/components/backup-restore"

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <div className="grid gap-6">
        <BackupRestore />
      </div>
    </div>
  )
}

