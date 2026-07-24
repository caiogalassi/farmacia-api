import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Search, Pencil, Trash2, Mail, Phone, MapPin, FileWarning } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { clientesApi } from '@/api/clientes'
import { getErrorMessage } from '@/api/client'
import { formatCpf, formatDate, formatPhone } from '@/lib/format'
import type { Cliente, ClienteInput } from '@/types'

export function Clientes() {
  const toast = useToast()
  const [items, setItems] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [excluir, setExcluir] = useState<Cliente | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setItems(await clientesApi.listar())
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtrados = useMemo(() => {
    if (!busca) return items
    const q = busca.toLowerCase()
    return items.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.cpf.replace(/\D/g, '').includes(busca.replace(/\D/g, '')) ||
        (c.email ?? '').toLowerCase().includes(q),
    )
  }, [items, busca])

  async function handleDelete() {
    if (!excluir) return
    try {
      await clientesApi.excluir(excluir.id)
      toast.success('Cliente excluído.')
      setExcluir(null)
      load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Cadastro de clientes da farmácia"
        action={
          <Button
            onClick={() => {
              setEditando(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Novo cliente
          </Button>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF ou e-mail…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <Card>
        {loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : filtrados.length === 0 ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Cadastre o primeiro cliente para começar."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">CPF</th>
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">Nascimento</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{c.nome}</p>
                      {c.endereco && (
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="size-3" /> {c.endereco}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatCpf(c.cpf)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" /> {c.email}
                          </span>
                        )}
                        {c.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" /> {formatPhone(c.telefone)}
                          </span>
                        )}
                        {!c.email && !c.telefone && <span>—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(c.dataNascimento)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Editar"
                          onClick={() => {
                            setEditando(c)
                            setFormOpen(true)
                          }}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          title="Excluir"
                          onClick={() => setExcluir(c)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ClienteForm
        open={formOpen}
        cliente={editando}
        onClose={() => {
          setFormOpen(false)
          setEditando(null)
        }}
        onSaved={() => {
          setFormOpen(false)
          setEditando(null)
          load()
        }}
      />

      <Modal
        open={!!excluir}
        onClose={() => setExcluir(null)}
        title="Excluir cliente"
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
            Excluir <strong className="text-slate-800">{excluir?.nome}</strong>? Essa ação
            não pode ser desfeita.
          </p>
        </div>
      </Modal>
    </div>
  )
}

type FormState = {
  nome: string
  cpf: string
  email: string
  telefone: string
  endereco: string
  dataNascimento: string
}

const vazio: FormState = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  endereco: '',
  dataNascimento: '',
}

function ClienteForm({
  open,
  cliente,
  onClose,
  onSaved,
}: {
  open: boolean
  cliente: Cliente | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const [form, setForm] = useState<FormState>(vazio)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (cliente) {
      setForm({
        nome: cliente.nome,
        cpf: cliente.cpf,
        email: cliente.email ?? '',
        telefone: cliente.telefone ?? '',
        endereco: cliente.endereco ?? '',
        dataNascimento: cliente.dataNascimento ?? '',
      })
    } else {
      setForm(vazio)
    }
    setErrors({})
  }, [open, cliente])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome'
    const cpfDigits = form.cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) e.cpf = 'CPF deve ter 11 dígitos'
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = 'E-mail inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload: ClienteInput = {
        nome: form.nome.trim(),
        cpf: formatCpf(form.cpf),
        email: form.email.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        endereco: form.endereco.trim() || undefined,
        dataNascimento: form.dataNascimento || null,
      }
      if (cliente) {
        await clientesApi.atualizar(cliente.id, payload)
        toast.success('Cliente atualizado.')
      } else {
        await clientesApi.criar(payload)
        toast.success('Cliente cadastrado.')
      }
      onSaved()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cliente ? 'Editar cliente' : 'Novo cliente'}
      size="lg"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="cliente-form" loading={saving}>
            {cliente ? 'Salvar alterações' : 'Cadastrar'}
          </Button>
        </>
      }
    >
      <form
        id="cliente-form"
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Input
          label="Nome completo"
          required
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          error={errors.nome}
          className="sm:col-span-2"
        />
        <Input
          label="CPF"
          required
          value={formatCpf(form.cpf)}
          onChange={(e) => set('cpf', e.target.value)}
          error={errors.cpf}
          placeholder="000.000.000-00"
          inputMode="numeric"
        />
        <Input
          label="Telefone"
          value={formatPhone(form.telefone)}
          onChange={(e) => set('telefone', e.target.value)}
          placeholder="(00) 00000-0000"
          inputMode="tel"
        />
        <Input
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          placeholder="cliente@email.com"
        />
        <Input
          label="Data de nascimento"
          type="date"
          value={form.dataNascimento}
          onChange={(e) => set('dataNascimento', e.target.value)}
        />
        <Input
          label="Endereço"
          value={form.endereco}
          onChange={(e) => set('endereco', e.target.value)}
          className="sm:col-span-2"
          placeholder="Rua, número, bairro, cidade"
        />
      </form>
    </Modal>
  )
}
