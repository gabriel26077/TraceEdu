"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useSchool } from "@/contexts/SchoolContext"
import { 
  Users, 
  Search, 
  Mail, 
  Fingerprint, 
  MoreVertical,
  Trash2,
  BookOpen,
  Plus,
  X,
  Check,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronDown,
  Edit2
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

interface GlobalSubject {
  uid: string
  name: string
  level: string
  grade: string
  academic_units: number
  category?: string
  description?: string
}

const LEVEL_LABELS: { [key: string]: string } = {
  fundamental_1: "Ensino Fundamental 1",
  fundamental_2: "Ensino Fundamental 2",
  ensino_medio: "Ensino Médio"
}

export default function PlatformAdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "subjects">("users")
  const [users, setUsers] = useState<GlobalUser[]>([])
  const [globalSubjects, setGlobalSubjects] = useState<GlobalSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // UI State for Tree
  const [expandedLevels, setExpandedLevels] = useState<string[]>(["fundamental_1", "fundamental_2", "ensino_medio"])
  const [expandedGrades, setExpandedGrades] = useState<string[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<GlobalSubject | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    level: "fundamental_1",
    grade: "1",
    academic_units: 3,
    category: "",
    description: ""
  })

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

  async function fetchGlobalSubjects() {
    setLoading(true)
    try {
      const data = await api.get<GlobalSubject[]>("/subjects/global")
      setGlobalSubjects(data)
    } catch (err) {
      console.error("Error fetching global subjects:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "users") fetchUsers()
    else fetchGlobalSubjects()
  }, [activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSubject) {
        await api.put(`/subjects/global/${editingSubject.uid}`, formData)
      } else {
        await api.post("/subjects/global", formData)
      }
      setIsModalOpen(false)
      fetchGlobalSubjects()
    } catch (err: any) {
      alert(err.message || "Error saving global subject")
    }
  }

  const handleDeleteSubject = async (uid: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove it from the global catalog.`)) return
    try {
      await api.delete(`/subjects/global/${uid}`)
      fetchGlobalSubjects()
    } catch (err: any) {
      alert(err.message || "Error deleting subject")
    }
  }

  const openAddModal = (level: string, grade: string) => {
    setEditingSubject(null)
    setFormData({ name: "", level, grade, academic_units: 3, category: "", description: "" })
    setIsModalOpen(true)
  }

  const openEditModal = (subject: GlobalSubject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      level: subject.level,
      grade: subject.grade,
      academic_units: subject.academic_units,
      category: subject.category || "",
      description: subject.description || ""
    })
    setIsModalOpen(true)
  }

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const toggleGrade = (gradeKey: string) => {
    setExpandedGrades(prev => 
      prev.includes(gradeKey) ? prev.filter(g => g !== gradeKey) : [...prev, gradeKey]
    )
  }

  // Grouping Logic
  const groupedSubjects: { [level: string]: { [grade: string]: GlobalSubject[] } } = {}
  globalSubjects.forEach(s => {
    if (!groupedSubjects[s.level]) groupedSubjects[s.level] = {}
    if (!groupedSubjects[s.level][s.grade]) groupedSubjects[s.level][s.grade] = []
    groupedSubjects[s.level][s.grade].push(s)
  })

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const { user: currentAuthUser } = useSchool()

  const handleDeleteUser = async (e: React.MouseEvent, user: GlobalUser) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return
    try {
      await api.delete(`/platform/users/${user.uid}`)
      fetchUsers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Platform Governance</h2>
          <p className="text-zinc-500 mt-1">Global System-wide Access and Resource Control</p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setActiveTab("users")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === "users" ? "bg-emerald-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              <Users size={16} />
              <span>Users</span>
            </button>
            <button 
              onClick={() => setActiveTab("subjects")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === "subjects" ? "bg-emerald-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              <BookOpen size={16} />
              <span>Base Subjects</span>
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === "users" ? "Search users..." : "Search base subjects..."}
              className="pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {activeTab === "users" ? (
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900 animate-pulse rounded-2xl" />)
          ) : filteredUsers.map((user) => (
            <div key={user.uid} className="glass-card p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-500 flex items-center gap-1"><Mail size={12}/>{user.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentAuthUser?.uid !== user.uid && (
                  <button onClick={(e) => handleDeleteUser(e, user)} className="p-2.5 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                )}
                <button className="p-2.5 hover:bg-zinc-800 text-zinc-600 hover:text-zinc-200 rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(LEVEL_LABELS).map(([level, label]) => {
            const grades = groupedSubjects[level] || {}
            return (
              <div key={level} className="glass-card overflow-hidden">
                <button 
                  onClick={() => toggleLevel(level)}
                  className="w-full flex items-center justify-between p-6 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <GraduationCap size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{label}</h3>
                  </div>
                  {expandedLevels.includes(level) ? <ChevronDown size={20} className="text-zinc-500" /> : <ChevronRight size={20} className="text-zinc-500" />}
                </button>

                {expandedLevels.includes(level) && (
                  <div className="p-4 space-y-4 bg-zinc-950/20">
                    {(
                      level === "fundamental_1" ? ["1", "2", "3", "4", "5"] :
                      level === "fundamental_2" ? ["6", "7", "8", "9"] :
                      ["I", "II", "III", "IV"]
                    ).map(grade => {
                      const subjects = grades[grade] || []
                      const gradeKey = `${level}-${grade}`
                      return (
                        <div key={grade} className="border border-zinc-800/50 rounded-2xl overflow-hidden">
                          <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/20">
                             <button 
                              onClick={() => toggleGrade(gradeKey)}
                              className="flex items-center gap-3 text-left"
                            >
                              {expandedGrades.includes(gradeKey) ? <ChevronDown size={16} className="text-zinc-600" /> : <ChevronRight size={16} className="text-zinc-600" />}
                              <span className="text-sm font-bold text-zinc-300">{grade}º Ano / Série</span>
                              <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{subjects.length} subjects</span>
                            </button>
                            
                            <button 
                              onClick={() => openAddModal(level, grade)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 text-[10px] font-black rounded-lg transition-all"
                            >
                              <Plus size={14} />
                              <span>ADD SUBJECT</span>
                            </button>
                          </div>

                          {expandedGrades.includes(gradeKey) && (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {subjects.length > 0 ? subjects.map(subject => (
                                <div key={subject.uid} className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl relative group hover:border-emerald-500/30 transition-all">
                                  <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-zinc-200">{subject.name}</p>
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => openEditModal(subject)}
                                        className="text-zinc-700 hover:text-emerald-400 p-1 transition-colors"
                                        title="Edit Template"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSubject(subject.uid, subject.name)}
                                        className="text-zinc-700 hover:text-rose-500 p-1 transition-colors"
                                        title="Delete Template"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{subject.description || "No description."}</p>
                                </div>
                              )) : (
                                <div className="col-span-full py-6 text-center">
                                  <p className="text-[10px] text-zinc-600 italic">No subjects registered for this grade.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Subject Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              <header className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{editingSubject ? "Edit Base Subject" : "New Base Subject"}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                    {LEVEL_LABELS[formData.level]} • {formData.grade}º Ano
                  </p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </header>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Subject Name</label>
                  <input 
                    required autoFocus
                    type="text" 
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Level</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      value={formData.level}
                      onChange={e => setFormData({...formData, level: e.target.value})}
                    >
                      <option value="fundamental_1">Fundamental 1</option>
                      <option value="fundamental_2">Fundamental 2</option>
                      <option value="ensino_medio">Ensino Médio</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Grade / Year</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Category</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Units</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      value={formData.academic_units}
                      onChange={e => setFormData({...formData, academic_units: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <footer className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-zinc-500 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition-all">
                  {editingSubject ? "Save Changes" : "Create Template"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
