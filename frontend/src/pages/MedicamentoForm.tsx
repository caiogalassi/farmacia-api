import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { getErrorMessage } from '@/api/client'
import type { Medicamento, MedicamentoInput } from '@/types'

interface Props {
  open: boolean
  medicamento: Medicamento | null
  categorias: string[]
  onClose: () => void
  onSave: (data: MedicamentoInput) => Promise<void>
}

const CATEGORIAS_PADRAO = [
  'Analgésico',
  'Antibiótico',
  'Anti-inflamatório',
  'Antialérgico',
  'Antitérmico',
  'Vitamina',
  'Dermatológico',
  'Genérico',
  'Higiene',
  'Outros',
]

type FormState = {
  nome: string
  principioAtivo: string
  categoria: string
  fabricante: string
  quantidade: string
  quantidadeMinima: string
  preco: string
  dataValidade: string
  codigoBarras: string
  requerReceita: boolean
}

const vazio: FormState = {
  nome: '',
  principioAtivo: '',
  categoria: '',
  fabricante: '',
  quantidade: '',
  quantidadeMinima: '10',
  preco: '',
  dataValidade: '',
  codigoBarras: '',
  requerReceita: false,
}

export function MedicamentoForm({ open, medicamento, categorias, onClose, onSave }: Props) {
  const toast = useToast()
  const [form, setForm] = useState<FormState>(vazio)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (medicamento) {
      setForm({
        nome: medicamento.nome,
        principioAtivo: medicamento.principioAtivo,
        categoria: medicamento.categoria,
        fabricante: medicamento.fabricante ?? '',
        quantidade: String(medicamento.quantidade),
        quantidadeMinima: String(medicamento.quantidadeMinima ?? 10),
        preco: String(medicamento.preco),
        dataValidade: medicamento.dataValidade ?? '',
        codigoBarras: medicamento.codigoBarras ?? '',
        requerReceita: medicamento.requerReceita,
      })
    } else {
      setForm(vazio)
    }
    setErrors({})
  }, [open, medicamento])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome'
    if (!form.principioAtivo.trim()) e.principioAtivo = 'Informe o princípio ativo'
    if (!form.categoria.trim()) e.categoria = 'Selecione a categoria'
    if (form.quantidade === '' || Number(form.quantidade) < 0)
      e.quantidade = 'Quantidade inválida'
    if (form.preco === '' || Number(form.preco) < 0.01)
      e.preco = 'Preço deve ser maior que zero'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload: MedicamentoInput = {
        nome: form.nome.trim(),
        principioAtivo: form.principioAtivo.trim(),
        categoria: form.categoria.trim(),
        fabricante: form.fabricante.trim() || undefined,
        quantidade: Number(form.quantidade),
        quantidadeMinima: form.quantidadeMinima ? Number(form.quantidadeMinima) : undefined,
        preco: Number(form.preco),
        dataValidade: form.dataValidade || null,
        codigoBarras: form.codigoBarras.trim() || undefined,
        requerReceita: form.requerReceita,
      }
      await onSave(payload)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const listaCategorias = Array.from(
    new Set([...CATEGORIAS_PADRAO, ...categorias]),
  ).sort()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={medicamento ? 'Editar medicamento' : 'Novo medicamento'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" form="med-form" loading={saving}>
            {medicamento ? 'Salvar alterações' : 'Cadastrar'}
          </Button>
        </>
      }
    >
      <form id="med-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nome"
          required
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          error={errors.nome}
          placeholder="Ex.: Dipirona 500mg"
        />
        <Input
          label="Princípio ativo"
          required
          value={form.principioAtivo}
          onChange={(e) => set('principioAtivo', e.target.value)}
          error={errors.principioAtivo}
          placeholder="Ex.: Dipirona sódica"
        />
        <Select
          label="Categoria"
          required
          value={form.categoria}
          onChange={(e) => set('categoria', e.target.value)}
          error={errors.categoria}
        >
          <option value="">Selecione…</option>
          {listaCategorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          label="Fabricante"
          value={form.fabricante}
          onChange={(e) => set('fabricante', e.target.value)}
          placeholder="Ex.: EMS"
        />
        <Input
          label="Quantidade em estoque"
          required
          type="number"
          min={0}
          value={form.quantidade}
          onChange={(e) => set('quantidade', e.target.value)}
          error={errors.quantidade}
        />
        <Input
          label="Estoque mínimo"
          type="number"
          min={0}
          value={form.quantidadeMinima}
          onChange={(e) => set('quantidadeMinima', e.target.value)}
          hint="Alerta de estoque baixo abaixo deste valor"
        />
        <Input
          label="Preço (R$)"
          required
          type="number"
          step="0.01"
          min={0}
          value={form.preco}
          onChange={(e) => set('preco', e.target.value)}
          error={errors.preco}
        />
        <Input
          label="Data de validade"
          type="date"
          value={form.dataValidade}
          onChange={(e) => set('dataValidade', e.target.value)}
        />
        <Input
          label="Código de barras"
          value={form.codigoBarras}
          onChange={(e) => set('codigoBarras', e.target.value)}
          placeholder="Opcional"
        />
        <label className="flex items-center gap-2 self-end pb-2.5">
          <input
            type="checkbox"
            checked={form.requerReceita}
            onChange={(e) => set('requerReceita', e.target.checked)}
            className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">Requer receita médica</span>
        </label>
      </form>
    </Modal>
  )
}
