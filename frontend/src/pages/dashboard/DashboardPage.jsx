import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth'
import { Link } from 'react-router-dom'
import { BookOpen, Users, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'
import api from '../../api/client'

function DonutChart({ value, total, color, label }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">
          {pct}%
        </text>
      </svg>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  )
}

function ClassCard({ c }) {
  const { data: attendanceStats = [] } = useQuery({
    queryKey: ['attendance-stats', c.id],
    queryFn: () => api.get(`/classes/${c.id}/attendance/stats`).then((r) => r.data),
    staleTime: 60_000,
  })

  const { data: gradesSummary = [] } = useQuery({
    queryKey: ['grades-summary', String(c.id)],
    queryFn: () => api.get(`/classes/${c.id}/grades/summary`).then((r) => r.data),
    staleTime: 60_000,
  })

  const atRiskAttendance = attendanceStats.filter((s) => s.at_risk).length
  const avgAttendance = attendanceStats.length
    ? Math.round(attendanceStats.reduce((sum, s) => sum + s.attendance_rate, 0) / attendanceStats.length)
    : null

  const gradedStudents = gradesSummary.filter((s) => s.average !== null)
  const avgGrade = gradedStudents.length
    ? (gradedStudents.reduce((sum, s) => sum + s.average, 0) / gradedStudents.length).toFixed(2)
    : null

  const attendanceColor =
    avgAttendance === null ? '#9ca3af'
    : avgAttendance >= 90 ? '#16a34a'
    : avgAttendance >= 75 ? '#2563eb'
    : avgAttendance >= 60 ? '#d97706'
    : '#dc2626'

  return (
    <div className="bg-white rounded-xl border hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-900 text-base">{c.name}</h4>
          <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
            {c.subject}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Users size={14} />
          <span className="text-sm font-medium">{c.student_count}</span>
        </div>
      </div>

      <div className="flex items-center justify-around py-3 border-t border-b mb-4">
        {avgAttendance !== null ? (
          <DonutChart value={avgAttendance} total={100} color={attendanceColor} label="Frekwencja" />
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-[72px] h-[72px] rounded-full border-8 border-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">brak</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">Frekwencja</span>
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-gray-900">{avgGrade ?? '—'}</span>
          <span className="text-xs text-gray-500">Śr. ocen</span>
        </div>
        {atRiskAttendance > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-lg font-bold text-red-600">{atRiskAttendance}</span>
            </div>
            <span className="text-xs text-gray-500">Zagrożonych</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          to={`/classes/${c.id}/students`}
          className="flex-1 text-center text-xs bg-gray-50 text-gray-700 px-2 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Uczniowie
        </Link>
        <Link
          to={`/classes/${c.id}/attendance`}
          className="flex-1 text-center text-xs bg-primary-50 text-primary-700 px-2 py-2 rounded-lg font-medium hover:bg-primary-100 transition-colors"
        >
          Frekwencja
        </Link>
        <Link
          to={`/classes/${c.id}/grades`}
          className="flex-1 text-center text-xs bg-gray-100 text-gray-700 px-2 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Oceny
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes/').then((r) => r.data),
  })

  const totalStudents = classes.reduce((sum, c) => sum + c.student_count, 0)
  const today = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dzień dobry, {user?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 mt-1 capitalize">{today}</p>
        </div>
        <Link
          to="/classes"
          className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700"
        >
          Zarządzaj klasami <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <BookOpen size={16} className="text-primary-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Klasy</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Uczniowie</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Przedmioty</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {new Set(classes.map((c) => c.subject)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Śr. uczniów / klasę</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {classes.length ? Math.round(totalStudents / classes.length) : 0}
          </p>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium mb-1">Nie masz jeszcze żadnych klas</p>
          <Link
            to="/classes"
            className="inline-block mt-3 bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Dodaj pierwszą klasę
          </Link>
        </div>
      ) : (
        <>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Twoje klasy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <ClassCard key={c.id} c={c} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
