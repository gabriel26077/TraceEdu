"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Settings,
  LogOut,
  Building2,
  ChevronDown,
  ShieldCheck,
  ClipboardList,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSchool } from "@/contexts/SchoolContext"
import { useAuth } from "@/contexts/AuthContext"

export function Sidebar() {
  const pathname = usePathname()
  const { currentSchool, currentRole, isSuperAdmin } = useSchool()

  const getMenuItems = () => {
    const items = []
    if (isSuperAdmin) {
      items.push(
        { icon: Building2, label: "All Schools", href: "/schools" },
        { icon: ShieldCheck, label: "Platform Admin", href: "/platform-admin" }
      )
    }
    if (currentRole === "admin") {
      items.push(
        { icon: LayoutDashboard, label: "School Dashboard", href: "/" },
        { icon: Users, label: "Staff & Management", href: "/users" },
        { icon: UserCheck, label: "Students", href: "/students" },
        { icon: BookOpen, label: "Academic Subjects", href: "/subjects" },
        { icon: ClipboardList, label: "Subject Offerings", href: "/offerings" },
        { icon: GraduationCap, label: "Class Groups", href: "/classes" }
      )
    }
    if (currentRole === "teacher") {
      items.push(
        { icon: LayoutDashboard, label: "My Overview", href: "/" },
        { icon: GraduationCap, label: "My Classes", href: "/teacher/classes" },
        { icon: UserCheck, label: "Grade Posting", href: "/teacher/grades" }
      )
    }
    return items
  }

  const { user, logout } = useAuth()
  const menuItems = getMenuItems()

  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800/50 flex flex-col h-screen sticky top-0 shadow-2xl">
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
          TraceEdu
        </h1>
      </div>

      <div className="px-4 mb-8">
        <Link 
          href="/schools" 
          className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={cn(
              "p-2 rounded-lg shrink-0",
              isSuperAdmin ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
            )}>
              {isSuperAdmin ? <ShieldCheck size={18} /> : <Building2 size={18} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                {currentRole ? `Context: ${currentRole}` : "Platform Level"}
              </p>
              <p className="text-sm font-semibold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                {currentSchool?.name || "Global Management"}
              </p>
            </div>
          </div>
          <ChevronDown size={14} className="text-zinc-600 group-hover:text-emerald-400" />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-emerald-400" : "text-zinc-600")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-zinc-900 space-y-1">
        <div className="px-4 py-3 flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">
            {user?.name.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-zinc-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">Active Session</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 cursor-pointer transition-all">
          <Settings size={18} className="text-zinc-600" />
          <span>Settings</span>
        </div>
        <div 
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 cursor-pointer transition-all"
        >
          <LogOut size={18} className="text-rose-500/60" />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  )
}
