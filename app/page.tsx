"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/data"
import { Users, Briefcase, CreditCard, AlertTriangle } from "lucide-react"
import type { Servico } from "@/lib/definitions"

export default function Dashboard() {
  const { clientes, servicos, debitos } = useAppStore()
  const [totalClientes, setTotalClientes] = useState(0)
  const [totalServicos, setTotalServicos] = useState(0)
  const [totalDebitos, setTotalDebitos] = useState(0)
  const [debitosAtrasados, setDebitosAtrasados] = useState(0)
  const [servicosConcluidos, setServicosConcluidos] = useState<Servico[]>([])

  useEffect(() => {
    setTotalClientes(clientes.length)
    setTotalServicos(servicos.length)

    const valorTotalDebitos = debitos.filter((d) => d.status !== "pago").reduce((acc, debito) => acc + debito.valor, 0)

    setTotalDebitos(valorTotalDebitos)

    const hoje = new Date()
    const atrasados = debitos.filter((d) => d.status !== "pago" && new Date(d.dataVencimento) < hoje).length

    setDebitosAtrasados(atrasados)

    // Filtrar serviços concluídos recentemente (últimos 30 dias)
    const umMesAtras = new Date()
    umMesAtras.setDate(umMesAtras.getDate() - 30)

    const servicosConcluidosRecentes = servicos.filter(
      (s) => s.status === "concluido" && new Date(s.dataServico) >= umMesAtras,
    )

    setServicosConcluidos(servicosConcluidosRecentes)
  }, [clientes, servicos, debitos])

  // Verificar e atualizar débitos atrasados
  useEffect(() => {
    const { updateDebito } = useAppStore.getState()
    const hoje = new Date()

    // Atualiza o status de débitos atrasados
    debitos.forEach((debito) => {
      if (debito.status === "pendente" && new Date(debito.dataVencimento) < hoje && !debito.dataPagamento) {
        updateDebito(debito.id, { status: "atrasado" })
      }
    })
  }, [debitos])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServicos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Débitos Pendentes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalDebitos.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Débitos Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{debitosAtrasados}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
            ) : (
              <ul className="space-y-2">
                {clientes
                  .slice(-5)
                  .reverse()
                  .map((cliente) => (
                    <li key={cliente.id} className="flex justify-between border-b pb-2">
                      <span>{cliente.nome}</span>
                      <span className="text-muted-foreground">
                        {new Date(cliente.dataCadastro).toLocaleDateString("pt-BR")}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Débitos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {debitos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum débito registrado</p>
            ) : (
              <ul className="space-y-2">
                {debitos
                  .filter((d) => d.status !== "pago")
                  .slice(-5)
                  .reverse()
                  .map((debito) => {
                    const cliente = clientes.find((c) => c.id === debito.clienteId)
                    return (
                      <li key={debito.id} className="flex justify-between border-b pb-2">
                        <span>{cliente?.nome || "Cliente não encontrado"}</span>
                        <span className="font-medium">R$ {debito.valor.toFixed(2)}</span>
                      </li>
                    )
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Serviços Concluídos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {servicosConcluidos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum serviço concluído recentemente</p>
            ) : (
              <ul className="space-y-2">
                {servicosConcluidos
                  .slice(-5)
                  .reverse()
                  .map((servico) => {
                    const cliente = clientes.find((c) => c.id === servico.clienteId)
                    return (
                      <li key={servico.id} className="flex justify-between border-b pb-2">
                        <div>
                          <span className="font-medium">{cliente?.nome || "Cliente não encontrado"}</span>
                          <span className="block text-sm text-muted-foreground">{servico.descricao}</span>
                        </div>
                        <span className="font-medium">R$ {servico.valor.toFixed(2)}</span>
                      </li>
                    )
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

