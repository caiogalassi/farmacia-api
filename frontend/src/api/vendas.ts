import { api } from './client'
import type { ResumoFinanceiro, Venda, VendaInput } from '@/types'

export const vendasApi = {
  listar: (params?: { clienteId?: number; inicio?: string; fim?: string }) =>
    api.get<Venda[]>('/vendas', { params }).then((r) => r.data),

  buscar: (id: number) => api.get<Venda>(`/vendas/${id}`).then((r) => r.data),

  criar: (data: VendaInput) =>
    api.post<Venda>('/vendas', data).then((r) => r.data),

  cancelar: (id: number) =>
    api.patch<Venda>(`/vendas/${id}/cancelar`).then((r) => r.data),
}

export const financeiroApi = {
  resumo: (inicio?: string, fim?: string) =>
    api
      .get<ResumoFinanceiro>('/financeiro/resumo', { params: { inicio, fim } })
      .then((r) => r.data),

  hoje: () =>
    api.get<ResumoFinanceiro>('/financeiro/hoje').then((r) => r.data),
}
