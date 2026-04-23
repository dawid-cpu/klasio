import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../api/client'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_LABELS = { present: 'Obecny', absent: 'Nieobecny', late: 'Spóźniony' }
const STATUS_COLORS = {
  present: 'bg-green-100 text-green-700 border-green-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  late: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

export default function AttendancePage() {
  const { classId } = useParams()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [statuses, setStatuses] = useState({})

  const { data: students = [] } = useQuery({
    queryKey: ['students', classId],
    queryFn: () => api.get(`/classes/${classId}/students/`).then((r) => r.data),
  })

  useEffect(() => {
    if (students.length > 0 && Object.keys(statuses).length === 0) {
      const initial = {}
      students.forEach((s) => { initial[s.id] = 'present' })
      setStatuses(initial)
    }
  }, [students])

  const saveMutation = useMutation({
    mutationFn: () => api.post(`/classes/${classId}/attendance/`, {
      date,
      entries: Object.entries(statuses).map(([id, status]) => ({ student_id: Number(id), status })),
    }),
    onSuccess: () => toast.success('Frekwencja zapisana!'),
    onError: (err) => toast.error(err.response?.data?.detail || 'Błąd zapisu frekwencji'),
  })

  const toggle = (id, status) => setStatuses((prev) => ({ ...prev, [id]: status }))

  const markAll = (status) => {
    const all = {}
    students.forEach((s) => { all[s.id] = status })
    setStatuses(all)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frekwencja</h2>

      <div className="bg-white rounded-xl border p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => markAll('present')} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100">
              Wszyscy obecni
            </button>
            <button onClick={() => markAll('absent')} className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100">
              Wszyscy nieobecni
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm font-medium text-gray-900">
                {student.student_number}. {student.last_name} {student.first_name}
              </span>
              <div className="flex gap-2">
                {['present', 'absent', 'late'].map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(student.id, s)}
                    className={clsx(
                      'text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
                      statuses[student.id] === s ? STATUS_COLORS[s] : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending || students.length === 0}
        className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {saveMutation.isPending ? 'Zapisywanie...' : 'Zapisz frekwencję'}
      </button>
    </div>
  )
}
