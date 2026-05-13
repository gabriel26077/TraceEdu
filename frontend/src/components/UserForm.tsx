"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { X, Save, AlertCircle } from "lucide-react"

interface UserFormProps {
  onSuccess: () => void
  onClose: () => void
}

export function UserForm({ onSuccess, onClose }: UserFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [roles, setRoles] = useState<string[]>(["student"])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableRoles = ["student", "teacher", "clerk", "admin"]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post("/users", { 
        name, 
        email: email || undefined, 
        cpf: cpf || undefined, 
        roles 
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleRole(role: string) {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role))
    } else {
      setRoles([...roles, role])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 p-8 shadow-2xl animate-in slide-in-from-right duration-300">
        <header className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white">Create New User</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Full Name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. Gabriel Neto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="gabriel@edu.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">CPF (Optional)</label>
              <input
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">Roles</label>
            <div className="grid grid-cols-2 gap-2">
              {availableRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all",
                    roles.includes(role) 
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] premium-button justify-center"
            >
              <Save size={20} />
              <span>{loading ? "Saving..." : "Save User"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
