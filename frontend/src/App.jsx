import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ClassesPage from './pages/classes/ClassesPage'
import StudentsPage from './pages/students/StudentsPage'
import AttendancePage from './pages/attendance/AttendancePage'
import GradesPage from './pages/grades/GradesPage'
import Layout from './components/layout/Layout'

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/:classId/students" element={<StudentsPage />} />
        <Route path="classes/:classId/attendance" element={<AttendancePage />} />
        <Route path="classes/:classId/grades" element={<GradesPage />} />
      </Route>
    </Routes>
  )
}
