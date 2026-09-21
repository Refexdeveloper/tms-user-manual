import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MyTripPage from './pages/MyTripPage'
import NewRequestPage from './pages/NewRequestPage'
import RequestDetailPage from './pages/RequestDetailPage'
import InboxPage from './pages/InboxPage'
import NewAdvancePage from './pages/NewAdvancePage'
import AdvanceDetailPage from './pages/AdvanceDetailPage'
import AdvancesListPage from './pages/AdvancesListPage'
import NewExpensePage from './pages/NewExpensePage'
import ExpenseDetailPage from './pages/ExpenseDetailPage'
import ExpensesListPage from './pages/ExpensesListPage'
import Shell from './components/Shell'

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-shell">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Private>
            <Shell />
          </Private>
        }
      >
        <Route index element={<MyTripPage />} />
        <Route path="booking" element={<Navigate to="/" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="new" element={<NewRequestPage />} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route path="requests/:id/edit" element={<NewRequestPage />} />
        <Route path="advances" element={<AdvancesListPage />} />
        <Route path="advances/new" element={<NewAdvancePage />} />
        <Route path="advances/:id" element={<AdvanceDetailPage />} />
        <Route path="expenses" element={<ExpensesListPage />} />
        <Route path="expenses/new" element={<NewExpensePage />} />
        <Route path="expenses/:id" element={<ExpenseDetailPage />} />
        <Route path="inbox" element={<InboxPage />} />
      </Route>
    </Routes>
  )
}
