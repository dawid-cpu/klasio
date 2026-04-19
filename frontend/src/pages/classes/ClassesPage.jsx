import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function ClassesPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '' })
  const qc = useQueryClient()

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes/').then((r) => r.data),
  })

  const createClass = useMutation({
    mutationFn: (data) => api.post('/classes/', data),
    onSuccess: () => {
      qc.invalidateQueries(['classes'])
      setForm({ name: '', subject: '' })
      setShowForm(false)
      toast.success('Klasa utworzona')
    },
  })

  const deleteClass = useMutation({
    mutationFn: (id) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['classes'])
      toast.success('Klasa usunięta')
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Moje klasy</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={16} /> Nowa klasa
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-semibold mb-4">Nowa klasa</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa klasy</label>
              <input
                placeholder="np. 3A"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Przedmiot</label>
              <input
                placeholder="np. Matematyka"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createClass.mutate(form)}
              disabled={!form.name || !form.subject}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              Utwórz
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Anuluj
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{c.name}</h4>
                <p className="text-sm text-gray-500">{c.subject} · {c.student_count} uczniów</p>
              </div>
              <button
                onClick={() => deleteClass.mutate(c.id)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <Link to={`/classes/${c.id}/attendance`}
                className="flex-1 text-center text-xs bg-primary-50 text-primary-700 px-3 py-2 rounded-lg font-medium hover:bg-primary-100">
                Frekwencja
              </Link>
              <Link to={`/classes/${c.id}/grades`}
                className="flex-1 text-center text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-200">
                Oceny
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
