"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { 
  GraduationCap, 
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  Clock,
  User,
  Plus,
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  X
} from "lucide-react"
import { useSchool } from "@/contexts/SchoolContext"
import { cn } from "@/lib/utils"

interface SubjectOffering {
  uid: string
  subject_id: string
  subject_name?: string
  period: string
  teacher_ids: string[]
  teacher_names?: string[]
}

interface Student {
  uid: string
  name: string
  email: string
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
  student_ids: string[]
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentSchool } = useSchool()
  const [group, setGroup] = useState<ClassGroup | null>(null)
  const [offerings, setOfferings] = useState<SubjectOffering[]>([])
  const [allSchoolOfferings, setAllSchoolOfferings] = useState<SubjectOffering[]>([])
  const [allSchoolSubjects, setAllSchoolSubjects] = useState<any[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"offerings" | "students">("offerings")

  async function fetchDetailData() {
    if (!currentSchool || !params.id) return
    setLoading(true)
    try {
      const [groupData, allOfferings, allUsers, allSubjects] = await Promise.all([
        api.get<ClassGroup>(`/class-groups/${params.id}`),
        api.get<SubjectOffering[]>(`/schools/${currentSchool.uid}/subject-offerings`),
        api.get<any[]>(`/schools/${currentSchool.uid}/users`),
        api.get<any[]>(`/schools/${currentSchool.uid}/subjects`)
      ])

      setGroup(groupData)
      setAllSchoolSubjects(allSubjects)
      
      const enrichedAll = allOfferings.map(o => {
        const sub = allSubjects.find(s => s.uid === o.subject_id)
        const tNames = allUsers.filter(u => o.teacher_ids.includes(u.uid)).map(u => u.name)
        return { 
          ...o, 
          subject_name: sub?.name || "Unknown Subject",
          subject_level: sub?.level,
          teacher_names: tNames
        }
      })

      setAllSchoolOfferings(enrichedAll)
      setOfferings(enrichedAll.filter(o => groupData.offering_ids.includes(o.uid)))
      setStudents(allUsers.filter(u => groupData.student_ids.includes(u.uid)))
    } catch (err) {
      console.error("Error fetching class detail:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkOffering = async (offeringId: string) => {
    if (!group) return
    try {
      await api.post(`/class-groups/${group.uid}/link-offering/${offeringId}`, {})
      setIsLinkModalOpen(false)
      fetchDetailData()
    } catch (err: any) {
      alert(err.message || "Error linking offering")
    }
  }

  useEffect(() => {
    fetchDetailData()
  }, [currentSchool, params.id])

  const availableOfferings = allSchoolOfferings.filter(o => {
    const isAlreadyLinked = group?.offering_ids.includes(o.uid)
    if (isAlreadyLinked) return false
    
    // PERMISSIVE LOGIC FOR 'LIVRE':
    // 1. If subject is 'livre', it can go anywhere.
    // 2. If class is 'livre', it can take any subject.
    if ((o as any).subject_level === "livre" || group?.level === "livre") {
      return true
    }

    // STRICT LOGIC FOR REGULAR:
    // Filter by Level if group is regular
    if (group?.is_regular && group.level) {
      return (o as any).subject_level === group.level
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse tracking-widest uppercase text-[10px]">Loading Classroom...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="glass-card p-20 text-center space-y-6 max-w-2xl mx-auto mt-20">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Class Group Not Found</h3>
          <p className="text-zinc-500">The class group you are looking for doesn't exist or you don't have access.</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Classes</span>
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-white tracking-tight">{group.name}</h2>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border h-fit",
                group.is_regular 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                {group.is_regular ? "Regular Class" : "Special Group"}
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-500">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <Calendar size={14} className="text-emerald-500" />
                <span>Period {group.period}</span>
              </div>
              <div className="w-1 h-1 bg-zinc-800 rounded-full" />
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <Clock size={14} className="text-amber-500" />
                <span>{group.shift} Shift</span>
              </div>
              {group.is_regular && (
                <>
                  <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <span className="text-xs font-bold text-zinc-400">
                    {group.level?.replace('_', ' ').toUpperCase()} • {group.grade}º Year
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
            <MoreVertical size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition-all shadow-lg shadow-emerald-500/10">
            <Plus size={20} />
            <span>Manage Group</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Class Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                  <p className="text-2xl font-black text-white">{students.length}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Students</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                  <p className="text-2xl font-black text-white">{offerings.length}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Offerings</p>
                </div>
              </div>
            </div>

            {group.is_regular && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Curriculum Coverage</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-black">
                    <span className="text-zinc-500">COMPLETED</span>
                    <span className="text-emerald-400">
                      {(() => {
                        const coveredIds = offerings.map(o => o.subject_id)
                        const count = group.required_subject_ids.filter(sid => coveredIds.includes(sid)).length
                        const total = group.required_subject_ids.length
                        return total > 0 ? Math.round((count / total) * 100) : 0
                      })()}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 flex gap-0.5">
                    {(() => {
                      const coveredIds = offerings.map(o => o.subject_id)
                      return group.required_subject_ids.map(sid => (
                        <div key={sid} className={cn("h-full flex-1", coveredIds.includes(sid) ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-zinc-900")} />
                      ))
                    })()}
                  </div>
                </div>
              </div>
            )}

            {group.notes && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Coordinator Notes</h4>
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-900">
                  <p className="text-xs text-zinc-400 leading-relaxed italic">"{group.notes}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs and Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab("offerings")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === "offerings" ? "bg-emerald-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <BookOpen size={18} />
              Subjects & Offerings
            </button>
            <button 
              onClick={() => setActiveTab("students")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === "students" ? "bg-emerald-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Users size={18} />
              Enrolled Students
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            {activeTab === "offerings" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Offerings</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsLinkModalOpen(true)}
                      className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/20"
                    >
                      <Plus size={12} /> LINK EXISTING
                    </button>
                    <Link 
                      href={`/offerings?class_id=${group.uid}`}
                      className="text-[10px] font-black text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800"
                    >
                      <Plus size={12} /> CREATE NEW
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offerings.length === 0 ? (
                    <div className="col-span-full glass-card p-12 text-center space-y-4">
                      <BookOpen size={40} className="text-zinc-800 mx-auto" />
                      <p className="text-zinc-500">No subject offerings have been added to this class yet.</p>
                      <div className="flex justify-center gap-4 mt-4">
                        <button onClick={() => setIsLinkModalOpen(true)} className="text-emerald-400 text-xs font-black uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-2">
                          <Plus size={14} /> Link Existing
                        </button>
                        <Link href={`/offerings?class_id=${group.uid}`} className="text-zinc-400 text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                          <Plus size={14} /> Create New
                        </Link>
                      </div>
                    </div>
                  ) : offerings.map(offering => (
                    <div key={offering.uid} className="glass-card p-5 group hover:border-emerald-500/30 transition-all flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-900 group-hover:border-emerald-500/20 transition-all">
                          <BookOpen size={20} className="text-emerald-500" />
                        </div>
                        <div>
                          <h5 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{offering.subject_name}</h5>
                          <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5">
                            <User size={10} /> 
                            {offering.teacher_names?.length ? offering.teacher_names.join(", ") : "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pending Curriculum Requirements */}
                {group.is_regular && (() => {
                  const coveredIds = offerings.map(o => o.subject_id)
                  const pending = allSchoolSubjects.filter(s => 
                    group.required_subject_ids.includes(s.uid) && 
                    !coveredIds.includes(s.uid)
                  )
                  
                  if (pending.length === 0) return null
                  
                  return (
                    <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Pending Curriculum Requirements</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pending.map(subject => (
                          <div key={subject.uid} className="bg-zinc-950/40 border border-dashed border-zinc-800 p-5 rounded-2xl flex justify-between items-center group hover:border-amber-500/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 text-zinc-600 group-hover:text-amber-500 transition-colors">
                                <BookOpen size={18} />
                              </div>
                              <div>
                                <h5 className="font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">{subject.name}</h5>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">No active offering</p>
                              </div>
                            </div>
                            <Link 
                              href={`/offerings?class_id=${group.uid}&subject_id=${subject.uid}`}
                              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-black text-zinc-500 hover:text-white hover:border-zinc-700 transition-all rounded-lg uppercase tracking-widest"
                            >
                              Create Offering
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                {students.length === 0 ? (
                  <div className="glass-card p-12 text-center space-y-4">
                    <Users size={40} className="text-zinc-800 mx-auto" />
                    <p className="text-zinc-500">No students are currently enrolled in this class group.</p>
                    <button className="text-emerald-400 text-xs font-black uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-2 mx-auto">
                      <Plus size={14} /> Enroll Student
                    </button>
                  </div>
                ) : (
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-900 bg-zinc-950/60">
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Student</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">E-mail</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
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
                            <td className="px-6 py-4 text-xs text-zinc-500">{student.email}</td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for linking existing offerings */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">Link Existing Offering</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Select an offering to attach to {group?.name}</p>
              </div>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar text-white">
              {availableOfferings.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-auto text-zinc-800">
                    <BookOpen size={32} />
                  </div>
                  <p className="text-zinc-500 text-sm">All available offerings are already linked to this class or no other offerings exist.</p>
                </div>
              ) : availableOfferings.map(offering => (
                <div 
                  key={offering.uid}
                  onClick={() => handleLinkOffering(offering.uid)}
                  className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl hover:border-emerald-500/50 cursor-pointer transition-all group flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/10">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{offering.subject_name}</h5>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        Period: {offering.period} • {offering.teacher_names?.length ? offering.teacher_names.join(", ") : "No Teacher"}
                      </p>
                    </div>
                  </div>
                  <Plus size={18} className="text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                </div>
              ))}
            </div>

            <footer className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end shrink-0">
              <button 
                onClick={() => setIsLinkModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
