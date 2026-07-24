export function formatCurrency(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(n) ? n : 0)
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  // aceita 'yyyy-MM-dd' ou datetime ISO
  const datePart = iso.length > 10 ? iso : `${iso}T00:00:00`
  const d = new Date(datePart)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

// campos derivados de estoque/validade (calculados no front pois a entidade os expõe via getters)
export function isEstoqueBaixo(m: { quantidade: number; quantidadeMinima: number }): boolean {
  return m.quantidade <= m.quantidadeMinima
}

export function isVencido(dataValidade?: string | null): boolean {
  if (!dataValidade) return false
  return new Date(`${dataValidade}T00:00:00`) < new Date(new Date().toDateString())
}

export function isVencendoEmBreve(dataValidade?: string | null, dias = 30): boolean {
  if (!dataValidade) return false
  const limite = new Date()
  limite.setDate(limite.getDate() + dias)
  const validade = new Date(`${dataValidade}T00:00:00`)
  return validade >= new Date(new Date().toDateString()) && validade < limite
}
