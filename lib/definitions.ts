export type Servico = {
  id: string
  clienteId: string
  descricao: string
  valor: number
  dataServico: string
  status: "pendente" | "concluido" | "cancelado"
}

