import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  Users,
  Pill,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingBlock, ErrorBlock } from '@/components/ui/States'
import { financeiroApi } from '@/api/vendas'
import { medicamentosApi } from '@/api/medicamentos'
import { clientesApi } from '@/api/clientes'
import { getErrorMessage } from '@/api/client'
import { formatCurrency } from '@/lib/format'
import type { Medicamento, ResumoFinanceiro } from '@/types'

interface DashData {
  hoje: ResumoFinanceiro
  mes: ResumoFinanceiro
  totalMedicamentos: number
  totalClientes: number
  estoqueBaixo: Medicamento[]
  vencendo: Medicamento[]
}

function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string
  value: string
  icon: typeof DollarSign
  tone: string
  hint?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={`flex size-11 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-6" />
        </div>
      </div>
    </Card>
  )
}

export function Dashboard() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [hoje, mes, medicamentos, clientes, estoqueBaixo, vencendo] =
        await Promise.all([
          financeiroApi.hoje(),
          financeiroApi.resumo(firstDayOfMonth(), today()),
          medicamentosApi.listar(),
          clientesApi.listar(),
          medicamentosApi.estoqueBaixo(),
          medicamentosApi.vencendo(30),
        ])
      setData({
        hoje,
        mes,
        totalMedicamentos: medicamentos.length,
        totalClientes: clientes.length,
        estoqueBaixo,
        vencendo,
      })
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da farmácia"
      />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : data ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Vendas hoje"
              value={formatCurrency(data.hoje.totalVendas)}
              hint={`${data.hoje.quantidadeVendas} venda(s)`}
              icon={DollarSign}
              tone="bg-emerald-100 text-emerald-600"
            />
            <StatCard
              label="Vendas no mês"
              value={formatCurrency(data.mes.totalVendas)}
              hint={`Ticket médio ${formatCurrency(data.mes.ticketMedio)}`}
              icon={TrendingUp}
              tone="bg-brand-100 text-brand-600"
            />
            <StatCard
              label="Medicamentos"
              value={String(data.totalMedicamentos)}
              hint={`${data.estoqueBaixo.length} com estoque baixo`}
              icon={Pill}
              tone="bg-blue-100 text-blue-600"
            />
            <StatCard
              label="Clientes"
              value={String(data.totalClientes)}
              icon={Users}
              tone="bg-violet-100 text-violet-600"
            />
          </div>

          {/* Alertas */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AlertList
              title="Estoque baixo"
              icon={<AlertTriangle className="size-5 text-amber-500" />}
              empty="Nenhum medicamento com estoque baixo. 🎉"
              items={data.estoqueBaixo}
              render={(m) => (
                <Badge tone="amber">
                  {m.quantidade} / {m.quantidadeMinima} un.
                </Badge>
              )}
            />
            <AlertList
              title="Vencendo em 30 dias"
              icon={<CalendarClock className="size-5 text-red-500" />}
              empty="Nenhum medicamento vencendo em breve."
              items={data.vencendo}
              render={(m) => (
                <Badge tone="red">
                  {m.dataValidade
                    ? new Date(`${m.dataValidade}T00:00:00`).toLocaleDateString('pt-BR')
                    : '—'}
                </Badge>
              )}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AlertList({
  title,
  icon,
  items,
  empty,
  render,
}: {
  title: string
  icon: React.ReactNode
  items: Medicamento[]
  empty: string
  render: (m: Medicamento) => React.ReactNode
}) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-slate-800">{title}</h3>
          {items.length > 0 && <Badge tone="gray">{items.length}</Badge>}
        </div>
        <Link
          to="/medicamentos"
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
        >
          Ver todos <ArrowRight className="size-4" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.slice(0, 6).map((m) => (
            <li key={m.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">{m.nome}</p>
                <p className="text-xs text-slate-400">{m.categoria}</p>
              </div>
              {render(m)}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
