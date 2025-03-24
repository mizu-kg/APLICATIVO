"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Cliente = {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  dataCadastro: string
}

export type Servico = {
  id: string
  clienteId: string
  descricao: string
  valor: number
  dataServico: string
  status: "pendente" | "concluido" | "cancelado"
}

export type Debito = {
  id: string
  clienteId: string
  servicoId: string
  valor: number
  dataVencimento: string
  dataPagamento: string | null
  status: "pendente" | "pago" | "atrasado"
}

type AppState = {
  clientes: Cliente[]
  servicos: Servico[]
  debitos: Debito[]
  addCliente: (cliente: Omit<Cliente, "id" | "dataCadastro">) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  deleteCliente: (id: string) => void
  addServico: (servico: Omit<Servico, "id">) => void
  updateServico: (id: string, servico: Partial<Servico>) => void
  deleteServico: (id: string) => void
  addDebito: (debito: Omit<Debito, "id">) => void
  updateDebito: (id: string, debito: Partial<Debito>) => void
  deleteDebito: (id: string) => void
  pagarDebito: (id: string) => void
  // Novas funções para backup e restauração
  setClientes: (clientes: Cliente[]) => void
  setServicos: (servicos: Servico[]) => void
  setDebitos: (debitos: Debito[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      clientes: [],
      servicos: [],
      debitos: [],

      addCliente: (cliente) =>
        set((state) => ({
          clientes: [
            ...state.clientes,
            {
              ...cliente,
              id: crypto.randomUUID(),
              dataCadastro: new Date().toISOString(),
            },
          ],
        })),

      updateCliente: (id, cliente) =>
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...cliente } : c)),
        })),

      deleteCliente: (id) =>
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
          servicos: state.servicos.filter((s) => s.clienteId !== id),
          debitos: state.debitos.filter((d) => d.clienteId !== id),
        })),

      addServico: (servico) =>
        set((state) => {
          const novoServico = {
            ...servico,
            id: crypto.randomUUID(),
          }

          // Se o serviço já for criado como concluído, gera um débito automaticamente
          if (servico.status === "concluido") {
            const dataVencimento = new Date()
            dataVencimento.setDate(dataVencimento.getDate() + 30)

            return {
              servicos: [...state.servicos, novoServico],
              debitos: [
                ...state.debitos,
                {
                  id: crypto.randomUUID(),
                  clienteId: servico.clienteId,
                  servicoId: novoServico.id,
                  valor: servico.valor,
                  dataVencimento: dataVencimento.toISOString(),
                  dataPagamento: null,
                  status: "pendente",
                },
              ],
            }
          }

          return {
            servicos: [...state.servicos, novoServico],
          }
        }),

      updateServico: (id: string, servico: Partial<Servico>) =>
        set((state) => {
          const servicoAtual = state.servicos.find((s) => s.id === id)
          const servicosAtualizados = state.servicos.map((s) => (s.id === id ? { ...s, ...servico } : s))

          // Verifica se o status está sendo alterado para "concluido"
          if (servicoAtual && servico.status === "concluido" && servicoAtual.status !== "concluido") {
            const servicoCompleto = servicosAtualizados.find((s) => s.id === id)!

            // Calcula a data de vencimento (30 dias após a conclusão)
            const dataVencimento = new Date()
            dataVencimento.setDate(dataVencimento.getDate() + 30)

            // Verifica se já existe um débito para este serviço
            const debitoExistente = state.debitos.some((d) => d.servicoId === id)

            // Se não existir débito, cria um novo
            if (!debitoExistente) {
              return {
                servicos: servicosAtualizados,
                debitos: [
                  ...state.debitos,
                  {
                    id: crypto.randomUUID(),
                    clienteId: servicoCompleto.clienteId,
                    servicoId: servicoCompleto.id,
                    valor: servicoCompleto.valor,
                    dataVencimento: dataVencimento.toISOString(),
                    dataPagamento: null,
                    status: "pendente",
                  },
                ],
              }
            }
          }

          return {
            servicos: servicosAtualizados,
          }
        }),

      deleteServico: (id) =>
        set((state) => ({
          servicos: state.servicos.filter((s) => s.id !== id),
          debitos: state.debitos.filter((d) => d.servicoId !== id),
        })),

      addDebito: (debito) =>
        set((state) => ({
          debitos: [
            ...state.debitos,
            {
              ...debito,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateDebito: (id, debito) =>
        set((state) => ({
          debitos: state.debitos.map((d) => (d.id === id ? { ...d, ...debito } : d)),
        })),

      deleteDebito: (id) =>
        set((state) => ({
          debitos: state.debitos.filter((d) => d.id !== id),
        })),

      pagarDebito: (id) =>
        set((state) => ({
          debitos: state.debitos.map((d) =>
            d.id === id ? { ...d, dataPagamento: new Date().toISOString(), status: "pago" } : d,
          ),
        })),

      // Funções para backup e restauração
      setClientes: (clientes) => set({ clientes }),
      setServicos: (servicos) => set({ servicos }),
      setDebitos: (debitos) => set({ debitos }),
    }),
    {
      name: "app-storage",
      // Configurações adicionais para garantir persistência
      partialize: (state) => ({
        clientes: state.clientes,
        servicos: state.servicos,
        debitos: state.debitos,
      }),
    },
  ),
)

