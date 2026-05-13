"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { ClipboardList, Plus, Book, User, Calendar, Search } from "lucide-react"
import { useSchool } from "@/contexts/SchoolContext"

interface Offering {
  uid: string
  subject_id: string
  period: string
  teacher_ids: string[]
}

export default function OfferingsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const { currentSchool } = useSchool()

  async function fetchOfferings() {
    if (!currentSchool) return
    setLoading(true)
    try {
      // For now we might need a generic list or school-specific
      const data = await api.get<Offering[]>(`/schools/${currentSchool.uid}/subject-offerings`)
      setOfferings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOfferings()
  }, [currentSchool])

  if (!currentSchool) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Subject Offerings</h2>
          <p className="text-zinc-500 mt-1">Manage teaching assignments for <span className="text-emerald-400 font-semibold">{currentSchool.name}</span></p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all">
          <Plus size={20} />
          <span>New Offering</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-zinc-900/50 animate-pulse" />
          ))
        ) : offerings.map((offering) => (
          <div key={offering.uid} className="glass-card p-6 border-zinc-800/50 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Book size={24} />
              </div>
              <div className="px-3 py-1 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-700">
                {offering.period}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-4">
              Subject ID: {offering.subject_id.split("-")[0]}...
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <User size={14} className="text-zinc-600" />
                <span>{offering.teacher_ids.length} Teachers Assigned</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar size={14} className="text-zinc-600" />
                <span>Semester Schedule Active</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800 flex gap-2">
               <button className="flex-1 py-2 text-xs font-bold text-zinc-400 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 hover:text-white transition-all">
                 Manage Students
               </button>
               <button className="flex-1 py-2 text-xs font-bold text-emerald-500/80 bg-emerald-500/5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-all border border-emerald-500/10">
                 Edit Teachers
               </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && offerings.length === 0 && (
        <div className="py-20 text-center bg-zinc-900/10 rounded-3xl border border-dashed border-zinc-800">
           <ClipboardList size={48} className="mx-auto text-zinc-800 mb-4" />
           <p className="text-zinc-500">No active offerings for this school.</p>
           <button className="mt-4 text-sm font-bold text-emerald-500 hover:underline">Create the first one</button>
        </div>
      )}
    </div>
  )
}
