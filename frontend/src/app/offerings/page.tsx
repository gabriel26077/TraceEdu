"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  ClipboardList, 
  Plus, 
  Search, 
  X, 
  GraduationCap, 
  User, 
  Calendar,
  Check,
  ChevronRight,
  Filter,
  Users,
  Trash2
} from "lucide-react"
import { useSchool } from "@/contexts/SchoolContext"
import { cn } from "@/lib/utils"

interface Subject {
  uid: string
  name: string
  level: string
  grade: string
}

interface User {
  uid: string
  name: string
  email: string
  roles: string[]
}

interface Offering {
  uid: string
  subject_id: string
  period: string
  teacher_ids: string[]
  // These will be enriched by the UI
  subject_name?: string
  teachers?: User[]
}

export default function OfferingsPage() {
  const { currentSchool } = useSchool()
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    subject_id: "",
    period: "2024.1",
    teacher_ids: [] as string[]
  })

  const [searchQuery, setSearchQuery] = useState("")

  async function fetchData() {
    if (!currentSchool) return
    setLoading(true)
    try {
      // 1. Fetch subjects (need to flatten them)
      const groupedSubjects = await api.get<any>(`/schools/${currentSchool.uid}/subjects`)
      const flatSubjects: Subject[] = []
      Object.keys(groupedSubjects).forEach(level => {
        Object.keys(groupedSubjects[level]).forEach(grade => {
          groupedSubjects[level][grade].forEach((s: any) => {
            flatSubjects.push({ uid: s.uid, name: s.name, level, grade })
          })
        })
      })
      setSubjects(flatSubjects)

      // 2. Fetch users (teachers)
      const users = await api.get<User[]>(`/schools/${currentSchool.uid}/users`)
      setTeachers(users.filter(u => u.roles.includes("teacher")))

      // 3. Fetch offerings
      const offeringsData = await api.get<Offering[]>(`/schools/${currentSchool.uid}/subject-offerings`)
      
      // Enrich offerings with subject names and teacher info
      const enriched = offeringsData.map(off => ({
        ...off,
        subject_name: flatSubjects.find(s => s.uid === off.subject_id)?.name || "Unknown Subject",
        teachers: users.filter(u => off.teacher_ids.includes(u.uid))
      }))
      
      setOfferings(enriched)
    } catch (err) {
      console.error("Error fetching offerings data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentSchool])

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool) return
    if (!formData.subject_id || !formData.period || formData.teacher_ids.length === 0) {
      alert("Please fill all required fields and select at least one teacher.")
      return
    }

    try {
      await api.post(`/schools/${currentSchool.uid}/subject-offerings`, formData)
      setIsModalOpen(false)
      setFormData({ subject_id: "", period: "2024.1", teacher_ids: [] })
      fetchData()
    } catch (err: any) {
      alert(err.message || "Error creating offering")
    }
  }

  const handleDeleteOffering = async (uid: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the offering for ${name}?`)) return
    try {
      await api.delete(`/subject-offerings/${uid}`)
      fetchData()
    } catch (err: any) {
      alert(err.message || "Error deleting offering")
    }
  }

  const toggleTeacherSelection = (uid: string) => {
    setFormData(prev => ({
      ...prev,
      teacher_ids: prev.teacher_ids.includes(uid)
        ? prev.teacher_ids.filter(id => id !== uid)
        : [...prev.teacher_ids, uid]
    }))
  }

  // Group offerings by period for display
  const groupedOfferings: { [period: string]: Offering[] } = {}
  offerings.forEach(off => {
    if (!groupedOfferings[off.period]) groupedOfferings[off.period] = []
    groupedOfferings[off.period].push(off)
  })

  if (!currentSchool) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Subject Offerings</h2>
          <p className="text-zinc-500 mt-1">Manage active classes and teacher assignments for <span className="text-emerald-400 font-semibold">{currentSchool.name}</span></p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
        >
          <Plus size={20} />
          <span>New Offering</span>
        </button>
      </header>

      {/* Filter/Search */}
      <div className="flex gap-4">
        <div className="flex-1 glass-card p-2 flex items-center px-4 gap-3">
          <Search size={18} className="text-zinc-500" />
          <input 
            placeholder="Search offerings by subject or teacher..." 
            className="bg-transparent border-none focus:ring-0 text-sm text-zinc-300 w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
          <Filter size={18} />
          <span className="text-sm font-bold">All Periods</span>
        </button>
      </div>

      {/* Offerings List grouped by Period */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-zinc-900/40 rounded-3xl animate-pulse border border-zinc-800/50" />
            ))}
          </div>
        ) : Object.keys(groupedOfferings).length === 0 ? (
          <div className="glass-card p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-700">
              <ClipboardList size={32} />
            </div>
            <p className="text-zinc-500">No subject offerings found. Create your first one to start managing classes!</p>
          </div>
        ) : Object.entries(groupedOfferings).map(([period, items]) => (
          <div key={period} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Calendar size={16} className="text-emerald-500" />
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Period {period}</h3>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items
                .filter(off => 
                  off.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  off.teachers?.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(offering => (
                <div key={offering.uid} className="glass-card p-6 hover:border-emerald-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <GraduationCap size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded-md">
                        ID: {offering.uid.substring(0, 8)}
                      </span>
                      <button 
                        onClick={() => handleDeleteOffering(offering.uid, offering.subject_name || "")}
                        className="p-1.5 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-1">
                    {offering.subject_name}
                  </h4>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Users size={14} className="text-emerald-500/50" />
                      <span className="text-xs font-medium">
                        {offering.teachers && offering.teachers.length > 0 
                          ? offering.teachers.map(t => t.name).join(", ")
                          : "No teachers assigned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Calendar size={14} className="text-indigo-500/50" />
                      <span className="text-xs font-medium">Offering active for {offering.period}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-tighter transition-colors">
                      View Students
                    </button>
                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Offering Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">New Subject Offering</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Assign teachers to a curriculum subject for a specific period</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleCreateOffering} className="flex-1 overflow-y-auto flex flex-col md:flex-row">
              {/* Left Column: Subject & Period */}
              <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-zinc-800 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} /> Subject Configuration
                  </h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Select Subject</label>
                    <select 
                      required
                      className="premium-input bg-zinc-950 appearance-none"
                      value={formData.subject_id}
                      onChange={e => setFormData({...formData, subject_id: e.target.value})}
                    >
                      <option value="">Choose a subject...</option>
                      {subjects.map(s => (
                        <option key={s.uid} value={s.uid}>
                          [{s.level.substring(0, 4).toUpperCase()} {s.grade}] {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Academic Period</label>
                    <input 
                      required
                      placeholder="Ex: 2024.1"
                      className="premium-input"
                      value={formData.period}
                      onChange={e => setFormData({...formData, period: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="font-bold text-emerald-500">Note:</span> Subject offerings are the foundation for class groups and grade posting. Make sure to assign at least one qualified teacher.
                  </p>
                </div>
              </div>

              {/* Right Column: Teacher Assignment */}
              <div className="w-full md:w-1/2 p-8 space-y-4 flex flex-col">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Assign Teachers
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-2 custom-scrollbar">
                  {teachers.map(teacher => (
                    <div 
                      key={teacher.uid}
                      onClick={() => toggleTeacherSelection(teacher.uid)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                        formData.teacher_ids.includes(teacher.uid)
                          ? "bg-emerald-500/10 border-emerald-500/50"
                          : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
                          formData.teacher_ids.includes(teacher.uid) 
                            ? "bg-emerald-500 text-zinc-950 border-emerald-500" 
                            : "bg-zinc-900 text-zinc-500 border-zinc-800"
                        )}>
                          {teacher.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{teacher.name}</p>
                          <p className="text-[10px] text-zinc-500">{teacher.email}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                        formData.teacher_ids.includes(teacher.uid)
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-zinc-800 group-hover:border-zinc-600"
                      )}>
                        {formData.teacher_ids.includes(teacher.uid) && <Check size={12} className="text-zinc-950" />}
                      </div>
                    </div>
                  ))}
                  {teachers.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-xs text-zinc-600 italic">No teachers found in the staff list.</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-800 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                  >
                    CREATE OFFERING
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
