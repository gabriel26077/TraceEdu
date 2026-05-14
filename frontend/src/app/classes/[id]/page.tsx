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
  MoreVertical
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
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"offerings" | "students">("offerings")

  async function fetchDetailData() {
    if (!currentSchool || !params.id) return
    setLoading(true)
    try {
      // 1. Fetch Group Details
      const groupData = await api.get<ClassGroup>(`/class-groups/${params.id}`)
      setGroup(groupData)

      // 2. Fetch All School Offerings and filter
      const allOfferings = await api.get<SubjectOffering[]>(`/schools/${currentSchool.uid}/subject-offerings`)
      const classOfferings = allOfferings.filter(o => groupData.offering_ids.includes(o.uid))
      setOfferings(classOfferings)

      // 3. Fetch All School Users (Students) and filter
      const allUsers = await api.get<any[]>(`/schools/${currentSchool.uid}/users`)
      const classStudents = allUsers.filter(u => groupData.student_ids.includes(u.uid))
      setStudents(classStudents)

    } catch (err) {
      console.error("Error fetching class detail:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetailData()
  }, [currentSchool, params.id])

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
                      {group.required_subject_ids.length > 0 ? Math.round((group.offering_ids.length / group.required_subject_ids.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 flex gap-0.5">
                    {group.required_subject_ids.map(sid => (
                      <div key={sid} className={cn("h-full flex-1", group.offering_ids.includes(sid) ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-zinc-900")} />
                    ))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offerings.length === 0 ? (
                  <div className="col-span-full glass-card p-12 text-center space-y-4">
                    <BookOpen size={40} className="text-zinc-800 mx-auto" />
                    <p className="text-zinc-500">No subject offerings have been added to this class yet.</p>
                    <Link href="/offerings" className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest hover:text-emerald-300 transition-colors">
                      <Plus size={14} /> Link New Offering
                    </Link>
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
    </div>
  )
}
