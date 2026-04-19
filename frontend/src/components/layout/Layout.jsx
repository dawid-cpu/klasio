import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react'
import clsx from 'clsx'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-5 border-b">
          <h1 className="text-xl font-bold text-primary-600">Klasio</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.full_name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100')
            }
          >
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink
            to="/classes"
            className={({ isActive }) =>
              clsx('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100')
            }
          >
            <BookOpen size={18} /> Moje klasy
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-4 text-sm text-gray-500 hover:text-red-600 border-t"
        >
          <LogOut size={18} /> Wyloguj
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
