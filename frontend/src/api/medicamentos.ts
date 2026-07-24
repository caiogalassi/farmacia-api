import { api } from './client'
import type { Medicamento, MedicamentoInput } from '@/types'

export const medicamentosApi = {
  listar: (params?: { nome?: string; categoria?: string }) =>
    api.get<Medicamento[]>('/medicamentos', { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<Medicamento>(`/medicamentos/${id}`).then((r) => r.data),

  estoqueBaixo: () =>
    api.get<Medicamento[]>('/medicamentos/estoque-baixo').then((r) => r.data),

  vencendo: (dias = 30) =>
    api
      .get<Medicamento[]>('/medicamentos/vencendo', { params: { dias } })
      .then((r) => r.data),

  vencidos: () =>
    api.get<Medicamento[]>('/medicamentos/vencidos').then((r) => r.data),

  categorias: () =>
    api.get<string[]>('/medicamentos/categorias').then((r) => r.data),

  criar: (data: MedicamentoInput) =>
    api.post<Medicamento>('/medicamentos', data).then((r) => r.data),

  atualizar: (id: number, data: MedicamentoInput) =>
    api.put<Medicamento>(`/medicamentos/${id}`, data).then((r) => r.data),

  ajustarEstoque: (id: number, quantidade: number) =>
    api.patch(`/medicamentos/${id}/estoque`, { quantidade }).then((r) => r.data),

  excluir: (id: number) =>
    api.delete(`/medicamentos/${id}`).then((r) => r.data),
}
