"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  BookOpen, 
  Plus, 
  Import, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  X, 
  GraduationCap, 
  Edit2, 
  Trash2,
  Package
} from "lucide-react"
import { useSchool } from "@/contexts/SchoolContext"
import { cn } from "@/lib/utils"

interface Subject {
  uid: string
  name: string
  description?: string
  academic_units: number
  level: string
  grade: string
}

interface GroupedSubjects {
  [level: string]: {
    [grade: string]: Subject[]
  }
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
  ensino_medio: "Ensino Médio",
  livre: "Livre / Aberto"
}

export default function SubjectsPage() {
  const [groupedSubjects, setGroupedSubjects] = useState<GroupedSubjects>({})
  const [globalSubjects, setGlobalSubjects] = useState<GlobalSubject[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  
  // Selection/Edit
  const [selectedGlobalIds, setSelectedGlobalIds] = useState<string[]>([])
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    level: "fundamental_1",
    grade: "1",
    academic_units: 3,
    offering_type: "standard",
    description: ""
  })

  // Tree UI (Main Page)
  const [expandedLevels, setExpandedLevels] = useState<string[]>(["fundamental_1", "fundamental_2", "ensino_medio", "livre"])
  const [expandedGrades, setExpandedGrades] = useState<string[]>(["livre-"])

  // Tree UI (Import Modal)
  const [importExpandedLevels, setImportExpandedLevels] = useState<string[]>(["fundamental_1", "fundamental_2", "ensino_medio"])

  const { currentSchool } = useSchool()

  async function fetchSchoolSubjects() {
    if (!currentSchool) return
    setLoading(true)
    try {
      const data = await api.get<Subject[]>(`/schools/${currentSchool.uid}/subjects`)
      
      // Manual grouping
      const grouped: GroupedSubjects = {}
      data.forEach(s => {
        const gradeKey = s.grade || "" // Handle null/undefined
        if (!grouped[s.level]) grouped[s.level] = {}
        if (!grouped[s.level][gradeKey]) grouped[s.level][gradeKey] = []
        grouped[s.level][gradeKey].push(s)
      })
      
      setGroupedSubjects(grouped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchGlobalCatalog() {
    try {
      const data = await api.get<GlobalSubject[]>("/subjects/global")
      setGlobalSubjects(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchSchoolSubjects()
    fetchGlobalCatalog()
  }, [currentSchool])

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool) return
    
    // Ensure grade is 'ALL' for livre subjects
    const finalData = {
      ...formData,
      grade: formData.level === "livre" ? "" : formData.grade
    }
    
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.uid}`, finalData)
      } else {
        await api.post(`/schools/${currentSchool.uid}/subjects`, finalData)
      }
      setIsCustomModalOpen(false)
      fetchSchoolSubjects()
    } catch (err: any) {
      alert(err.message || "Error saving subject")
    }
  }

  const handleDeleteSubject = async (uid: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action only affects your school.`)) return
    try {
      await api.delete(`/subjects/${uid}`)
      fetchSchoolSubjects()
    } catch (err: any) {
      alert(err.message || "Error deleting subject")
    }
  }

  const handleImport = async () => {
    if (!currentSchool || selectedGlobalIds.length === 0) return
    try {
      await api.post("/subjects/import", {
        school_id: currentSchool.uid,
        global_subject_ids: selectedGlobalIds
      })
      setIsImportModalOpen(false)
      setSelectedGlobalIds([])
      fetchSchoolSubjects()
    } catch (err: any) {
      alert(err.message || "Error importing subjects")
    }
  }

  const openCreateModal = (level?: string, grade?: string) => {
    setEditingSubject(null)
    setFormData({
      name: "",
      level: level || "fundamental_1",
      grade: grade || "1",
      academic_units: 3,
      offering_type: "standard",
      description: ""
    })
    setIsCustomModalOpen(true)
  }

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      level: subject.level,
      grade: subject.grade,
      academic_units: subject.academic_units,
      offering_type: "standard",
      description: subject.description || ""
    })
    setIsCustomModalOpen(true)
  }

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const toggleImportLevel = (level: string) => {
    setImportExpandedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const toggleGrade = (gradeKey: string) => {
    setExpandedGrades(prev => 
      prev.includes(gradeKey) ? prev.filter(g => g !== gradeKey) : [...prev, gradeKey]
    )
  }

  // Grouping Logic for Global Catalog
  const groupedGlobal: { [level: string]: { [grade: string]: GlobalSubject[] } } = {}
  const othersGlobal: GlobalSubject[] = []

  globalSubjects.forEach(gs => {
    if (LEVEL_LABELS[gs.level]) {
      if (!groupedGlobal[gs.level]) groupedGlobal[gs.level] = {}
      if (!groupedGlobal[gs.level][gs.grade]) groupedGlobal[gs.level][gs.grade] = []
      groupedGlobal[gs.level][gs.grade].push(gs)
    } else {
      othersGlobal.push(gs)
    }
  })

  if (!currentSchool) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Academic Subjects</h2>
          <p className="text-zinc-500 mt-1">Curriculum management for <span className="text-emerald-400 font-semibold">{currentSchool.name}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all border border-zinc-700/50"
          >
            <Import size={18} />
            <span>Import Base Subjects</span>
          </button>
          <button 
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
          >
            <Plus size={20} />
            <span>Custom Subject</span>
          </button>
        </div>
      </header>

      {/* Main Hierarchical View */}
      <div className="space-y-4">
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
                <div className="p-2 space-y-2 bg-zinc-950/20">
                  {(
                    level === "fundamental_1" ? ["1", "2", "3", "4", "5"] :
                    level === "fundamental_2" ? ["6", "7", "8", "9"] :
                    level === "ensino_medio" ? ["I", "II", "III", "IV"] :
                    [""]
                  ).map(grade => {
                    const subjects = grades[grade] || []
                    const gradeKey = `${level}-${grade}`
                    return (
                      <div key={grade} className="border border-zinc-800/30 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/20">
                          <button 
                            onClick={() => toggleGrade(gradeKey)}
                            className="flex items-center gap-3 text-left"
                          >
                            {expandedGrades.includes(gradeKey) ? <ChevronDown size={16} className="text-zinc-600" /> : <ChevronRight size={16} className="text-zinc-600" />}
                            <span className="text-sm font-bold text-zinc-400">
                              {grade === "" ? "General Subjects / Open Enrollment" : `${grade}º Ano / Série`}
                            </span>
                            <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{subjects.length} subjects</span>
                          </button>
                          
                          <button 
                            onClick={() => openCreateModal(level, grade)}
                            className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 p-1 flex items-center gap-1 transition-colors"
                          >
                            <Plus size={14} />
                            ADD
                          </button>
                        </div>

                        {expandedGrades.includes(gradeKey) && (
                          <div className="flex flex-col gap-1 p-2 bg-zinc-950/40">
                            {subjects.length > 0 ? subjects.map(subject => (
                              <div key={subject.uid} className="flex items-center justify-between py-1.5 px-3 bg-zinc-900/40 border border-zinc-800/30 rounded-xl hover:border-emerald-500/30 transition-all group">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="w-7 h-7 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 group-hover:border-emerald-500/30 transition-colors">
                                    <BookOpen size={12} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate">
                                      {subject.name}
                                    </h4>
                                    {subject.description && (
                                      <p className="text-[9px] text-zinc-600 truncate max-w-md italic leading-tight">{subject.description}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 shrink-0">
                                  <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{subject.academic_units} Units</span>
                                    <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-tighter">Standard</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => openEditModal(subject)}
                                      className="p-2 text-zinc-700 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-all"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSubject(subject.uid, subject.name)}
                                      className="p-2 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="py-6 text-center text-zinc-700 text-xs italic">
                                Empty grade. Import or add subjects.
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

      {/* Import Modal - Tree View Refactor */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">Base Subjects Catalog</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Select subjects to clone into your institution</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Hierarchical Tree in Modal */}
              {Object.entries(LEVEL_LABELS).map(([level, label]) => {
                const grades = groupedGlobal[level] || {}
                if (Object.keys(grades).length === 0) return null

                return (
                  <div key={level} className="bg-zinc-950/40 rounded-2xl border border-zinc-800/50 overflow-hidden">
                    <div className="w-full flex items-center justify-between p-4 bg-zinc-900/20">
                      <button 
                        onClick={() => toggleImportLevel(level)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <GraduationCap size={18} className="text-emerald-400" />
                        <span className="font-bold text-zinc-200">{label}</span>
                        {importExpandedLevels.includes(level) ? <ChevronDown size={18} className="text-zinc-500" /> : <ChevronRight size={18} className="text-zinc-500" />}
                      </button>
                      
                      <button 
                        onClick={() => {
                          const allIds = Object.values(grades).flat().map(s => s.uid)
                          const allSelected = allIds.every(id => selectedGlobalIds.includes(id))
                          if (allSelected) {
                            setSelectedGlobalIds(prev => prev.filter(id => !allIds.includes(id)))
                          } else {
                            setSelectedGlobalIds(prev => Array.from(new Set([...prev, ...allIds])))
                          }
                        }}
                        className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/20 transition-all"
                      >
                        {Object.values(grades).flat().every(id => selectedGlobalIds.includes(id.uid)) ? "DESELECT LEVEL" : "SELECT ALL LEVEL"}
                      </button>
                    </div>

                    {importExpandedLevels.includes(level) && (
                      <div className="px-4 pb-4 space-y-4 pt-2">
                        {Object.entries(grades).map(([grade, subjects]) => (
                          <div key={grade} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                              <div className="h-px bg-zinc-800 flex-1" />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">{grade}º Ano / Série</span>
                                <button 
                                  onClick={() => {
                                    const gradeIds = subjects.map(s => s.uid)
                                    const allSelected = gradeIds.every(id => selectedGlobalIds.includes(id))
                                    if (allSelected) {
                                      setSelectedGlobalIds(prev => prev.filter(id => !gradeIds.includes(id)))
                                    } else {
                                      setSelectedGlobalIds(prev => Array.from(new Set([...prev, ...gradeIds])))
                                    }
                                  }}
                                  className="text-[9px] font-bold text-zinc-500 hover:text-emerald-500 transition-colors"
                                >
                                  {subjects.every(s => selectedGlobalIds.includes(s.uid)) ? "(Deselect Year)" : "(Select Year)"}
                                </button>
                              </div>
                              <div className="h-px bg-zinc-800 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {subjects.map(gs => (
                                <div 
                                  key={gs.uid}
                                  onClick={() => setSelectedGlobalIds(prev => prev.includes(gs.uid) ? prev.filter(i => i !== gs.uid) : [...prev, gs.uid])}
                                  className={cn(
                                    "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                                    selectedGlobalIds.includes(gs.uid) 
                                      ? "bg-emerald-500/10 border-emerald-500/50" 
                                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                                  )}
                                >
                                  <div className={cn(
                                    "shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all",
                                    selectedGlobalIds.includes(gs.uid) ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"
                                  )}>
                                    {selectedGlobalIds.includes(gs.uid) && <Check size={14} className="text-zinc-950" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-zinc-200 text-xs truncate">{gs.name}</p>
                                    <p className="text-[9px] text-zinc-500">{gs.academic_units} Units</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Others Section */}
              {othersGlobal.length > 0 && (
                <div className="bg-zinc-950/40 rounded-2xl border border-zinc-800/50 overflow-hidden">
                  <div className="w-full flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/20">
                    <div className="flex items-center gap-3">
                      <Package size={18} className="text-amber-400" />
                      <span className="font-bold text-zinc-200">Others</span>
                    </div>
                    <button 
                      onClick={() => {
                        const allIds = othersGlobal.map(s => s.uid)
                        const allSelected = allIds.every(id => selectedGlobalIds.includes(id))
                        if (allSelected) {
                          setSelectedGlobalIds(prev => prev.filter(id => !allIds.includes(id)))
                        } else {
                          setSelectedGlobalIds(prev => Array.from(new Set([...prev, ...allIds])))
                        }
                      }}
                      className="text-[10px] font-black text-amber-500 hover:text-amber-400 px-3 py-1 bg-amber-500/5 rounded-full border border-emerald-500/10 transition-all"
                    >
                      {othersGlobal.every(s => selectedGlobalIds.includes(s.uid)) ? "DESELECT OTHERS" : "SELECT ALL OTHERS"}
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {othersGlobal.map(gs => (
                      <div 
                        key={gs.uid}
                        onClick={() => setSelectedGlobalIds(prev => prev.includes(gs.uid) ? prev.filter(i => i !== gs.uid) : [...prev, gs.uid])}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                          selectedGlobalIds.includes(gs.uid) 
                            ? "bg-emerald-500/10 border-emerald-500/50" 
                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <div className={cn(
                          "shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all",
                          selectedGlobalIds.includes(gs.uid) ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"
                        )}>
                          {selectedGlobalIds.includes(gs.uid) && <Check size={14} className="text-zinc-950" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 text-xs truncate">{gs.name}</p>
                          <p className="text-[9px] text-zinc-500">{gs.level} • {gs.grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="p-6 border-t border-zinc-800 bg-zinc-950/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-xs font-bold text-emerald-400">{selectedGlobalIds.length} selected</span>
                </div>
                {selectedGlobalIds.length > 0 && (
                  <button 
                    onClick={() => setSelectedGlobalIds([])}
                    className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsImportModalOpen(false)} 
                  className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImport}
                  disabled={selectedGlobalIds.length === 0}
                  className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                >
                  CLONE SUBJECTS
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Custom/Edit Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <form onSubmit={handleSaveSubject}>
              <header className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{editingSubject ? "Edit Subject" : "New Custom Subject"}</h3>
                <button type="button" onClick={() => setIsCustomModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </header>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Subject Name</label>
                  <input 
                    required autoFocus
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Level</label>
                      <select 
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        value={formData.level}
                        onChange={e => {
                          const newLevel = e.target.value
                          setFormData({
                            ...formData, 
                            level: newLevel,
                            grade: newLevel === "livre" ? "ALL" : formData.grade
                          })
                        }}
                      >
                        {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                  </div>
                  {formData.level !== "livre" && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Grade / Year</label>
                      <input 
                        required
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        value={formData.grade}
                        onChange={e => setFormData({...formData, grade: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Units</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      value={formData.academic_units}
                      onChange={e => setFormData({...formData, academic_units: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Type</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      value={formData.offering_type}
                      onChange={e => setFormData({...formData, offering_type: e.target.value})}
                    >
                      <option value="standard">Standard</option>
                      <option value="elective">Elective</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <footer className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-3">
                <button type="button" onClick={() => setIsCustomModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-zinc-500 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition-all">
                  {editingSubject ? "Save Changes" : "Create Subject"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
