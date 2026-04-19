import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth'
import { Link } from 'react-router-dom'
import { BookOpen, AlertTriangle } from 'lucide-react'
import api from '../../api/client'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes/').then((r) => r.data),
  })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Dzień dobry, {user?.full_name?.split(' ')[0]}
      </h2>
      <p className="text-gray-500 mb-8">Oto twój panel nauczyciela</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={20} className="text-primary-600" />
            <span className="text-sm text-gray-500">Twoje klasy</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle size={20} className="text-yellow-500" />
            <span className="text-sm text-gray-500">Łącznie uczniów</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {classes.reduce((sum, c) => sum + c.student_count, 0)}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Twoje klasy</h3>
      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych klas</p>
          <Link to="/classes" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
            Dodaj pierwszą klasę
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
              <h4 className="font-semibold text-gray-900">{c.name}</h4>
              <p className="text-sm text-gray-500 mb-4">{c.subject} · {c.student_count} uczniów</p>
              <div className="flex gap-2">
                <Link to={`/classes/${c.id}/attendance`}
                  className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg font-medium hover:bg-primary-100">
                  Frekwencja
                </Link>
                <Link to={`/classes/${c.id}/grades`}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200">
                  Oceny
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
