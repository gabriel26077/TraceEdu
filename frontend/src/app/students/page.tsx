"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Users, Plus, Mail, Shield, Search, AlertCircle, X, User as UserIcon, GraduationCap, Trash2 } from "lucide-react"
import { useSchool } from "@/contexts/SchoolContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  uid: string
  name: string
  email?: string
  roles: string[]
}

export default function StudentsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    roles: ["student"]
  })
  const { currentSchool, currentRole, isSuperAdmin, isLoading } = useSchool()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && currentRole !== "admin" && !isSuperAdmin) {
      router.push("/")
    }
  }, [isLoading, currentRole, isSuperAdmin, router])

  async function fetchStudents() {
    if (!currentSchool) return
    setLoading(true)
    try {
      const data = await api.get<User[]>(`/schools/${currentSchool.uid}/users`)
      // Filter only students
      setUsers(data.filter(u => u.roles.includes("student")))
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!currentSchool) return
    if (!confirm(`CRITICAL: Are you sure you want to delete ${studentName}? This will permanently remove all enrollments, grades, and historical data for this student.`)) return
    
    try {
      await api.delete(`/schools/${currentSchool.uid}/users/${studentId}`)
      fetchStudents()
    } catch (err: any) {
      alert(err.message || "Error deleting student")
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool) return
    try {
      await api.post(`/schools/${currentSchool.uid}/users`, formData)
      setIsModalOpen(false)
      setFormData({ name: "", roles: ["student"] })
      fetchStudents()
      alert("Student added successfully!")
    } catch (err: any) {
      alert(err.message || "Error creating student")
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [currentSchool])

  if (!currentSchool) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white">No School Selected</h2>
        <p className="text-zinc-500 max-w-md">Please select a school to manage its students.</p>
        <Link href="/schools" className="premium-button mt-4">
          Go to Schools List
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-emerald-400 flex items-center gap-3">
            <GraduationCap size={32} /> Students
          </h2>
          <p className="text-zinc-500 mt-1">Enrollment registry for <span className="text-emerald-400 font-semibold">{currentSchool.name}</span></p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
        >
          <Plus size={20} />
          <span>Add Student</span>
        </button>
      </header>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><GraduationCap size={20}/></div>
          <div><p className="text-xs text-zinc-500">Total Enrolled</p><p className="text-xl font-bold text-white">{users.length}</p></div>
        </div>
        <div className="md:col-span-2 glass-card p-2 flex items-center px-4 gap-3">
          <Search size={18} className="text-zinc-500" />
          <input placeholder="Search students by name..." className="bg-transparent border-none focus:ring-0 text-sm text-zinc-300 w-full py-2" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={3} className="px-6 py-8 h-12 bg-zinc-900/20" /></tr>
              ))
            ) : users.map((user) => (
              <tr key={user.uid} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{user.name}</p>
                      <p className="text-[10px] text-zinc-600 font-mono">{user.uid.split("-")[0]}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="flex items-center gap-2 text-emerald-500/80 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Enrolled
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                   <button className="text-xs font-bold text-zinc-600 hover:text-emerald-400 transition-colors">History</button>
                   <button 
                    onClick={() => handleDeleteStudent(user.uid, user.name)}
                    className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all group/btn"
                    title="Delete Student"
                   >
                     <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && users.length === 0 && (
          <div className="py-20 text-center text-zinc-600">
            No students registered in this school yet.
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div>
                <h3 className="text-xl font-bold text-white">Quick Enrollment</h3>
                <p className="text-xs text-zinc-500 mt-1">Register a student to {currentSchool.name}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleAddStudent} className="p-8 space-y-6">
              <label className="block">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Student Full Name</span>
                <div className="relative mt-2">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    required 
                    className="premium-input pl-12 py-4" 
                    placeholder="Enter student's name..." 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>
              </label>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                >
                  ENROLL STUDENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
