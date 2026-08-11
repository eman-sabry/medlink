import { useCallback, useMemo, useState } from "react";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { PatientCard } from "../components/patients/PatientCard";
import { PatientTable } from "../components/patients/PatientTable";
import { AddPatientModal } from "../components/patients/AddPatientModal";
import { EditPatientModal } from "../components/patients/EditPatientModal";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { PermissionGuard } from "../guards/PermissionGuard";
import { PATIENT_STATUS_FILTER_OPTIONS } from "../helpers/statusFilters";
import { useNavigate } from "react-router-dom";

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const {
    patients,
    isLoading,
    isError,
    addPatient,
    updatePatient,
    deletePatient,
  } = usePatients();

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => {
        const matchesSearch =
          p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.file_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone?.includes(searchQuery);
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [patients, searchQuery, statusFilter],
  );

  const handleEditPatient = useCallback((patient) => {
    setSelectedPatient(patient);
    setIsEditOpen(true);
  }, []);

  const handleDeletePatient = useCallback((id) => deletePatient(id), [deletePatient]);

  const handleViewPatientDetails = useCallback(
    (id) => navigate(`/patients/${id}`),
    [navigate],
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mt-2">
            إدارة المرضى
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            عرض وتعديل بيانات ومتابعة المرضى المسجلين في النظام.
          </p>
        </div>
        <PermissionGuard permission="patients:add">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>إضافة مريض جديد</span>
          </button>
        </PermissionGuard>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث بالاسم، رقم الملف، أو رقم الهاتف..."
            className="max-w-md"
          />
          <StatusFilterDropdown
            options={PATIENT_STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted p-1 rounded-2xl border border-border self-start">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span>جدول</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>كروت</span>
          </button>
        </div>
      </div>

      {isLoading && patients.length === 0 ? (
        <LoadingState message="جاري تحميل بيانات المرضى..." rounded="rounded-3xl" />
      ) : isError ? (
        <ErrorState />
      ) : viewMode === "table" ? (
        <PatientTable
          patients={filteredPatients}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onViewDetails={handleViewPatientDetails}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
              onViewDetails={handleViewPatientDetails}
            />
          ))}
        </div>
      )}

      <AddPatientModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={async (formData) => {
          await addPatient(formData);
          setIsAddOpen(false);
        }}
      />

      <EditPatientModal
        isOpen={isEditOpen}
        patient={selectedPatient}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPatient(null);
        }}
        onUpdate={async (id, data) => {
          await updatePatient({ id, data });
        }}
      />
    </div>
  );
}
