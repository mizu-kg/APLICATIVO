"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore, type Servico } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ServicosPage() {
  const { clientes, servicos, addServico, updateServico, deleteServico } = useAppStore()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [servicoId, setServicoId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clienteId: "",
    descricao: "",
    valor: "",
    dataServico: new Date().toISOString().split("T")[0],
    status: "pendente" as const,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "valor" ? value : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clienteId || !formData.descricao || !formData.valor) {
      toast({
        title: "Erro",
        description: "Cliente, descrição e valor são obrigatórios",
        variant: "destructive",
      })
      return
    }

    const servicoData = {
      ...formData,
      valor: Number.parseFloat(formData.valor),
    }

    if (isEditing && servicoId) {
      const servicoAtual = servicos.find((s) => s.id === servicoId)
      const statusMudandoParaConcluido = servicoAtual?.status !== "concluido" && formData.status === "concluido"

      updateServico(servicoId, servicoData)

      if (statusMudandoParaConcluido) {
        toast({
          title: "Serviço concluído",
          description: "O serviço foi marcado como concluído e um débito foi gerado automaticamente",
        })
      } else {
        toast({
          title: "Serviço atualizado",
          description: "O serviço foi atualizado com sucesso",
        })
      }
    } else {
      addServico(servicoData)

      if (formData.status === "concluido") {
        toast({
          title: "Serviço adicionado",
          description: "O serviço foi adicionado como concluído e um débito foi gerado automaticamente",
        })
      } else {
        toast({
          title: "Serviço adicionado",
          description: "O serviço foi adicionado com sucesso",
        })
      }
    }

    resetForm()
  }

  const handleEdit = (servico: Servico) => {
    setIsEditing(true)
    setServicoId(servico.id)
    setFormData({
      clienteId: servico.clienteId,
      descricao: servico.descricao,
      valor: servico.valor.toString(),
      dataServico: new Date(servico.dataServico).toISOString().split("T")[0],
      status: servico.status,
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço? Todos os débitos relacionados também serão excluídos.")) {
      deleteServico(id)
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso",
      })
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setServicoId(null)
    setFormData({
      clienteId: "",
      descricao: "",
      valor: "",
      dataServico: new Date().toISOString().split("T")[0],
      status: "pendente",
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Pendente</span>
      case "concluido":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Concluído</span>
      case "cancelado":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Cancelado</span>
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Serviços</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Serviço" : "Adicionar Serviço"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Atualize os dados do serviço selecionado"
              : "Preencha os dados para adicionar um novo serviço"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="clienteId" className="text-sm font-medium">
                  Cliente
                </label>
                <select
                  id="clienteId"
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="dataServico" className="text-sm font-medium">
                  Data do Serviço
                </label>
                <Input
                  id="dataServico"
                  name="dataServico"
                  type="date"
                  value={formData.dataServico}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="descricao" className="text-sm font-medium">
                  Descrição
                </label>
                <Input
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descrição do serviço"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="valor" className="text-sm font-medium">
                  Valor (R$)
                </label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={handleInputChange}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
            <Button type="submit">{isEditing ? "Atualizar" : "Adicionar"} Serviço</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>Gerencie os serviços prestados</CardDescription>
        </CardHeader>
        <CardContent>
          {servicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="mb-4 text-muted-foreground">Nenhum serviço cadastrado</p>
              <Button onClick={() => document.getElementById("descricao")?.focus()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicos.map((servico) => {
                    const cliente = clientes.find((c) => c.id === servico.clienteId)
                    return (
                      <TableRow key={servico.id}>
                        <TableCell>{cliente?.nome || "Cliente não encontrado"}</TableCell>
                        <TableCell>{servico.descricao}</TableCell>
                        <TableCell>R$ {servico.valor.toFixed(2)}</TableCell>
                        <TableCell>{new Date(servico.dataServico).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{getStatusLabel(servico.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(servico)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(servico.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

