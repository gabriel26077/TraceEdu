"use client"

import { useRouter } from "next/navigation"
import { useSchool } from "@/contexts/SchoolContext"
import { useEffect } from "react"
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Building2,
  ShieldCheck
} from "lucide-react"

export default function Dashboard() {
  const { currentSchool, currentRole, isSuperAdmin, isLoading } = useSchool()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !currentSchool && !isSuperAdmin) {
      router.push("/schools")
    }
  }, [isLoading, currentSchool, isSuperAdmin, router])

  if (isSuperAdmin && !currentSchool) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <header>
          <h2 className="text-3xl font-bold text-white tracking-tight">Platform Administration</h2>
          <p className="text-zinc-500 mt-1">Global ecosystem overview and management</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Building2} label="Total Institutions" value="12" delta="+2 this month" color="indigo" />
          <StatCard icon={Users} label="Global Users" value="2,405" delta="+156" color="emerald" />
          <StatCard icon={ShieldCheck} label="System Health" value="99.9%" delta="Stable" color="emerald" />
          <StatCard icon={AlertCircle} label="Active Alerts" value="0" delta="Clear" color="rose" />
        </div>

        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Platform Growth
          </h3>
          <div className="h-48 flex items-end gap-2 px-4">
            {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500/50 rounded-t-lg transition-all hover:to-indigo-400" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-4 px-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>
    )
  }

  if (!currentSchool && !isSuperAdmin) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="p-6 bg-emerald-500/5 rounded-full mb-6 border border-emerald-500/10">
          <TrendingUp size={48} className="text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to TraceEdu</h1>
        <p className="text-zinc-500 max-w-md text-lg">
          Select a school from the sidebar or the institutions list to start managing academic data.
        </p>
      </div>
    )
  }

  // --- SCHOOL ADMIN DASHBOARD ---
  if (currentRole === "admin") {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <header>
          <h2 className="text-3xl font-bold text-white tracking-tight">Management Dashboard</h2>
          <p className="text-zinc-500 mt-1">Overview for <span className="text-emerald-400 font-semibold">{currentSchool?.name}</span></p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Total Students" value="842" delta="+12%" color="emerald" />
          <StatCard icon={BookOpen} label="Active Subjects" value="48" delta="+3" color="indigo" />
          <StatCard icon={GraduationCap} label="Classes" value="24" delta="0" color="amber" />
          <StatCard icon={TrendingUp} label="Avg Performance" value="7.8" delta="+0.4" color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-6 min-h-[300px]">
             <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
               <Calendar size={18} className="text-emerald-400" />
               Recent Academic Activity
             </h3>
             <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex justify-between items-center">
                   <div className="flex gap-3 items-center">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <p className="text-sm text-zinc-300">New enrollment in <span className="text-zinc-100 font-medium">Advanced Math</span></p>
                   </div>
                   <span className="text-[10px] text-zinc-600 font-mono">2h ago</span>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="glass-card p-6">
             <h3 className="text-lg font-bold text-zinc-100 mb-6">Pending Actions</h3>
             <div className="space-y-3">
               <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-medium flex items-center gap-2">
                 <AlertCircle size={14} /> 4 Offerings without teachers
               </div>
               <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-medium flex items-center gap-2">
                 <AlertCircle size={14} /> 12 Grade reports pending review
               </div>
             </div>
          </div>
        </div>
      </div>
    )
  }

  // --- TEACHER DASHBOARD ---
  if (currentRole === "teacher") {
    return (
       <div className="space-y-8">
         <header>
          <h2 className="text-3xl font-bold text-white tracking-tight">Teaching Overview</h2>
          <p className="text-zinc-500 mt-1">Hello, Professor. Here are your classes in <span className="text-emerald-400 font-semibold">{currentSchool?.name}</span></p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-card p-8 text-center border-dashed border-zinc-700">
             <BookOpen size={48} className="mx-auto text-zinc-800 mb-4" />
             <p className="text-zinc-500">Teacher interface under construction...</p>
           </div>
        </div>
       </div>
    )
  }

  return null
}

function StatCard({ icon: Icon, label, value, delta, color }: any) {
  const colorMap: any = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  }

  return (
    <div className="glass-card p-6 group hover:border-emerald-500/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/5 px-2 py-1 rounded-lg">
          {delta}
        </span>
      </div>
      <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  )
}
