import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  PackagePlus,
  FileWarning,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { medicamentosApi } from '@/api/medicamentos'
import { getErrorMessage } from '@/api/client'
import {
  formatCurrency,
  formatDate,
  isEstoqueBaixo,
  isVencido,
  isVencendoEmBreve,
} from '@/lib/format'
import type { Medicamento, MedicamentoInput } from '@/types'
import { MedicamentoForm } from './MedicamentoForm'

type Filtro = 'todos' | 'estoque-baixo' | 'vencendo' | 'vencidos'

export function Medicamentos() {
  const toast = useToast()
  const [items, setItems] = useState<Medicamento[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState<Medicamento | null>(null)
  const [excluir, setExcluir] = useState<Medicamento | null>(null)
  const [estoqueAlvo, setEstoqueAlvo] = useState<Medicamento | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      let data: Medicamento[]
      if (filtro === 'estoque-baixo') data = await medicamentosApi.estoqueBaixo()
      else if (filtro === 'vencendo') data = await medicamentosApi.vencendo(30)
      else if (filtro === 'vencidos') data = await medicamentosApi.vencidos()
      else data = await medicamentosApi.listar()
      setItems(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro])

  useEffect(() => {
    medicamentosApi.categorias().then(setCategorias).catch(() => {})
  }, [])

  const filtrados = useMemo(() => {
    return items.filter((m) => {
      const matchBusca =
        !busca ||
        m.nome.toLowerCase().includes(busca.toLowerCase()) ||
        m.principioAtivo.toLowerCase().includes(busca.toLowerCase())
      const matchCat = !categoria || m.categoria === categoria
      return matchBusca && matchCat
    })
  }, [items, busca, categoria])

  async function handleSave(data: MedicamentoInput) {
    if (editando) {
      await medicamentosApi.atualizar(editando.id, data)
      toast.success('Medicamento atualizado.')
    } else {
      await medicamentosApi.criar(data)
      toast.success('Medicamento cadastrado.')
    }
    setFormOpen(false)
    setEditando(null)
    load()
    medicamentosApi.categorias().then(setCategorias).catch(() => {})
  }

  async function handleDelete() {
    if (!excluir) return
    try {
      await medicamentosApi.excluir(excluir.id)
      toast.success('Medicamento excluído.')
      setExcluir(null)
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div>
      <PageHeader
        title="Medicamentos"
        subtitle="Gerencie o catálogo e o estoque"
        action={
          <Button
            onClick={() => {
              setEditando(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Novo medicamento
          </Button>
        }
      />

      {/* Filtros */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou princípio ativo…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Todas categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(
            [
              ['todos', 'Todos'],
              ['estoque-baixo', 'Estoque baixo'],
              ['vencendo', 'Vencendo'],
              ['vencidos', 'Vencidos'],
            ] as [Filtro, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filtro === key
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : filtrados.length === 0 ? (
          <EmptyState
            title="Nenhum medicamento encontrado"
            description="Ajuste os filtros ou cadastre um novo medicamento."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Medicamento</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Estoque</th>
                  <th className="px-5 py-3 font-medium">Preço</th>
                  <th className="px-5 py-3 font-medium">Validade</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{m.nome}</p>
                      <p className="text-xs text-slate-400">
                        {m.principioAtivo}
                        {m.requerReceita && (
                          <span className="ml-2 text-amber-600">• receita</span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{m.categoria}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          isEstoqueBaixo(m)
                            ? 'font-semibold text-amber-600'
                            : 'text-slate-700'
                        }
                      >
                        {m.quantidade}
                      </span>
                      <span className="text-xs text-slate-400"> / {m.quantidadeMinima}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {formatCurrency(m.preco)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(m.dataValidade)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadges m={m} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn
                          title="Ajustar estoque"
                          onClick={() => setEstoqueAlvo(m)}
                        >
                          <PackagePlus className="size-4" />
                        </IconBtn>
                        <IconBtn
                          title="Editar"
                          onClick={() => {
                            setEditando(m)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </IconBtn>
                        <IconBtn
                          title="Excluir"
                          danger
                          onClick={() => setExcluir(m)}
                        >
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal form */}
      <MedicamentoForm
        open={formOpen}
        medicamento={editando}
        categorias={categorias}
        onClose={() => {
          setFormOpen(false)
          setEditando(null)
        }}
        onSave={handleSave}
      />

      {/* Ajuste de estoque */}
      <AjusteEstoqueModal
        medicamento={estoqueAlvo}
        onClose={() => setEstoqueAlvo(null)}
        onDone={() => {
          setEstoqueAlvo(null)
          load()
        }}
      />

      {/* Confirmar exclusão */}
      <Modal
        open={!!excluir}
        onClose={() => setExcluir(null)}
        title="Excluir medicamento"
        footer={
          <>
            <Button variant="outline" onClick={() => setExcluir(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <FileWarning className="size-6 shrink-0 text-red-500" />
          <p className="text-sm text-slate-600">
            Tem certeza que deseja excluir{' '}
            <strong className="text-slate-800">{excluir?.nome}</strong>? Essa ação não pode
            ser desfeita.
          </p>
        </div>
      </Modal>
    </div>
  )
}

function StatusBadges({ m }: { m: Medicamento }) {
  const badges: React.ReactNode[] = []
  if (isVencido(m.dataValidade)) badges.push(<Badge key="v" tone="red">Vencido</Badge>)
  else if (isVencendoEmBreve(m.dataValidade))
    badges.push(<Badge key="vb" tone="amber">Vencendo</Badge>)
  if (isEstoqueBaixo(m))
    badges.push(<Badge key="e" tone="amber">Estoque baixo</Badge>)
  if (badges.length === 0) return <Badge tone="green">OK</Badge>
  return <div className="flex flex-wrap gap-1">{badges}</div>
}

function IconBtn({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${
        danger
          ? 'text-slate-400 hover:bg-red-50 hover:text-red-600'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

function AjusteEstoqueModal({
  medicamento,
  onClose,
  onDone,
}: {
  medicamento: Medicamento | null
  onClose: () => void
  onDone: () => void
}) {
  const toast = useToast()
  const [delta, setDelta] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDelta('')
  }, [medicamento])

  if (!medicamento) return null

  const valor = Number(delta) || 0
  const resultado = medicamento.quantidade + valor

  async function submit() {
    if (!medicamento || valor === 0) return
    setSaving(true)
    try {
      await medicamentosApi.ajustarEstoque(medicamento.id, valor)
      toast.success('Estoque ajustado.')
      onDone()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!medicamento}
      onClose={onClose}
      title="Ajustar estoque"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={saving} disabled={valor === 0 || resultado < 0}>
            Confirmar
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        {medicamento.nome} — estoque atual:{' '}
        <strong>{medicamento.quantidade} un.</strong>
      </p>
      <div className="mb-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setDelta(String(valor - 1))}>
          −1
        </Button>
        <Input
          type="number"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="Ex.: 10 ou -5"
          className="text-center"
        />
        <Button variant="outline" size="sm" onClick={() => setDelta(String(valor + 1))}>
          +1
        </Button>
      </div>
      <p className="text-sm text-slate-500">
        Novo estoque:{' '}
        <strong className={resultado < 0 ? 'text-red-600' : 'text-slate-800'}>
          {resultado} un.
        </strong>
      </p>
    </Modal>
  )
}
