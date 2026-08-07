import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTE_PERMISSIONS } from "../permissions/routePermissions";

import LoginPage from "../pages/LoginPage";
import AccessDeniedPage from "../pages/AccessDeniedPage";
import ProfilePage from "../pages/ProfilePage";
import DashboardRedirect from "../pages/DashboardRedirect";
import OwnerDashboardPage from "../pages/dashboards/OwnerDashboardPage";
import SecretaryDashboardPage from "../pages/dashboards/SecretaryDashboardPage";
import DoctorDashboardPage from "../pages/dashboards/DoctorDashboardPage";
import CenterPulsePage from "../pages/dashboards/CenterPulsePage";

import PatientsPage from "../pages/PatientsPage";
import AppointmentsPage from "../pages/AppointmentsPage";
import DoctorSessionDetailsRoute from "../pages/DoctorSessionDetailsRoute";
import DoctorSessionsPage from "../pages/DoctorSessionsPage";
import MedicalDevicesPage from "../pages/MedicalDevicesPage";
import PatientFollowUpPage from "../pages/PatientFollowUpPage";
import MaintenancePage from "../pages/MaintenancePage";
import PackageTemplatesPage from "../pages/PackageTemplatesPage";
import ServicesPage from "../pages/ServicesPage";
 import RoomsPage from "../pages/RoomsPage"; // الصفحة جاهزة، لكن المسار غير مفعل بعد

// كل مسار محمي يُلَف تلقائياً بـ ProtectedRoute مع الأدوار المسموح بها من ROUTE_PERMISSIONS
function protect(path, element) {
  return <ProtectedRoute roles={ROUTE_PERMISSIONS[path]}>{element}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={protect("/access-denied", <AccessDeniedPage />)} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={protect("/dashboard", <DashboardRedirect />)} />
      <Route path="/dashboard/owner" element={protect("/dashboard/owner", <OwnerDashboardPage />)} />
      <Route
        path="/dashboard/secretary"
        element={protect("/dashboard/secretary", <SecretaryDashboardPage />)}
      />
      <Route path="/dashboard/doctor" element={protect("/dashboard/doctor", <DoctorDashboardPage />)} />
      <Route path="/pulse" element={protect("/pulse", <CenterPulsePage />)} />

      <Route path="/profile" element={protect("/profile", <ProfilePage />)} />
      <Route path="/patients" element={protect("/patients", <PatientsPage />)} />
      <Route path="/appointments" element={protect("/appointments", <AppointmentsPage />)} />
      <Route path="/sessions" element={protect("/sessions", <DoctorSessionsPage />)} />
      <Route path="/sessions/:id" element={protect("/sessions", <DoctorSessionDetailsRoute />)} />
      <Route path="/devices" element={protect("/devices", <MedicalDevicesPage />)} />
      <Route path="/followup" element={protect("/followup", <PatientFollowUpPage />)} />
      <Route path="/maintenance" element={protect("/maintenance", <MaintenancePage />)} />
      <Route path="/packages" element={protect("/packages", <PackageTemplatesPage />)} />
      <Route path="/services" element={protect("/services", <ServicesPage />)} />
       <Route path="/rooms" element={protect("/rooms", <RoomsPage />)} /> 

      <Route
        path="*"
        element={protect(
          "*",
          <div className="flex h-[60vh] items-center justify-center font-bold text-muted-foreground">
            الصفحة غير موجودة (404)
          </div>,
        )}
      />
    </Routes>
  );
}
