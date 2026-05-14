"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { 
  GraduationCap, 
  Plus, 
  Search, 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Check, 
  ChevronRight,
  BookOpen,
  Filter,
  AlertCircle
} from "lucide-react"
import { useSchool } from "@/contexts/SchoolContext"
import { cn } from "@/lib/utils"

interface Subject {
  uid: string
  name: string
  level: string
  grade: string
}

interface ClassGroup {
  uid: string
  name: string
  shift: string
  period: string
  is_regular: boolean
  level?: string
  grade?: string
  notes?: string
  offering_ids: string[]
  required_subject_ids: string[]
}

export default function ClassesPage() {
  const { currentSchool } = useSchool()
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [schoolSubjects, setSchoolSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    shift: "morning",
    period: "2024",
    is_regular: true,
    level: "fundamental_1",
    grade: "1",
    notes: "",
    required_subject_ids: [] as string[]
  })

  async function fetchData() {
    if (!currentSchool) return
    setLoading(true)
    try {
      // 1. Fetch Class Groups
      const classesData = await api.get<ClassGroup[]>(`/schools/${currentSchool.uid}/class-groups`)
      setClasses(classesData)

      // 2. Fetch School Subjects (to select required ones)
      const subjectsData = await api.get<Subject[]>(`/schools/${currentSchool.uid}/subjects`)
      setSchoolSubjects(subjectsData)
    } catch (err) {
      console.error("Error fetching classes data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentSchool])

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool) return
    if (!formData.name || !formData.period) {
      alert("Name and Period are required")
      return
    }

    try {
      const payload = {
        ...formData,
        grade: formData.level === "livre" ? "" : formData.grade
      }
      await api.post(`/schools/${currentSchool.uid}/class-groups`, payload)
      setIsModalOpen(false)
      // Reset form
      setFormData({
        name: "", shift: "morning", period: "2024", is_regular: true,
        level: "fundamental_1", grade: "1", notes: "", required_subject_ids: []
      })
      fetchData()
    } catch (err: any) {
      alert(err.message || "Error creating class")
    }
  }

  const toggleSubject = (uid: string) => {
    setFormData(prev => ({
      ...prev,
      required_subject_ids: prev.required_subject_ids.includes(uid)
        ? prev.required_subject_ids.filter(id => id !== uid)
        : [...prev.required_subject_ids, uid]
    }))
  }

  // Auto-fill required subjects based on level/grade if user wants
  const autoFillByLevelGrade = () => {
    const suggested = schoolSubjects.filter(s => s.level === formData.level && s.grade === formData.grade)
    setFormData(prev => ({
      ...prev,
      required_subject_ids: suggested.map(s => s.uid)
    }))
  }

  if (!currentSchool) return null

  // Group by Period
  const groupedClasses: { [period: string]: ClassGroup[] } = {}
  classes.forEach(c => {
    if (!groupedClasses[c.period]) groupedClasses[c.period] = []
    groupedClasses[c.period].push(c)
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Class Groups</h2>
          <p className="text-zinc-500 mt-1">Organize students, regular classes, and extra-curricular groups</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
        >
          <Plus size={20} />
          <span>New Class Group</span>
        </button>
      </header>

      {/* Search/Filters */}
      <div className="flex gap-4">
        <div className="flex-1 glass-card p-2 flex items-center px-4 gap-3">
          <Search size={18} className="text-zinc-500" />
          <input 
            placeholder="Search classes by name, year or grade..." 
            className="bg-transparent border-none focus:ring-0 text-sm text-zinc-300 w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
          <Filter size={18} />
          <span className="text-sm font-bold">2024</span>
        </button>
      </div>

      {/* List by Period */}
      <div className="space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-zinc-900/40 rounded-3xl animate-pulse border border-zinc-800/50" />
            ))}
          </div>
        ) : Object.keys(groupedClasses).length === 0 ? (
          <div className="glass-card p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-700">
              <GraduationCap size={32} />
            </div>
            <p className="text-zinc-500">No class groups found. Create your regular classes to start managing student enrollments!</p>
          </div>
        ) : Object.entries(groupedClasses).map(([period, items]) => (
          <div key={period} className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Calendar size={16} className="text-emerald-500" />
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Academic Year {period}</h3>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items
                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.grade?.includes(searchQuery))
                .map(group => (
                <div key={group.uid} className="glass-card flex flex-col hover:border-emerald-500/30 transition-all group overflow-hidden">
                  <Link href={`/classes/${group.uid}`} className="p-6 flex-1 cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        group.is_regular 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {group.is_regular ? "Regular Class" : "Special Group"}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase">{group.shift}</span>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      {group.name}
                    </h4>
                    
                    {group.is_regular && (
                      <p className="text-xs text-zinc-400 font-medium">
                        {group.level?.replace('_', ' ').toUpperCase()} • {group.grade}º Ano/Série
                      </p>
                    )}

                    <div className="mt-6 space-y-4">
                      {/* Completion Progress for Required Subjects */}
                      {group.is_regular && group.required_subject_ids.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                            <span className="text-zinc-500">Academic Coverage</span>
                            <span className="text-emerald-400">
                              {group.required_subject_ids.length > 0 ? Math.round((group.offering_ids.length / group.required_subject_ids.length) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
                            {group.required_subject_ids.map(sid => {
                              return <div key={sid} className={cn("h-full flex-1", group.offering_ids.includes(sid) ? "bg-emerald-500" : "bg-zinc-800")} />
                            })}
                          </div>
                        </div>
                      )}

                      {group.notes && (
                        <div className="flex gap-2 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
                          <FileText size={14} className="text-zinc-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed italic">{group.notes}</p>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 bg-zinc-900/20 border-t border-zinc-800 flex justify-between items-center group-hover:bg-zinc-900/40 transition-colors">
                    <Link href={`/offerings`} className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                      <Plus size={12} /> ADD OFFERING
                    </Link>
                    <Link href={`/classes/${group.uid}`} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-emerald-400 transition-all">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">Create Class Group</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Configure your academic class or special group</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleCreateClass} className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
              {/* Left Side: General Info */}
              <div className="w-full lg:w-2/5 p-8 border-b lg:border-b-0 lg:border-r border-zinc-800 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", formData.is_regular ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500")}>
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">Regular Class</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black">Standard academic grade</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_regular: !formData.is_regular})}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all duration-300",
                        formData.is_regular ? "bg-emerald-500" : "bg-zinc-800"
                      )}
                    >
                      <div className={cn("w-4 h-4 bg-white rounded-full transition-all duration-300", formData.is_regular ? "translate-x-6" : "translate-x-0")} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Period / Year</label>
                      <input 
                        required
                        placeholder="Ex: 2024"
                        className="premium-input"
                        value={formData.period}
                        onChange={e => setFormData({...formData, period: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Daily Shift</label>
                      <select 
                        className="premium-input bg-zinc-950 appearance-none"
                        value={formData.shift}
                        onChange={e => setFormData({...formData, shift: e.target.value})}
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="night">Night</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Group Name</label>
                    <input 
                      required
                      placeholder="Ex: 7th Grade A"
                      className="premium-input"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  {formData.is_regular && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Academic Level</label>
                            <select 
                              className="premium-input bg-zinc-950 appearance-none"
                              value={formData.level}
                              onChange={e => {
                                const newLevel = e.target.value
                                setFormData({
                                  ...formData, 
                                  level: newLevel,
                                  grade: newLevel === "livre" ? "" : formData.grade
                                })
                              }}
                            >
                              <option value="fundamental_1">Fundamental 1</option>
                              <option value="fundamental_2">Fundamental 2</option>
                              <option value="ensino_medio">Ensino Médio</option>
                              <option value="livre">Livre / Aberto</option>
                            </select>
                      </div>
                      {formData.level !== "livre" && (
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Year / Grade</label>
                          <select 
                            className="premium-input bg-zinc-950 appearance-none text-xs"
                            value={formData.grade}
                            onChange={e => setFormData({...formData, grade: e.target.value})}
                          >
                            {formData.level === "fundamental_1" && ["1", "2", "3", "4", "5"].map(g => <option key={g} value={g}>{g}º Ano</option>)}
                            {formData.level === "fundamental_2" && ["6", "7", "8", "9"].map(g => <option key={g} value={g}>{g}º Ano</option>)}
                            {formData.level === "ensino_medio" && ["I", "II", "III", "IV"].map(g => <option key={g} value={g}>{g} Série</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Notes <span className="lowercase font-normal italic">(optional)</span></label>
                    <textarea 
                      placeholder="Add any specific details about this group..."
                      rows={3}
                      className="premium-input resize-none"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: Required Subjects Selection */}
              <div className="flex-1 p-8 bg-zinc-950/30 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} /> Required Subjects Checklist
                  </h4>
                  {formData.is_regular && (
                    <button 
                      type="button"
                      onClick={autoFillByLevelGrade}
                      className="text-[10px] font-black text-emerald-500 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
                    >
                      AUTO-SUGGEST FOR GRADE
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {schoolSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                      <AlertCircle size={24} className="text-zinc-700" />
                      <p className="text-xs text-zinc-500">No school subjects found.<br/>Please import some subjects first.</p>
                    </div>
                  ) : schoolSubjects
                    .sort((a, b) => a.level.localeCompare(b.level) || a.grade.localeCompare(b.grade))
                    .map(sub => (
                    <div 
                      key={sub.uid}
                      onClick={() => toggleSubject(sub.uid)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                        formData.required_subject_ids.includes(sub.uid)
                          ? "bg-emerald-500/10 border-emerald-500/50"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded flex items-center justify-center text-[8px] font-black border transition-all",
                          formData.required_subject_ids.includes(sub.uid) 
                            ? "bg-emerald-500 text-zinc-950 border-emerald-500" 
                            : "bg-zinc-800 text-zinc-600 border-zinc-700"
                        )}>
                          {sub.grade}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{sub.name}</p>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">
                            {sub.level.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        formData.required_subject_ids.includes(sub.uid)
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-zinc-800 group-hover:border-zinc-600"
                      )}>
                        {formData.required_subject_ids.includes(sub.uid) && <Check size={12} className="text-zinc-950" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Selected</span>
                    <span className="text-xl font-black text-white">{formData.required_subject_ids.length} Subjects</span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-10 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                    >
                      CREATE GROUP
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
