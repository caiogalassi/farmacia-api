import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  X,
  Check,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { medicamentosApi } from '@/api/medicamentos'
import { clientesApi } from '@/api/clientes'
import { vendasApi } from '@/api/vendas'
import { getErrorMessage } from '@/api/client'
import { formatCurrency } from '@/lib/format'
import {
  FORMAS_PAGAMENTO,
  type Cliente,
  type FormaPagamento,
  type Medicamento,
} from '@/types'

interface CartItem {
  medicamento: Medicamento
  quantidade: number
}

export function NovaVenda() {
  const toast = useToast()
  const navigate = useNavigate()

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const [cart, setCart] = useState<CartItem[]>([])
  const [clienteId, setClienteId] = useState<string>('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('DINHEIRO')
  const [descontoInput, setDescontoInput] = useState('')
  const [observacao, setObservacao] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    medicamentosApi.listar().then(setMedicamentos).catch(() => {})
    clientesApi.listar().then(setClientes).catch(() => {})
  }, [])

  // fecha resultados ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const resultados = useMemo(() => {
    if (!busca.trim()) return []
    const q = busca.toLowerCase()
    return medicamentos
      .filter(
        (m) =>
          m.nome.toLowerCase().includes(q) ||
          m.principioAtivo.toLowerCase().includes(q) ||
          (m.codigoBarras ?? '').includes(busca),
      )
      .slice(0, 8)
  }, [busca, medicamentos])

  function addItem(m: Medicamento) {
    setCart((prev) => {
      const existe = prev.find((i) => i.medicamento.id === m.id)
      if (existe) {
        if (existe.quantidade >= m.quantidade) {
          toast.error(`Estoque insuficiente para ${m.nome} (${m.quantidade} un.).`)
          return prev
        }
        return prev.map((i) =>
          i.medicamento.id === m.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        )
      }
      if (m.quantidade < 1) {
        toast.error(`${m.nome} sem estoque.`)
        return prev
      }
      return [...prev, { medicamento: m, quantidade: 1 }]
    })
    setBusca('')
    setShowResults(false)
  }

  function setQtd(id: number, qtd: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.medicamento.id !== id) return i
          const max = i.medicamento.quantidade
          const nova = Math.max(0, Math.min(qtd, max))
          if (qtd > max) toast.error(`Estoque máximo: ${max} un.`)
          return { ...i, quantidade: nova }
        })
        .filter((i) => i.quantidade > 0),
    )
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((i) => i.medicamento.id !== id))
  }

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + Number(i.medicamento.preco) * i.quantidade, 0),
    [cart],
  )
  const desconto = Math.min(Number(descontoInput) || 0, subtotal)
  const total = subtotal - desconto

  async function finalizar() {
    if (cart.length === 0) {
      toast.error('Adicione ao menos um item.')
      return
    }
    setSaving(true)
    try {
      const venda = await vendasApi.criar({
        clienteId: clienteId ? Number(clienteId) : null,
        itens: cart.map((i) => ({
          medicamentoId: i.medicamento.id,
          quantidade: i.quantidade,
        })),
        desconto,
        formaPagamento,
        observacao: observacao.trim() || undefined,
      })
      toast.success(`Venda #${venda.id} registrada com sucesso!`)
      navigate('/vendas')
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Nova venda" subtitle="Ponto de venda (PDV)" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: busca + carrinho */}
        <div className="space-y-4 lg:col-span-2">
          <div ref={searchRef} className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Buscar medicamento por nome, princípio ativo ou código de barras…"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            {showResults && resultados.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {resultados.map((m) => {
                  const semEstoque = m.quantidade < 1
                  return (
                    <button
                      key={m.id}
                      onClick={() => addItem(m)}
                      disabled={semEstoque}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.nome}</p>
                        <p className="text-xs text-slate-400">
                          {m.principioAtivo} • {m.categoria}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">
                          {formatCurrency(m.preco)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {semEstoque ? (
                            <span className="text-red-500">sem estoque</span>
                          ) : (
                            `${m.quantidade} em estoque`
                          )}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <Card>
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="size-10" />}
                title="Carrinho vazio"
                description="Busque e adicione medicamentos para iniciar a venda."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {cart.map((i) => (
                  <li key={i.medicamento.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {i.medicamento.nome}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(i.medicamento.preco)} un.
                        {i.medicamento.requerReceita && (
                          <Badge tone="amber">receita</Badge>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQtd(i.medicamento.id, i.quantidade - 1)}
                        className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <input
                        value={i.quantidade}
                        onChange={(e) =>
                          setQtd(i.medicamento.id, Number(e.target.value) || 0)
                        }
                        className="w-12 rounded-md border border-slate-200 py-1 text-center text-sm"
                      />
                      <button
                        onClick={() => setQtd(i.medicamento.id, i.quantidade + 1)}
                        className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="w-24 text-right text-sm font-semibold text-slate-700">
                      {formatCurrency(Number(i.medicamento.preco) * i.quantidade)}
                    </div>
                    <button
                      onClick={() => removeItem(i.medicamento.id)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Coluna direita: resumo */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-5">
            <h3 className="mb-4 font-semibold text-slate-800">Resumo da venda</h3>

            <div className="space-y-4">
              <Select
                label="Cliente (opcional)"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">Consumidor final</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>

              <Select
                label="Forma de pagamento"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={descontoInput}
                  onChange={(e) => setDescontoInput(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <Textarea
                label="Observação"
                rows={2}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <div className="my-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Desconto</span>
                <span>−{formatCurrency(desconto)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-lg font-bold text-slate-800">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                onClick={finalizar}
                loading={saving}
                disabled={cart.length === 0}
              >
                <Check className="size-5" />
                Finalizar venda
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCart([])
                  setDescontoInput('')
                  setObservacao('')
                }}
                disabled={cart.length === 0}
              >
                <X className="size-4" />
                Limpar carrinho
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
