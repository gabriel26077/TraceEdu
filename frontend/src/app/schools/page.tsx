"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Building2, Plus, Mail, ChevronRight, X, User, CreditCard, Archive, Trash2, AlertTriangle, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSchool } from "@/contexts/SchoolContext"
import { cn } from "@/lib/utils"

interface School {
  uid: string
  name: string
  coordination_email: string
  status: string
  role?: string
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    coordination_email: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    admin_cpf: ""
  })

  const router = useRouter()
  const { setSchool, isSuperAdmin } = useSchool()

  async function fetchSchools() {
    setLoading(true)
    try {
      const data = await api.get<School[]>("/schools")
      setSchools(data)
    } catch (err: any) {
      if (err.name !== "AuthSkipError") {
        console.error("Failed to fetch schools:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    // Auto-select if user has only one active school and is not a platform admin
    if (!loading && !isSuperAdmin && schools.length === 1 && activeTab === "active") {
      const school = schools[0]
      if (school.status !== "archived") {
        handleSelectSchool(school)
      }
    }
  }, [loading, schools, isSuperAdmin, activeTab])

  const handleSelectSchool = (school: School) => {
    if (school.status === "archived") {
      alert("This school is archived. Please activate it first to access its dashboard.")
      return
    }
    // USE THE REAL ROLE FROM BACKEND, DEFAULT TO 'USER' FOR SAFETY
    const userRole = isSuperAdmin ? "admin" : (school.role || "teacher")
    setSchool({ uid: school.uid, name: school.name }, userRole as any)
    router.push("/")
  }

  const handleArchive = async (e: React.MouseEvent, schoolId: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to archive this school? Logins and access will be blocked.")) return
    try {
      await api.patch(`/schools/${schoolId}/archive`, {})
      fetchSchools()
    } catch (err: any) {
      alert(err.message || "Error archiving school")
    }
  }

  const handleDelete = async (e: React.MouseEvent, school: School) => {
    e.stopPropagation()
    const confirmation = prompt(`CRITICAL ACTION: Type the school name "${school.name}" to confirm permanent deletion of ALL data. This cannot be undone.`)
    if (confirmation !== school.name) {
      alert("Name mismatch. Deletion cancelled.")
      return
    }
    try {
      await api.delete(`/schools/${school.uid}`)
      fetchSchools()
    } catch (err: any) {
      alert(err.message || "Error deleting school")
    }
  }

  const handleActivate = async (e: React.MouseEvent, schoolId: string) => {
    e.stopPropagation()
    try {
      await api.patch(`/schools/${schoolId}/activate`, {})
      fetchSchools()
    } catch (err: any) {
      alert(err.message || "Error activating school")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const cleanedData = {
        ...formData,
        admin_cpf: formData.admin_cpf.trim() === "" ? null : formData.admin_cpf.trim()
      }
      await api.post("/schools", cleanedData)
      setIsModalOpen(false)
      fetchSchools()
      setFormData({
        name: "", coordination_email: "", admin_name: "",
        admin_email: "", admin_password: "", admin_cpf: ""
      })
    } catch (err: any) {
      alert(err.message || "Error creating school.")
    }
  }

  const filteredSchools = schools.filter(s => (s.status || "active") === activeTab)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Institutions</h2>
          <p className="text-zinc-500 mt-1">
            {isSuperAdmin ? "Platform Management: Global overview of schools." : "My Institutions: Access your dashboard."}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={20} />
            <span>New School</span>
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800/50 p-1 bg-zinc-900/30 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab("active")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === "active" ? "bg-zinc-800 text-emerald-400 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Active
        </button>
        <button 
          onClick={() => setActiveTab("archived")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === "archived" ? "bg-zinc-800 text-amber-500 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Archived
        </button>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          ))
        ) : filteredSchools.map((school) => (
          <div
            key={school.uid}
            onClick={() => handleSelectSchool(school)}
            className={cn(
              "group relative p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden",
              school.status === "archived" 
                ? "bg-zinc-950 border-zinc-900 grayscale opacity-70" 
                : "bg-zinc-900/40 border-zinc-800/50 hover:border-emerald-500/50"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex justify-between items-start gap-4">
              <div className="flex gap-4 flex-1 min-w-0">
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300 shrink-0",
                  school.status === "archived" ? "bg-zinc-900 text-zinc-600" : "bg-emerald-500/10 text-emerald-400"
                )}>
                  <Building2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "text-lg font-bold truncate transition-colors",
                    school.status === "archived" ? "text-zinc-500" : "text-zinc-100 group-hover:text-emerald-400"
                  )}>
                    {school.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{school.coordination_email}</span>
                  </div>
                </div>
              </div>
              
              {isSuperAdmin && (
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {school.status !== "archived" ? (
                    <button 
                      onClick={(e) => handleArchive(e, school.uid)}
                      className="p-2 hover:bg-amber-500/10 text-zinc-600 hover:text-amber-500 rounded-lg transition-all"
                      title="Archive School"
                    >
                      <Archive size={18} />
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={(e) => handleActivate(e, school.uid)}
                        className="p-2 hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500 rounded-lg transition-all"
                        title="Activate School"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, school)}
                        className="p-2 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 rounded-lg transition-all"
                        title="Hard Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {school.status === "archived" && (
              <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center gap-2 text-[10px] font-bold text-amber-500/50 uppercase tracking-widest">
                <AlertTriangle size={12} /> Access Restricted
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && filteredSchools.length === 0 && (
        <div className="py-20 text-center glass-card">
          <p className="text-zinc-600 italic">No {activeTab} schools found.</p>
        </div>
      )}

      {/* Registration Modal - remains similar but with premium-input class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h3 className="text-xl font-bold text-white">Register Institution</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300 p-2 hover:bg-zinc-800 rounded-full"><X size={20} /></button>
            </header>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">School Name</span>
                  <input required className="premium-input mt-1.5" placeholder="TraceEdu Int." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Coordination Email</span>
                  <input required type="email" className="premium-input mt-1.5" placeholder="contact@school.com" value={formData.coordination_email} onChange={e => setFormData({ ...formData, coordination_email: e.target.value })} />
                </label>
              </div>

              <div className="pt-6 border-t border-zinc-800/50 space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Initial Administrator
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Full Name" className="premium-input" value={formData.admin_name} onChange={e => setFormData({ ...formData, admin_name: e.target.value })} />
                  <input required type="email" placeholder="Admin Email" className="premium-input" value={formData.admin_email} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="password" placeholder="Password" className="premium-input" value={formData.admin_password} onChange={e => setFormData({ ...formData, admin_password: e.target.value })} />
                  <input placeholder="CPF (Optional)" className="premium-input" value={formData.admin_cpf} onChange={e => setFormData({ ...formData, admin_cpf: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95">
                PROVISION INSTITUTION
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
