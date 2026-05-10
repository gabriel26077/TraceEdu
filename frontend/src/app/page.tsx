"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStatus, resStudents, resStats] = await Promise.all([
          fetch("http://localhost:8000/api/status").then((r) => r.json()),
          fetch("http://localhost:8000/api/students").then((r) => r.json()),
          fetch("http://localhost:8000/api/stats").then((r) => r.json()),
        ]);
        setStatus(resStatus);
        setStudents(resStudents);
        setStats(resStats);
      } catch (error) {
        console.error("Error fetching API data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 md:p-16">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              TraceEdu
            </h1>
            <p className="text-zinc-400 mt-2">Simplified Academic Traceability</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              {status ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              )}
            </span>
            <span className="text-sm font-medium text-zinc-300">
              {status ? "API Connected" : "API Offline"}
            </span>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors duration-300">
            <h3 className="text-zinc-400 text-sm font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-white">{stats?.total_students || 0}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors duration-300">
            <h3 className="text-zinc-400 text-sm font-medium mb-2">Active Classes</h3>
            <p className="text-3xl font-bold text-white">{stats?.active_classes || 0}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors duration-300">
            <h3 className="text-zinc-400 text-sm font-medium mb-2">Pending Grades</h3>
            <p className="text-3xl font-bold text-emerald-400">{stats?.pending_grades || 0}</p>
          </div>
        </section>

        {/* Students Table */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">Recent Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-950/50 text-zinc-400 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-zinc-500">#{student.id}</td>
                    <td className="px-6 py-4 font-medium text-zinc-200">{student.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{student.grade}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === "Aprovada"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
