import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertTriangle } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function GradesPage() {
  const { classId } = useParams()
  const qc = useQueryClient()
  const [showGradeForm, setShowGradeForm] = useState(false)
  const [gradeForm, setGradeForm] = useState({ value: '', student_id: '', category_id: '', description: '' })

  const { data: students = [] } = useQuery({
    queryKey: ['students', classId],
    queryFn: () => api.get(`/classes/${classId}/students/`).then((r) => r.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', classId],
    queryFn: () => api.get(`/classes/${classId}/categories`).then((r) => r.data),
  })

  const { data: summary = [] } = useQuery({
    queryKey: ['grades-summary', classId],
    queryFn: () => api.get(`/classes/${classId}/grades/summary`).then((r) => r.data),
  })

  const addGrade = useMutation({
    mutationFn: (data) => api.post(`/classes/${classId}/grades`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades-summary', classId] })
      setGradeForm({ value: '', student_id: '', category_id: '', description: '' })
      setShowGradeForm(false)
      toast.success('Ocena dodana')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Błąd dodawania oceny'),
  })

  const atRisk = summary.filter((s) => s.at_risk)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Oceny</h2>
        <button
          onClick={() => setShowGradeForm(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={16} /> Dodaj ocenę
        </button>
      </div>

      {atRisk.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-700">Uczniowie zagrożeni oceną niedostateczną</span>
          </div>
          {atRisk.map((s) => (
            <p key={s.student_id} className="text-sm text-red-600">
              {s.name} — średnia: {s.average}
            </p>
          ))}
        </div>
      )}

      {showGradeForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold mb-4">Dodaj ocenę</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uczeń</label>
              <select
                value={gradeForm.student_id}
                onChange={(e) => setGradeForm({ ...gradeForm, student_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Wybierz ucznia</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.last_name} {s.first_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
              <select
                value={gradeForm.category_id}
                onChange={(e) => setGradeForm({ ...gradeForm, category_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Wybierz kategorię</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (waga: {c.weight})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ocena (1-6)</label>
              <input
                type="number" min="1" max="6" step="0.5"
                value={gradeForm.value}
                onChange={(e) => setGradeForm({ ...gradeForm, value: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opis (opcjonalnie)</label>
              <input
                type="text"
                value={gradeForm.description}
                onChange={(e) => setGradeForm({ ...gradeForm, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addGrade.mutate({ ...gradeForm, value: Number(gradeForm.value), student_id: Number(gradeForm.student_id), category_id: Number(gradeForm.category_id) })}
              disabled={!gradeForm.value || !gradeForm.student_id || !gradeForm.category_id}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              Dodaj
            </button>
            <button onClick={() => setShowGradeForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Anuluj
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Uczeń</th>
              <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Średnia</th>
              <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.student_id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={clsx('text-sm font-bold', s.at_risk ? 'text-red-600' : 'text-gray-900')}>
                    {s.average ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {s.at_risk && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Zagrożony</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
