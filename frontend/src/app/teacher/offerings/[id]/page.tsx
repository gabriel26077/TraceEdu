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
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Student {
  uid: string
  name: string
  email: string
}

interface Subject {
  uid: string
  name: string
}

interface Offering {
  uid: string
  subject_id: string
  period: string
}

export default function TeacherOfferingPage() {
  const params = useParams()
  const router = useRouter()
  const { currentSchool, user, currentRole } = useSchool()
  
  const [offering, setOffering] = useState<Offering | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"students" | "grades" | "stats">("students")

  useEffect(() => {
    async function fetchData() {
      if (!currentSchool || !params.id) return
      setLoading(true)
      try {
        // 1. Fetch Offering
        const off = await api.get<Offering>(`/schools/${currentSchool.uid}/subject-offerings/${params.id}`)
        setOffering(off)

        // 2. Fetch Subject
        const sub = await api.get<Subject>(`/schools/${currentSchool.uid}/subjects/${off.subject_id}`)
        setSubject(sub)

        // 3. Find Groups linked to this offering to get students
        const allGroups = await api.get<any[]>(`/class-groups/school/${currentSchool.uid}`)
        const linkedGroups = allGroups.filter(g => g.offering_ids.includes(off.uid))
        
        // 4. Get student IDs (union)
        const studentIds = Array.from(new Set(linkedGroups.flatMap(g => g.student_ids)))
        
        // 5. Fetch student profiles
        const allUsers = await api.get<any[]>(`/schools/${currentSchool.uid}/users`)
        setStudents(allUsers.filter(u => studentIds.includes(u.uid)))

      } catch (err) {
        console.error("Error fetching offering details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentSchool, params.id])

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
          { id: "students", label: "Students", icon: Users },
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
        {activeTab === "students" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.length === 0 ? (
              <div className="col-span-full glass-card p-20 text-center space-y-4">
                <Users size={40} className="text-zinc-800 mx-auto" />
                <p className="text-zinc-500">No students enrolled in this offering yet.</p>
              </div>
            ) : (
              students.map(student => (
                <div key={student.uid} className="glass-card p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-all group">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 text-zinc-600 group-hover:text-emerald-500 transition-colors">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-300 group-hover:text-white transition-colors">{student.name}</h5>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{student.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "grades" && (
          <div className="glass-card p-20 text-center space-y-4 border-dashed border-zinc-800">
            <FileText size={48} className="mx-auto text-zinc-800" />
            <div className="max-w-xs mx-auto">
              <h3 className="text-zinc-200 font-bold text-lg">Grade posting coming soon</h3>
              <p className="text-zinc-500 text-sm mt-1">We are finalizing the grade entry interface. Stay tuned!</p>
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
            <div className="glass-card p-6 space-y-4 text-center flex flex-col justify-center items-center opacity-50">
               <AlertCircle size={24} className="text-zinc-700 mb-2" />
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Insights pending data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
