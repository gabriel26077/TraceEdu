"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useSchool } from "@/contexts/SchoolContext"
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Mail, 
  Fingerprint, 
  Building2, 
  MoreVertical,
  UserPlus,
  ShieldAlert,
  Power,
  RotateCcw,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface GlobalUser {
  uid: string
  name: string
  email: string
  cpf: string
  global_roles: string[]
  status: string
  schools: {
    id: string
    name: string
    roles: string[]
  }[]
}

export default function PlatformAdminPage() {
  const [users, setUsers] = useState<GlobalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  async function fetchUsers() {
    setLoading(true)
    try {
      const data = await api.get<GlobalUser[]>("/platform/users")
      setUsers(data)
    } catch (err) {
      console.error("Error fetching global users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.cpf?.includes(search)
  )

  const { user: currentAuthUser } = useSchool()

  const handleDelete = async (e: React.MouseEvent, user: GlobalUser) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to PERMANENTLY delete ${user.name}? This will remove their credentials and all school memberships. This action cannot be undone.`)) return
    
    try {
      await api.delete(`/platform/users/${user.uid}`)
      fetchUsers()
    } catch (err: any) {
      alert(err.message || "Error deleting user")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Platform Governance</h2>
          <p className="text-zinc-500 mt-1">Global User Directory and System-wide Access Control</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or CPF..."
              className="pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          ))
        ) : filteredUsers.map((user) => (
          <div 
            key={user.uid}
            className="group glass-card p-6 flex items-center justify-between hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-400 group-hover:from-emerald-500 group-hover:to-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner">
                <Users size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100 truncate">{user.name}</h3>
                  {user.global_roles.includes("platform_admin") && (
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-tighter rounded-md border border-indigo-500/20">
                      Super Admin
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Mail size={12} />
                    <span>{user.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Fingerprint size={12} />
                    <span>{user.cpf || "No CPF"}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-1 w-64 px-6 border-l border-zinc-800/50">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Memberships</p>
                <div className="flex -space-x-2 overflow-hidden">
                  {user.schools.length > 0 ? user.schools.map((s, idx) => (
                    <div 
                      key={s.id} 
                      title={`${s.name} (${s.roles.join(', ')})`}
                      className="w-8 h-8 rounded-lg bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-400 hover:z-10 hover:border-emerald-500/50 cursor-help transition-all"
                    >
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                  )) : (
                    <span className="text-[10px] text-zinc-700 italic">No institutions</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-6">
              {currentAuthUser?.uid !== user.uid && (
                <button 
                  onClick={(e) => handleDelete(e, user)}
                  className="p-2.5 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 rounded-xl transition-all"
                  title="Delete User Permanently"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button 
                className="p-2.5 hover:bg-zinc-800 text-zinc-600 hover:text-zinc-200 rounded-xl transition-all"
                title="Account Settings"
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredUsers.length === 0 && (
        <div className="py-20 text-center glass-card">
          <Users className="mx-auto text-zinc-800 mb-4" size={48} />
          <p className="text-zinc-600 italic font-medium">No users found matching your search.</p>
        </div>
      )}
    </div>
  )
}
