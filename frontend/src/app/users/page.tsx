"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Users, Plus, Mail, Shield, Search, AlertCircle, X, User as UserIcon } from "lucide-react"
import { useSchool } from "@/contexts/SchoolContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  uid: string
  name: string
  email: string
  roles: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roles: ["teacher"] as string[],
    password: ""
  })
  const { currentSchool, currentRole, isSuperAdmin, isLoading } = useSchool()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && currentRole !== "admin" && !isSuperAdmin) {
      router.push("/")
    }
  }, [isLoading, currentRole, isSuperAdmin, router])

  async function fetchUsers() {
    if (!currentSchool) return
    setLoading(true)
    try {
      const data = await api.get<User[]>(`/schools/${currentSchool.uid}/users`)
      setUsers(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting user form...", formData)
    if (!currentSchool) return
    try {
      const response = await api.post(`/schools/${currentSchool.uid}/users`, formData)
      console.log("User created successfully:", response)
      alert("User registered successfully!")
      setIsModalOpen(false)
      setFormData({ name: "", email: "", roles: ["student"], password: "" })
      fetchUsers()
    } catch (err: any) {
      console.error("Error creating user:", err)
      alert(err.message || "Error creating user")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      await api.put(`/users/${selectedUser.uid}/password`, { new_password: newPassword })
      setIsResetModalOpen(false)
      setNewPassword("")
      setSelectedUser(null)
      alert("Password updated successfully")
    } catch (err: any) {
      alert(err.message || "Error updating password")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentSchool])

  if (!currentSchool) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white">No School Selected</h2>
        <p className="text-zinc-500 max-w-md">Please select a school to manage its users and academic data.</p>
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
          <h2 className="text-3xl font-bold text-white tracking-tight">Staff & Management</h2>
          <p className="text-zinc-500 mt-1">Institutional management for <span className="text-emerald-400 font-semibold">{currentSchool.name}</span></p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </header>

      {/* Stats/Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Users size={20}/></div>
          <div><p className="text-xs text-zinc-500">Total Staff</p><p className="text-xl font-bold text-white">{users.filter(u => u.roles.some(r => ["admin", "teacher"].includes(r))).length}</p></div>
        </div>
        <div className="md:col-span-2 glass-card p-2 flex items-center px-4 gap-3">
          <Search size={18} className="text-zinc-500" />
          <input placeholder="Search users by name or email..." className="bg-transparent border-none focus:ring-0 text-sm text-zinc-300 w-full" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={4} className="px-6 py-8 h-12 bg-zinc-900/20" /></tr>
              ))
            ) : users
                  .filter(u => u.roles.some(r => ["admin", "teacher"].includes(r)))
                  .map((user) => (
              <tr key={user.uid} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.roles.map(role => (
                      <span key={role} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-400 uppercase">
                        <Shield size={10} />
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="flex items-center gap-2 text-emerald-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                   <button 
                    onClick={() => { setSelectedUser(user); setIsResetModalOpen(true); }}
                    className="text-xs font-bold text-zinc-600 hover:text-amber-400 transition-colors"
                   >
                     Reset Password
                   </button>
                   <button className="text-xs font-bold text-zinc-600 hover:text-emerald-400 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && users.length === 0 && (
          <div className="py-20 text-center text-zinc-600">
            No users found in this school.
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div>
                <h3 className="text-xl font-bold text-white">Register New Member</h3>
                <p className="text-xs text-zinc-500 mt-1">Add staff or students to {currentSchool.name}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleAddUser} className="p-8 space-y-8">
              {/* Section: Personal Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon size={14} /> Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</span>
                    <div className="relative mt-1.5">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <input 
                        required 
                        className="premium-input pl-11" 
                        placeholder="Ex: Gabriel Silva" 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</span>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <input 
                        required 
                        type="email" 
                        className="premium-input pl-11" 
                        placeholder="gabriel@traceedu.com" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Section: Access & Role */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} /> Access Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Platform Role</span>
                    <div className="relative mt-1.5">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <select 
                        className="premium-input pl-11 appearance-none bg-zinc-950" 
                        value={formData.roles[0]} 
                        onChange={e => setFormData({ ...formData, roles: [e.target.value] })}
                      >
                        <option value="teacher">Teacher</option>
                        <option value="admin">School Admin</option>
                      </select>
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Initial Password (Optional)</span>
                    <div className="relative mt-1.5">
                      <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 opacity-50" />
                      <input 
                        type="password" 
                        className="premium-input pl-11" 
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={e => setFormData({ ...formData, password: e.target.value })} 
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-white transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                >
                  CREATE MEMBER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <p className="text-xs text-zinc-500 mt-1">For: {selectedUser?.name}</p>
            </header>
            <form onSubmit={handleResetPassword} className="p-8 space-y-6">
              <label className="block">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">New Password</span>
                <input 
                  required type="password" 
                  className="premium-input mt-2" 
                  placeholder="Enter new password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                />
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="flex-1 py-3 text-zinc-400 font-bold hover:text-white transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl transition-all">
                  UPDATE PASSWORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
