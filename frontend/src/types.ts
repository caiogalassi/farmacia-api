// ==================== Tipos espelhando a API Spring Boot ====================

export interface Medicamento {
  id: number
  nome: string
  principioAtivo: string
  categoria: string
  fabricante?: string | null
  quantidade: number
  quantidadeMinima: number
  preco: number
  dataValidade?: string | null // ISO date (yyyy-MM-dd)
  codigoBarras?: string | null
  requerReceita: boolean
  criadoEm?: string
  atualizadoEm?: string
}

// Payload de criação/edição (sem campos derivados)
export type MedicamentoInput = {
  nome: string
  principioAtivo: string
  categoria: string
  fabricante?: string
  quantidade: number
  quantidadeMinima?: number
  preco: number
  dataValidade?: string | null
  codigoBarras?: string
  requerReceita?: boolean
}

export interface Cliente {
  id: number
  nome: string
  cpf: string
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  dataNascimento?: string | null
  criadoEm?: string
  atualizadoEm?: string
}

export type ClienteInput = {
  nome: string
  cpf: string
  email?: string
  telefone?: string
  endereco?: string
  dataNascimento?: string | null
}

export type FormaPagamento = 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX'
export type StatusVenda = 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA'

export interface ItemVenda {
  id: number
  medicamento: Medicamento
  quantidade: number
  precoUnitario: number
  subtotal?: number
}

export interface Venda {
  id: number
  cliente?: Cliente | null
  itens: ItemVenda[]
  valorTotal: number
  desconto: number
  formaPagamento: FormaPagamento
  status: StatusVenda
  observacao?: string | null
  criadoEm: string
  atualizadoEm?: string
  valorLiquido?: number
}

export type VendaInput = {
  clienteId?: number | null
  itens: { medicamentoId: number; quantidade: number }[]
  desconto?: number
  formaPagamento: FormaPagamento
  observacao?: string
}

export interface ResumoFinanceiro {
  totalVendas: number
  quantidadeVendas: number
  ticketMedio: number
  periodo: { inicio: string; fim: string }
}

export const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de crédito' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de débito' },
  { value: 'PIX', label: 'PIX' },
]
