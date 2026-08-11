import { toDateInputValue } from "../utils/date";

export function filterAppointments(appointments, { searchTerm, statusFilter, dateFilter }) {
  return appointments.filter((app) => {
    const patientText = app.patient_name || app.patient_id || "";
    const doctorText = app.doctor_name || app.doctor_id || "";
    const matchesSearch =
      patientText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.patient_phone && app.patient_phone.includes(searchTerm)) ||
      (app.patient_file_no && app.patient_file_no.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    let matchesDate = true;
    if (dateFilter && app.starts_at) {
      const appDateValue = toDateInputValue(app.starts_at);
      matchesDate = appDateValue !== null && appDateValue === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
}
