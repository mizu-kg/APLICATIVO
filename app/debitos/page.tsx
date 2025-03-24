"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppStore, type Debito } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function DebitosPage() {
  const { clientes, servicos, debitos, addDebito, updateDebito, deleteDebito, pagarDebito } = useAppStore()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [debitoId, setDebitoId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clienteId: "",
    servicoId: "",
    valor: "",
    dataVencimento: new Date().toISOString().split("T")[0],
    status: "pendente" as const,
  })

  // Verificar débitos atrasados
  useEffect(() => {
    const hoje = new Date()

    // Atualiza o status de débitos atrasados
    debitos.forEach((debito) => {
      if (debito.status === "pendente" && new Date(debito.dataVencimento) < hoje && !debito.dataPagamento) {
        updateDebito(debito.id, { status: "atrasado" })
      }
    })
  }, [debitos, updateDebito])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "clienteId" && value) {
      // Reset servicoId when client changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        servicoId: "",
      }))
    } else if (name === "servicoId" && value) {
      // Auto-fill valor when service is selected
      const servico = servicos.find((s) => s.id === value)
      if (servico) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          valor: servico.valor.toString(),
        }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clienteId || !formData.valor || !formData.dataVencimento) {
      toast({
        title: "Erro",
        description: "Cliente, valor e data de vencimento são obrigatórios",
        variant: "destructive",
      })
      return
    }

    const debitoData = {
      ...formData,
      valor: Number.parseFloat(formData.valor),
      dataPagamento: null,
    }

    if (isEditing && debitoId) {
      updateDebito(debitoId, debitoData)
      toast({
        title: "Débito atualizado",
        description: "O débito foi atualizado com sucesso",
      })
    } else {
      addDebito(debitoData)
      toast({
        title: "Débito adicionado",
        description: "O débito foi adicionado com sucesso",
      })
    }

    resetForm()
  }

  const handleEdit = (debito: Debito) => {
    setIsEditing(true)
    setDebitoId(debito.id)
    setFormData({
      clienteId: debito.clienteId,
      servicoId: debito.servicoId || "",
      valor: debito.valor.toString(),
      dataVencimento: new Date(debito.dataVencimento).toISOString().split("T")[0],
      status: debito.status,
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este débito?")) {
      deleteDebito(id)
      toast({
        title: "Débito excluído",
        description: "O débito foi excluído com sucesso",
      })
    }
  }

  const handlePagar = (id: string) => {
    pagarDebito(id)
    toast({
      title: "Débito pago",
      description: "O débito foi marcado como pago",
    })
  }

  const resetForm = () => {
    setIsEditing(false)
    setDebitoId(null)
    setFormData({
      clienteId: "",
      servicoId: "",
      valor: "",
      dataVencimento: new Date().toISOString().split("T")[0],
      status: "pendente",
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Pendente</span>
      case "pago":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Pago</span>
      case "atrasado":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Atrasado</span>
      default:
        return status
    }
  }

  const getDebitoSource = (debito: Debito, servico?: any) => {
    if (debito.servicoId && servico) {
      return (
        <div className="flex items-center">
          <span>{servico.descricao}</span>
          {servico.status === "concluido" && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Automático</span>
          )}
        </div>
      )
    }
    return "Débito avulso"
  }

  // Filtrar serviços pelo cliente selecionado
  const servicosFiltrados = formData.clienteId ? servicos.filter((s) => s.clienteId === formData.clienteId) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Débitos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Débito" : "Adicionar Débito"}</CardTitle>
          <CardDescription>
            {isEditing ? "Atualize os dados do débito selecionado" : "Preencha os dados para adicionar um novo débito"}
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
                <label htmlFor="servicoId" className="text-sm font-medium">
                  Serviço (opcional)
                </label>
                <select
                  id="servicoId"
                  name="servicoId"
                  value={formData.servicoId}
                  onChange={handleInputChange}
                  disabled={!formData.clienteId}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selecione um serviço</option>
                  {servicosFiltrados.map((servico) => (
                    <option key={servico.id} value={servico.id}>
                      {servico.descricao} - R$ {servico.valor.toFixed(2)}
                    </option>
                  ))}
                </select>
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
                <label htmlFor="dataVencimento" className="text-sm font-medium">
                  Data de Vencimento
                </label>
                <Input
                  id="dataVencimento"
                  name="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={handleInputChange}
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
                  <option value="atrasado">Atrasado</option>
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
            <Button type="submit">{isEditing ? "Atualizar" : "Adicionar"} Débito</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Débitos</CardTitle>
          <CardDescription>Gerencie os débitos dos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {debitos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="mb-4 text-muted-foreground">Nenhum débito cadastrado</p>
              <Button onClick={() => document.getElementById("valor")?.focus()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Débito
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debitos.map((debito) => {
                    const cliente = clientes.find((c) => c.id === debito.clienteId)
                    const servico = servicos.find((s) => s.id === debito.servicoId)
                    return (
                      <TableRow key={debito.id}>
                        <TableCell>{cliente?.nome || "Cliente não encontrado"}</TableCell>
                        <TableCell>{getDebitoSource(debito, servico)}</TableCell>
                        <TableCell>R$ {debito.valor.toFixed(2)}</TableCell>
                        <TableCell>{new Date(debito.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{getStatusLabel(debito.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {debito.status !== "pago" && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePagar(debito.id)}
                                title="Marcar como pago"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(debito)}
                              disabled={debito.status === "pago"}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(debito.id)}>
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

