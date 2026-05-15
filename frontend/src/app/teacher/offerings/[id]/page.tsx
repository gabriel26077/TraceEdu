"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useSchool } from "@/contexts/SchoolContext"
import { 
  Users, 
  BookOpen, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertCircle,
  GraduationCap,
  Calendar,
  Save
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Student {
  uid: string
  name: string
  email: string
}

interface Grade {
  uid: string
  student_id: string
  unit: number
  assessment_number: number
  value: number
}

interface AssessmentStats {
  mean: number
  stddev: number
  histogram: number[]
}

interface UnitStats {
  assessments: AssessmentStats[]
  mean: number
  stddev: number
  histogram: number[]
}

interface OfferingStats {
  units: UnitStats[]
}

interface Subject {
  uid: string
  name: string
  academic_units: number
  assessments_per_unit: number
}

interface Offering {
  uid: string
  subject_id: string
  period: string
  teacher_ids: string[]
}

export default function TeacherOfferingPage() {
  const params = useParams()
  const router = useRouter()
  const { currentSchool, user, currentRole } = useSchool()
  
  const [offering, setOffering] = useState<Offering | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [stats, setStats] = useState<OfferingStats | null>(null)
  const [pendingGrades, setPendingGrades] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"members" | "grades" | "stats">("members")
  const [activeUnitTab, setActiveUnitTab] = useState(1)

  async function fetchData() {
    if (!currentSchool || !params.id) return
    setLoading(true)
    try {
      const off = await api.get<Offering>(`/schools/${currentSchool.uid}/subject-offerings/${params.id}`)
      setOffering(off)

      const sub = await api.get<Subject>(`/schools/${currentSchool.uid}/subjects/${off.subject_id}`)
      setSubject(sub)

      const offeringStudents = await api.get<Student[]>(`/schools/${currentSchool.uid}/subject-offerings/${params.id}/students`)
      setStudents(offeringStudents)

      const offeringTeachers = await api.get<any[]>(`/schools/${currentSchool.uid}/subject-offerings/${params.id}/teachers`)
      setTeachers(offeringTeachers)

      const offeringGrades = await api.get<Grade[]>(`/schools/${currentSchool.uid}/subject-offerings/${params.id}/grades`)
      setGrades(offeringGrades)
    } catch (err: any) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    if (!currentSchool || !params.id) return
    try {
      const data = await api.get<OfferingStats>(`/schools/${currentSchool.uid}/subject-offerings/${params.id}/stats`)
      setStats(data)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [currentSchool, params.id])

  const handleGradeChange = (studentId: string, unit: number, av: number, value: string, target?: HTMLInputElement) => {
    if (!currentSchool) return
    const key = `${studentId}|${unit}|${av}`
    
    if (value === "") {
        setPendingGrades(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
        return
    }

    try {
      const val = parseFloat(value.replace(",", "."))
      if (isNaN(val)) {
        if (target) target.value = ""
        return
      }
      
      if (val < 0 || val > 10) {
        alert("A nota deve estar entre 0 e 10")
        if (target) target.value = ""
        setPendingGrades(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
        return
      }
      
      setPendingGrades(prev => ({
        ...prev,
        [key]: val
      }))
    } catch (err) {
      if (target) target.value = ""
      console.error("Invalid grade value:", value)
    }
  }

  const handleSaveGrades = async () => {
    if (Object.keys(pendingGrades).length === 0 || !currentSchool || !offering) return
    setIsSaving(true)
    try {
      const gradesArray = Object.entries(pendingGrades).map(([key, value]) => {
        const [student_id, unit, assessment_number] = key.split("|")
        return {
          student_id,
          unit: parseInt(unit),
          assessment_number: parseInt(assessment_number),
          value
        }
      })
      
      await api.post(`/schools/${currentSchool.uid}/subject-offerings/${offering.uid}/bulk-grades`, {
        grades: gradesArray
      })
      
      // Refresh grades
      const offeringGrades = await api.get<any[]>(`/schools/${currentSchool.uid}/subject-offerings/${params.id}/grades`)
      setGrades(offeringGrades)
      setPendingGrades({})
      fetchStats()
    } catch (err) {
      console.error("Error saving grades:", err)
      alert("Erro ao lançar notas.")
    } finally {
      setIsSaving(false)
    }
  }

  const getGradeValue = (studentId: string, unit: number, av: number) => {
    const key = `${studentId}|${unit}|${av}`
    if (key in pendingGrades) return pendingGrades[key].toString()
    
    const grade = grades.find(g => g.student_id === studentId && g.unit === unit && g.assessment_number === av)
    return grade ? grade.value.toString() : ""
  }

  const calculateUnitMean = (studentId: string, unit: number) => {
    // Merge persisted and pending
    const studentGradesMap: Record<number, number> = {}
    
    // Persisted
    grades.filter(g => g.student_id === studentId && g.unit === unit).forEach(g => {
        studentGradesMap[g.assessment_number] = g.value
    })
    
    // Pending
    Object.entries(pendingGrades).forEach(([key, value]) => {
        const [sid, u, av] = key.split("|")
        if (sid === studentId && parseInt(u) === unit) {
            studentGradesMap[parseInt(av)] = value
        }
    })

    const unitGradesValues = Object.values(studentGradesMap)
    if (unitGradesValues.length === 0) return "--"
    const sum = unitGradesValues.reduce((acc, val) => acc + val, 0)
    return (sum / (subject?.assessments_per_unit || 1)).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse tracking-widest uppercase text-[10px]">Loading Class Workspace...</p>
        </div>
      </div>
    )
  }

  if (!offering) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6">
        <button 
          onClick={() => router.push("/")}
          className="w-fit flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <div className="flex justify-between items-start">
          <div className="flex gap-5">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight">{subject?.name}</h2>
              <div className="flex items-center gap-3 mt-2 text-zinc-500">
                 <span className="text-sm font-medium flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                   <Calendar size={14} className="text-emerald-500" />
                   Period {offering.period}
                 </span>
                 <span className="text-sm font-medium flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                   <Users size={14} className="text-indigo-500" />
                   {students.length} Students
                 </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-fit">
        {[
          { id: "members", label: "Integrantes", icon: Users },
          { id: "grades", label: "Grades & Assessment", icon: FileText },
          { id: "stats", label: "Statistics", icon: TrendingUp }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-emerald-500 text-zinc-950 shadow-lg" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
        {activeTab === "members" && (
          <div className="space-y-12">
            {/* Teachers Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Professores</h4>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold">{teachers.length}</span>
              </div>
              
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/60">
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Docente</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">E-mail</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Cargo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {teachers.map(teacher => (
                      <tr key={teacher.uid} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center text-xs font-bold border border-indigo-500/20">
                              {teacher.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 font-medium tracking-tight">{teacher.email}</td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Professor Titular</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Students Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Estudantes</h4>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">{students.length}</span>
              </div>
              
              {students.length === 0 ? (
                <div className="glass-card p-20 text-center space-y-4">
                  <Users size={40} className="text-zinc-800 mx-auto" />
                  <p className="text-zinc-500">No students enrolled in this offering yet.</p>
                </div>
              ) : (
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/60">
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Aluno</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">E-mail</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {students.map(student => (
                        <tr key={student.uid} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-500/20">
                                {student.name.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-500 font-medium tracking-tight">{student.email}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="space-y-6">
             {/* Unit Tabs & Actions */}
             <div className="flex justify-between items-end border-b border-zinc-900 pb-px">
                 <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                    {Array.from({ length: subject?.academic_units || 0 }, (_, i) => i + 1).map(unit => (
                      <button
                        key={unit}
                        onClick={() => setActiveUnitTab(unit)}
                        className={cn(
                          "pb-4 text-sm font-bold transition-all relative px-2 whitespace-nowrap",
                          activeUnitTab === unit 
                            ? "text-emerald-500" 
                            : "text-zinc-600 hover:text-zinc-400"
                        )}
                      >
                        Unidade {unit}
                        {activeUnitTab === unit && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        )}
                      </button>
                    ))}
                 </div>

                 {Object.keys(pendingGrades).length > 0 && (
                    <div className="pb-3 flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <button 
                            onClick={() => setPendingGrades({})}
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            Descartar
                        </button>
                        <button 
                            onClick={handleSaveGrades}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    Lançar {Object.keys(pendingGrades).length} Notas
                                </>
                            )}
                        </button>
                    </div>
                 )}
             </div>

             {/* Grades Table */}
             <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/60">
                         <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest sticky left-0 bg-zinc-950 z-10 min-w-[200px]">Estudante</th>
                         {Array.from({ length: subject?.assessments_per_unit || 0 }, (_, i) => i + 1).map(av => (
                           <th key={av} className="px-2 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center w-20">AV{av}</th>
                         ))}
                         <th className="px-6 py-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right w-32">Média</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-900">
                      {students.map(student => (
                        <tr key={student.uid} className="hover:bg-zinc-900/40 transition-colors group">
                           <td className="px-6 py-3 sticky left-0 bg-zinc-950/40 backdrop-blur-md group-hover:bg-zinc-900/60 transition-colors z-10 border-r border-zinc-900/50">
                              <div className="flex items-center gap-3">
                                 <div className="w-6 h-6 bg-emerald-500/10 text-emerald-500 rounded-md flex items-center justify-center text-[9px] font-black border border-emerald-500/20">
                                    {student.name.charAt(0)}
                                 </div>
                                 <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors truncate max-w-[150px]">{student.name}</span>
                              </div>
                           </td>
                           {Array.from({ length: subject?.assessments_per_unit || 0 }, (_, i) => i + 1).map(av => (
                             <td key={av} className="px-1 py-2">
                                <div className="flex justify-center">
                                  <input 
                                    key={`${student.uid}|${activeUnitTab}|${av}`}
                                    type="text" 
                                    inputMode="decimal"
                                    placeholder="0.0" 
                                    defaultValue={getGradeValue(student.uid, activeUnitTab, av)}
                                    onBlur={(e) => {
                                      handleGradeChange(student.uid, activeUnitTab, av, e.target.value, e.target as HTMLInputElement)
                                    }}
                                    className="w-14 h-9 bg-zinc-900/30 border border-zinc-800/50 rounded-lg text-center text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                             </td>
                           ))}
                           <td className="px-6 py-2 text-right">
                              <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">
                                {calculateUnitMean(student.uid, activeUnitTab)}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Class Average</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">--</span>
                <span className="text-xs text-zinc-600 mb-1">/ 10.0</span>
              </div>
            </div>
            <div className="glass-card p-6 space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Attendance Rate</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">--</span>
                <span className="text-xs text-zinc-600 mb-1">%</span>
              </div>
            </div>
            <div className="glass-card p-6 space-y-4 text-center flex flex-col justify-center items-center opacity-50 border-dashed">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">More Stats</p>
              <p className="text-[9px] font-bold text-zinc-700 uppercase">Coming soon</p>
            </div>
          </div>
        )}
        {activeTab === "stats" && (
          <div className="space-y-16 pb-20 mt-12">
            {stats ? (
              stats.units.map((unit, uIdx) => (
                <div key={uIdx} className="space-y-6">
                  <div className="flex items-center gap-4 px-2 mb-8">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 text-zinc-950 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-emerald-500/20">
                        {uIdx + 1}
                      </div>
                      Unidade {uIdx + 1}
                    </h3>
                    <div className="h-px flex-1 bg-zinc-900" />
                  </div>

                  <div className="space-y-4">
                    {unit.assessments.map((ass, aIdx) => (
                      <div key={aIdx} className="glass-card p-6 flex flex-col md:flex-row gap-8 items-center hover:border-zinc-700 transition-all group">
                        <div className="w-full md:w-48 space-y-1">
                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Avaliação {aIdx + 1}</h4>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-white">{ass.mean.toFixed(1)}</p>
                            <span className="text-[10px] font-bold text-zinc-600">MÉDIA</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                            <span className="text-zinc-700">±</span> {ass.stddev.toFixed(2)} <span className="text-[9px] text-zinc-700 uppercase">DP</span>
                          </p>
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <div className="flex items-end justify-between gap-1 h-16">
                            {ass.histogram.map((count, i) => {
                                const max = Math.max(...ass.histogram, 1)
                                const height = (count / max) * 100
                                return (
                                    <div 
                                        key={i} 
                                        className="flex-1 bg-zinc-800/30 rounded-t-sm relative group/bar"
                                        style={{ height: "100%" }}
                                    >
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 bg-emerald-500/30 group-hover/bar:bg-emerald-500/50 transition-all rounded-t-sm"
                                            style={{ height: `${height}%` }}
                                        />
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none bg-zinc-800 text-[10px] font-bold text-white px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-20 shadow-2xl">
                                            {count} alunos
                                        </div>
                                    </div>
                                )
                            })}
                          </div>
                          <div className="flex justify-between text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">
                            <span>0.0</span>
                            <span>2.5</span>
                            <span>5.0</span>
                            <span>7.5</span>
                            <span>10.0</span>
                          </div>
                        </div>
                        
                        <div className="hidden lg:flex items-center gap-4 text-zinc-800 group-hover:text-zinc-700 transition-colors">
                           <TrendingUp size={40} />
                        </div>
                      </div>
                    ))}

                    {/* Unit Summary Row */}
                    <div className="glass-card p-8 flex flex-col md:flex-row gap-12 items-center border-emerald-500/20 bg-emerald-500/[0.03] mt-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <TrendingUp size={120} />
                      </div>

                      <div className="w-full md:w-56 space-y-1 relative z-10">
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Resumo Unidade</h4>
                        <div className="flex items-baseline gap-2">
                          <p className="text-5xl font-black text-white">{unit.mean.toFixed(1)}</p>
                          <span className="text-xs font-bold text-emerald-500/50">GERAL</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-400/60 flex items-center gap-1">
                          <span className="text-emerald-500/30">±</span> {unit.stddev.toFixed(2)} <span className="text-[10px] uppercase">DESVIO</span>
                        </p>
                      </div>

                      <div className="flex-1 w-full space-y-3 relative z-10">
                        <div className="flex items-end justify-between gap-1 h-20">
                          {unit.histogram.map((count, i) => {
                              const max = Math.max(...unit.histogram, 1)
                              const height = (count / max) * 100
                              return (
                                  <div 
                                      key={i} 
                                      className="flex-1 bg-emerald-500/5 rounded-t-sm relative group/bar"
                                      style={{ height: "100%" }}
                                  >
                                      <div 
                                          className="absolute bottom-0 left-0 right-0 bg-emerald-500/50 group-hover/bar:bg-emerald-500 transition-all rounded-t-sm"
                                          style={{ height: `${height}%` }}
                                      />
                                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none bg-emerald-500 text-[10px] font-black text-zinc-950 px-2 py-1 rounded whitespace-nowrap z-20 shadow-xl">
                                          {count} alunos
                                      </div>
                                  </div>
                              )
                          })}
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-emerald-500/40 uppercase tracking-widest px-2">
                          <span>0.0</span>
                          <span>2.5</span>
                          <span>5.0</span>
                          <span>7.5</span>
                          <span>10.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-40 text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-zinc-500 text-sm font-bold">Calculando estatísticas da turma...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
