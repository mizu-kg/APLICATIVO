"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/data"
import { Download, Upload, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function BackupRestore() {
  const { clientes, servicos, debitos } = useAppStore()
  const { toast } = useToast()
  const [isRestoring, setIsRestoring] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  // Função para exportar os dados
  const exportData = () => {
    const data = {
      clientes,
      servicos,
      debitos,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `backup-sistema-clientes-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Backup realizado com sucesso",
      description: "Seus dados foram exportados para um arquivo JSON",
    })
  }

  // Função para importar os dados
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const fileReader = new FileReader()

    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8")
      fileReader.onload = (e) => {
        try {
          if (e.target?.result) {
            const data = JSON.parse(e.target.result as string)

            // Validação básica do arquivo
            if (!data.clientes || !data.servicos || !data.debitos) {
              throw new Error("Formato de arquivo inválido")
            }

            // Restaurar os dados
            const { setClientes, setServicos, setDebitos } = useAppStore.getState()
            setClientes(data.clientes)
            setServicos(data.servicos)
            setDebitos(data.debitos)

            toast({
              title: "Dados restaurados com sucesso",
              description: `Foram importados ${data.clientes.length} clientes, ${data.servicos.length} serviços e ${data.debitos.length} débitos`,
            })
          }
        } catch (error) {
          console.error("Erro ao importar dados:", error)
          setFileError("O arquivo selecionado não é válido. Por favor, selecione um arquivo de backup correto.")

          toast({
            title: "Erro ao restaurar dados",
            description: "O arquivo selecionado não é válido",
            variant: "destructive",
          })
        }
      }
      fileReader.onerror = () => {
        setFileError("Erro ao ler o arquivo")
        toast({
          title: "Erro ao ler o arquivo",
          description: "Não foi possível ler o arquivo selecionado",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup e Restauração</CardTitle>
        <CardDescription>Exporte seus dados para um arquivo ou restaure a partir de um backup anterior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            Para garantir que seus dados não sejam perdidos, faça backups regulares exportando-os para um arquivo.
          </p>

          {fileError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{fileError}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={exportData}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>

        <div className="relative">
          <Button variant="default" onClick={() => document.getElementById("file-upload")?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Dados
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={importData}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
      </CardFooter>
    </Card>
  )
}

