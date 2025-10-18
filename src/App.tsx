import './App.css'
import { Toaster } from 'sonner'
import { Route, Routes } from "react-router"
import { Login } from './components/login'
import ProtectedRoute from './components/protect-route'
import { HrDashboard } from './components/pages/hr/dashboard'
import DashboardLayout from './components/pages/hr/dashboard-layout'
import DepartmentPage from './components/pages/hr/department'
import DesignationPage from './components/pages/hr/designation'
import LevelPage from './components/pages/hr/level'
import RolePage from './components/pages/hr/role'
import UserPage from './components/pages/hr/user'


function App() {

  return (
    <>

      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />


        {/* Protected routes */}
        <Route element={<ProtectedRoute roles={["HR"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/hr" element={<HrDashboard />} />
            <Route path="/hr/department" element={<DepartmentPage />} />
            <Route path="/hr/designation" element={<DesignationPage />} />
            <Route path="/hr/level" element={<LevelPage />} />
            <Route path="/hr/role" element={<RolePage />} />
            <Route path="/hr/user" element={<UserPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
