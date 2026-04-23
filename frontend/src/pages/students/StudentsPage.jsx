import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

const EMPTY_FORM = { first_name: '', last_name: '', student_number: '', notes: '' }

export default function StudentsPage() {
  const { classId } = useParams()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expanded, setExpanded] = useState(null)

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', classId],
    queryFn: () => api.get(`/classes/${classId}/students/`).then((r) => r.data),
  })

  const addStudent = useMutation({
    mutationFn: (data) => api.post(`/classes/${classId}/students/`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students', classId] })
      qc.invalidateQueries({ queryKey: ['classes'] })
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success('Uczeń dodany')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Błąd dodawania ucznia'),
  })

  const deleteStudent = useMutation({
    mutationFn: (id) => api.delete(`/classes/${classId}/students/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students', classId] })
      qc.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Uczeń usunięty')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Błąd usuwania ucznia'),
  })

  const handleSubmit = () => {
    const num = Number(form.student_number)
    if (!form.first_name || !form.last_name || !num) {
      toast.error('Wypełnij imię, nazwisko i numer')
      return
    }
    addStudent.mutate({ ...form, student_number: num })
  }

  const sorted = [...students].sort((a, b) => a.student_number - b.student_number)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lista uczniów</h2>
          <p className="text-sm text-gray-500 mt-1">{students.length} uczniów w klasie</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={16} /> Dodaj ucznia
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Nowy uczeń</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Imię</label>
              <input
                placeholder="np. Jan"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nazwisko</label>
              <input
                placeholder="np. Kowalski"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Numer w dzienniku</label>
              <input
                type="number" min="1" placeholder="np. 1"
                value={form.student_number}
                onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notatki o uczniu (opcjonalnie)</label>
            <textarea
              rows={3}
              placeholder="np. Dysleksja, wymaga dodatkowej uwagi..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={addStudent.isPending}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {addStudent.isPending ? 'Dodawanie...' : 'Dodaj ucznia'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400 text-sm">Ładowanie...</div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium mb-1">Brak uczniów w tej klasie</p>
          <p className="text-sm text-gray-400">Dodaj pierwszego ucznia przyciskiem powyżej</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {sorted.map((s, i) => (
            <div key={s.id} className={i < sorted.length - 1 ? 'border-b' : ''}>
              <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {s.student_number}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.last_name} {s.first_name}</p>
                    {s.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-md truncate">{s.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {s.notes && (
                    <button
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                      className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      {expanded === s.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  )}
                  <button
                    onClick={() => deleteStudent.mutate(s.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {expanded === s.id && s.notes && (
                <div className="px-5 pb-4 pt-0">
                  <div className="ml-12 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                    <p className="text-xs font-medium text-amber-700 mb-1">Notatki</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
