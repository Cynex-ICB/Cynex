import { Navigate, Route, Routes } from 'react-router-dom';
import RoleGuard from './components/RoleGuard';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminAssessments from './pages/admin/AdminAssessments';
import AdminDashboard from './pages/admin/AdminDashboard';
import AssessmentResults from './pages/admin/AssessmentResults';
import CreateAssessment from './pages/admin/CreateAssessment';
import QuestionReview from './pages/admin/QuestionReview';
import ResultDetails from './pages/student/ResultDetails';
import StartAssessment from './pages/student/StartAssessment';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentResults from './pages/student/StudentResults';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<RoleGuard role="admin" />}>
        <Route element={<Sidebar role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/assessments" element={<AdminAssessments />} />
          <Route path="/admin/assessments/create" element={<CreateAssessment />} />
          <Route path="/admin/assessments/:id/questions" element={<QuestionReview />} />
          <Route path="/admin/assessments/:id/results" element={<AssessmentResults />} />
        </Route>
      </Route>

      <Route element={<RoleGuard role="student" />}>
        <Route element={<Sidebar role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/assessments" element={<StudentAssessments />} />
          <Route path="/student/assessments/:id/start" element={<StartAssessment />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/results/:attemptId" element={<ResultDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
