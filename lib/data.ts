"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { firestore } from "@/services/Firebase";

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
  loadClientes: () => void
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

      addCliente: async (cliente) => {
        const newCliente = {
          ...cliente,
          id: crypto.randomUUID(),
          dataCadastro: new Date().toISOString(),
        };

        // Salva localmente
        set((state) => ({
          clientes: [...state.clientes, newCliente],
        }));

        // Salva no Firestore
        try {
          await setDoc(doc(firestore, "clientes", newCliente.id), newCliente);
        } catch (error) {
          console.error("Erro ao salvar cliente no Firestore:", error);
        }
      },

      // Função para carregar os clientes do Firestore
      loadClientes: async () => {
        try {
          const querySnapshot = await getDocs(collection(firestore, "clientes"));
          const clientes = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Cliente[];

          set({ clientes });
        } catch (error) {
          console.error("Erro ao carregar clientes do Firestore:", error);
        }
      },

      updateCliente: async (id, cliente) => {
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...cliente } : c)),
        }))

        try {
          //cria a referencia do cliente no firestore
          const clienteRef = doc(firestore, "clientes", id);
          //atualiza o cliente
          await setDoc(clienteRef, cliente, { merge: true });
        } catch (error) {
          console.error("Erro ao atualizar cliente no Firestore:", error);
        }
      },

      deleteCliente: async (id) =>{
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
          servicos: state.servicos.filter((s) => s.clienteId !== id),
          debitos: state.debitos.filter((d) => d.clienteId !== id),
        }))

        try {
          //cria a referencia do cliente no firestore
          const clienteRef = doc(firestore, "clientes", id);
          //deleta o cliente
          deleteDoc(clienteRef);
        } catch (error) {
          console.error("Erro ao deletar cliente no Firestore:", error);
        }
      },

      addServico: (servico) =>
        set((state) => {
          const novoServico = {
            ...servico,
            id: crypto.randomUUID(),
          };

          if (servico.status === "concluido") {
            const dataVencimento = new Date();
            dataVencimento.setDate(dataVencimento.getDate() + 30);

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
            };
          }

          return {
            servicos: [...state.servicos, novoServico],
          };
        }),

      updateServico: (id: string, servico: Partial<Servico>) =>
        set((state) => {
          const servicoAtual = state.servicos.find((s) => s.id === id);
          const servicosAtualizados = state.servicos.map((s) => (s.id === id ? { ...s, ...servico } : s));

          if (servicoAtual && servico.status === "concluido" && servicoAtual.status !== "concluido") {
            const servicoCompleto = servicosAtualizados.find((s) => s.id === id)!;

            const dataVencimento = new Date();
            dataVencimento.setDate(dataVencimento.getDate() + 30);

            const debitoExistente = state.debitos.some((d) => d.servicoId === id);

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
              };
            }
          }

          return {
            servicos: servicosAtualizados,
          };
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

      setClientes: (clientes) => set({ clientes }),
      setServicos: (servicos) => set({ servicos }),
      setDebitos: (debitos) => set({ debitos }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        clientes: state.clientes,
        servicos: state.servicos,
        debitos: state.debitos,
      }),
    },
  ),
);

