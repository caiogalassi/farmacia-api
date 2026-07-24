import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Ban, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { vendasApi } from '@/api/vendas'
import { getErrorMessage } from '@/api/client'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { FORMAS_PAGAMENTO, type StatusVenda, type Venda } from '@/types'

const statusTone: Record<StatusVenda, 'green' | 'red' | 'amber'> = {
  CONCLUIDA: 'green',
  CANCELADA: 'red',
  PENDENTE: 'amber',
}
const statusLabel: Record<StatusVenda, string> = {
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  PENDENTE: 'Pendente',
}

function pagamentoLabel(v: string) {
  return FORMAS_PAGAMENTO.find((f) => f.value === v)?.label ?? v
}

export function Vendas() {
  const toast = useToast()
  const [items, setItems] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandida, setExpandida] = useState<number | null>(null)
  const [cancelar, setCancelar] = useState<Venda | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusVenda | 'TODOS'>('TODOS')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await vendasApi.listar()
      // mais recentes primeiro
      data.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
      setItems(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtrados = useMemo(
    () =>
      filtroStatus === 'TODOS'
        ? items
        : items.filter((v) => v.status === filtroStatus),
    [items, filtroStatus],
  )

  async function handleCancelar() {
    if (!cancelar) return
    try {
      await vendasApi.cancelar(cancelar.id)
      toast.success('Venda cancelada e estoque estornado.')
      setCancelar(null)
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Histórico de vendas"
        action={
          <Link to="/vendas/nova">
            <Button>
              <Plus className="size-4" />
              Nova venda
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 sm:w-fit">
        {(['TODOS', 'CONCLUIDA', 'PENDENTE', 'CANCELADA'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none ${
              filtroStatus === s
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {s === 'TODOS' ? 'Todas' : statusLabel[s]}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="size-10" />}
            title="Nenhuma venda registrada"
            description="Registre a primeira venda no PDV."
            action={
              <Link to="/vendas/nova">
                <Button>
                  <Plus className="size-4" />
                  Nova venda
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtrados.map((v) => {
              const aberta = expandida === v.id
              const liquido = Number(v.valorTotal) - Number(v.desconto ?? 0)
              return (
                <div key={v.id}>
                  <button
                    onClick={() => setExpandida(aberta ? null : v.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/60"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
                      #{v.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-800">
                        {v.cliente?.nome ?? 'Consumidor final'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(v.criadoEm)} • {v.itens?.length ?? 0} item(ns) •{' '}
                        {pagamentoLabel(v.formaPagamento)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(liquido)}
                      </p>
                      <Badge tone={statusTone[v.status]}>{statusLabel[v.status]}</Badge>
                    </div>
                    {aberta ? (
                      <ChevronUp className="size-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="size-5 text-slate-400" />
                    )}
                  </button>

                  {aberta && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase text-slate-400">
                            <th className="pb-2 font-medium">Item</th>
                            <th className="pb-2 text-center font-medium">Qtd.</th>
                            <th className="pb-2 text-right font-medium">Unit.</th>
                            <th className="pb-2 text-right font-medium">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.itens?.map((it) => (
                            <tr key={it.id} className="border-t border-slate-100">
                              <td className="py-2 text-slate-700">
                                {it.medicamento?.nome ?? '—'}
                              </td>
                              <td className="py-2 text-center text-slate-600">
                                {it.quantidade}
                              </td>
                              <td className="py-2 text-right text-slate-600">
                                {formatCurrency(it.precoUnitario)}
                              </td>
                              <td className="py-2 text-right font-medium text-slate-700">
                                {formatCurrency(
                                  Number(it.precoUnitario) * it.quantidade,
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="mt-3 flex flex-col items-end gap-0.5 text-sm">
                        <span className="text-slate-500">
                          Subtotal: {formatCurrency(v.valorTotal)}
                        </span>
                        {Number(v.desconto) > 0 && (
                          <span className="text-slate-500">
                            Desconto: −{formatCurrency(v.desconto)}
                          </span>
                        )}
                        <span className="text-base font-semibold text-slate-800">
                          Total: {formatCurrency(liquido)}
                        </span>
                      </div>

                      {v.observacao && (
                        <p className="mt-2 text-xs text-slate-500">Obs.: {v.observacao}</p>
                      )}

                      {v.status !== 'CANCELADA' && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCancelar(v)}
                          >
                            <Ban className="size-4 text-red-500" />
                            Cancelar venda
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        open={!!cancelar}
        onClose={() => setCancelar(null)}
        title="Cancelar venda"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelar(null)}>
              Voltar
            </Button>
            <Button variant="danger" onClick={handleCancelar}>
              Cancelar venda
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Cancelar a venda <strong>#{cancelar?.id}</strong>? O estoque dos itens será
          estornado automaticamente.
        </p>
      </Modal>
    </div>
  )
}
