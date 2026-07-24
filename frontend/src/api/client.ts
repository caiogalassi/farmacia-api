import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Extrai uma mensagem amigável de erros da API
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; errors?: Record<string, string> }
      | undefined
    if (data?.errors) {
      return Object.values(data.errors).join(' • ')
    }
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar à API. Verifique se o backend está rodando na porta 8081.'
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Ocorreu um erro inesperado.'
}
