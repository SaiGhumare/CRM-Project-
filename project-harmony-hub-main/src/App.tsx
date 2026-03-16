import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import HODRegister from "./pages/HODRegister";
import CreateUserPage from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import MentorDashboard from "./pages/dashboard/MentorDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentsPage from "./pages/dashboard/StudentsPage";
import GroupsPage from "./pages/dashboard/GroupsPage";
import AbstractsPage from "./pages/dashboard/AbstractsPage";
import DocumentsPage from "./pages/dashboard/DocumentsPage";
import ITRPage from "./pages/dashboard/ITRPage";
import CertificatesPage from "./pages/dashboard/CertificatesPage";
import ITRStudentListPage from "./pages/dashboard/ITRStudentListPage";
import ProjectMentorsPage from "./pages/dashboard/ProjectMentorsPage";
import OverallDocumentsPage from "./pages/dashboard/OverallDocumentsPage";
import NoticePage from "./pages/dashboard/NoticePage";
import SampleDocumentsPage from "./pages/dashboard/SampleDocumentsPage";
import ITRCoordinatorPage from "./pages/dashboard/ITRCoordinatorPage";
import ITRCoordinatorDashboard from "./pages/dashboard/ITRCoordinatorDashboard";
import { ITRCoordStudentListPage, ITRCoordAttendancePage, ITRCoordNoticesPage, ITRCoordAssignmentsPage, ITRCoordDocumentsPage, ITRCoordCertificatesPage, ITRCoordFeesPage } from "./pages/dashboard/ITRCoordinatorSubPages";
import ITRDocumentsPage from "./pages/dashboard/ITRDocumentsPage";
import ITRCertificatesPage from "./pages/dashboard/ITRCertificatesPage";
import ITRDailyDetailsPage from "./pages/dashboard/ITRDailyDetailsPage";
import StudentGroupPage from "./pages/dashboard/student/StudentGroupPage";
import StudentAbstractsPage from "./pages/dashboard/student/StudentAbstractsPage";
import StudentDocumentsPage from "./pages/dashboard/student/StudentDocumentsPage";
import StudentITRPage from "./pages/dashboard/student/StudentITRPage";
import StudentCertificatesPage from "./pages/dashboard/student/StudentCertificatesPage";
import StudentSampleDocumentsPage from "./pages/dashboard/student/StudentSampleDocumentsPage";
import StudentAssignmentsPage from "./pages/dashboard/student/StudentAssignmentsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/hod-register" element={<HODRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/students" element={<StudentsPage role="admin" />} />
            <Route path="/dashboard/admin/notices" element={<NoticePage role="admin" />} />
            <Route path="/dashboard/admin/project-mentors" element={<ProjectMentorsPage />} />
            <Route path="/dashboard/admin/groups" element={<GroupsPage role="admin" />} />
            <Route path="/dashboard/admin/abstracts" element={<AbstractsPage role="admin" />} />
            <Route path="/dashboard/admin/create-user" element={<CreateUserPage />} />
            <Route path="/dashboard/admin/sample-documents" element={<SampleDocumentsPage />} />
            <Route path="/dashboard/admin/documents" element={<DocumentsPage role="admin" />} />
            <Route path="/dashboard/admin/certificates" element={<CertificatesPage role="admin" />} />
            <Route path="/dashboard/admin/itr-students" element={<ITRStudentListPage role="admin" />} />
            <Route path="/dashboard/admin/itr-coordinator" element={<ITRCoordinatorPage />} />
            <Route path="/dashboard/admin/itr-documents" element={<ITRDocumentsPage role="admin" />} />
            <Route path="/dashboard/admin/itr-certificates" element={<ITRCertificatesPage role="admin" />} />
            <Route path="/dashboard/admin/itr-daily" element={<ITRDailyDetailsPage role="admin" />} />
            
            {/* Mentor Routes */}
            <Route path="/dashboard/mentor" element={<MentorDashboard />} />
            <Route path="/dashboard/mentor/students" element={<StudentsPage role="mentor" />} />
            <Route path="/dashboard/mentor/notices" element={<NoticePage role="mentor" />} />
            <Route path="/dashboard/mentor/groups" element={<GroupsPage role="mentor" />} />
            <Route path="/dashboard/mentor/abstracts" element={<AbstractsPage role="mentor" />} />
            <Route path="/dashboard/mentor/sample-documents" element={<SampleDocumentsPage />} />
            <Route path="/dashboard/mentor/documents" element={<DocumentsPage role="mentor" />} />
            <Route path="/dashboard/mentor/itr-students" element={<ITRStudentListPage role="mentor" />} />
            <Route path="/dashboard/mentor/itr-documents" element={<ITRDocumentsPage role="mentor" />} />
            <Route path="/dashboard/mentor/itr-daily" element={<ITRDailyDetailsPage />} />
            <Route path="/dashboard/mentor/itr-certificates" element={<ITRCertificatesPage role="mentor" />} />
            <Route path="/dashboard/mentor/certificates" element={<CertificatesPage role="mentor" />} />
            <Route path="/dashboard/mentor/overall-documents" element={<OverallDocumentsPage role="mentor" />} />
            
            {/* ITR Coordinator Routes */}
            <Route path="/dashboard/itr_coordinator" element={<ITRCoordinatorDashboard />} />
            <Route path="/dashboard/itr_coordinator/students" element={<ITRCoordStudentListPage />} />
            <Route path="/dashboard/itr_coordinator/attendance" element={<ITRCoordAttendancePage />} />
            <Route path="/dashboard/itr_coordinator/notices" element={<ITRCoordNoticesPage />} />
            <Route path="/dashboard/itr_coordinator/assignments" element={<ITRCoordAssignmentsPage />} />
            <Route path="/dashboard/itr_coordinator/documents" element={<ITRCoordDocumentsPage />} />
            <Route path="/dashboard/itr_coordinator/certificates" element={<ITRCoordCertificatesPage />} />
            <Route path="/dashboard/itr_coordinator/fees" element={<ITRCoordFeesPage />} />
            
            {/* Student Routes */}
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/student/group" element={<StudentGroupPage />} />
            <Route path="/dashboard/student/notices" element={<NoticePage role="student" />} />
            <Route path="/dashboard/student/abstracts" element={<StudentAbstractsPage />} />
            <Route path="/dashboard/student/documents" element={<StudentDocumentsPage />} />
            <Route path="/dashboard/student/itr" element={<StudentITRPage />} />
            <Route path="/dashboard/student/certificates" element={<StudentCertificatesPage />} />
            <Route path="/dashboard/student/assignments" element={<StudentAssignmentsPage />} />
            <Route path="/dashboard/student/sample-documents" element={<StudentSampleDocumentsPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
