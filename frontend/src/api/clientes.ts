import { api } from './client'
import type { Cliente, ClienteInput } from '@/types'

export const clientesApi = {
  listar: (nome?: string) =>
    api
      .get<Cliente[]>('/clientes', { params: nome ? { nome } : undefined })
      .then((r) => r.data),

  buscar: (id: number) =>
    api.get<Cliente>(`/clientes/${id}`).then((r) => r.data),

  buscarPorCpf: (cpf: string) =>
    api.get<Cliente>(`/clientes/cpf/${cpf}`).then((r) => r.data),

  criar: (data: ClienteInput) =>
    api.post<Cliente>('/clientes', data).then((r) => r.data),

  atualizar: (id: number, data: ClienteInput) =>
    api.put<Cliente>(`/clientes/${id}`, data).then((r) => r.data),

  excluir: (id: number) =>
    api.delete(`/clientes/${id}`).then((r) => r.data),
}
