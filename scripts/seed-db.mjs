import fs from "fs";
import path from "path";
import crypto from "crypto";

const BRANCH_ID = "b1000000-1111-4111-8111-111111111111";
const now = new Date("2026-08-19T09:00:00.000Z");

function iso(d) {
  return d.toISOString();
}
function daysAgo(n, hour = 9, minute = 0) {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}
function monthsAgo(n, day = 10, hour = 9) {
  const d = new Date(now);
  d.setUTCMonth(d.getUTCMonth() - n);
  d.setUTCDate(day);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}
function id() {
  return crypto.randomUUID();
}

// ---------- Branches / Settings ----------
const branches = [
  {
    id: BRANCH_ID,
    name: "مركز ميدلينك الطبي - الفرع الرئيسي",
    address: "القاهرة الجديدة، التجمع الخامس",
    phone: "01000000000",
    status: "Active",
  },
];

const settings = {
  centerName: "مركز ميدلينك الطبي",
};

// ---------- Staff ----------
const staffDoctor1 = {
  id: id(),
  full_name: "د. أحمد المصري",
  staff_type: "Doctor",
  specialty: "جلدية وليزر",
  gender: "Male",
  phone: "01011111111",
  email: "ahmed.almasry@medlink.test",
  status: "Active",
  supervisor_staff_id: null,
  branch_id: BRANCH_ID,
};
const staffDoctor2 = {
  id: id(),
  full_name: "د. سارة عبد الله",
  staff_type: "Doctor",
  specialty: "تجميل وعناية بالبشرة",
  gender: "Female",
  phone: "01022222222",
  email: "sara.abdullah@medlink.test",
  status: "Active",
  supervisor_staff_id: null,
  branch_id: BRANCH_ID,
};
const staffSecretary = {
  id: id(),
  full_name: "مريم حسن",
  staff_type: "Secretary",
  specialty: "",
  gender: "Female",
  phone: "01033333333",
  email: "mariam.hassan@medlink.test",
  status: "Active",
  supervisor_staff_id: null,
  branch_id: BRANCH_ID,
};
const staffNurse = {
  id: id(),
  full_name: "هدى إبراهيم",
  staff_type: "Nurse",
  specialty: "تمريض عام",
  gender: "Female",
  phone: "01044444444",
  email: "hoda.ibrahim@medlink.test",
  status: "Active",
  supervisor_staff_id: staffDoctor1.id,
  branch_id: BRANCH_ID,
};

const staff = [staffDoctor1, staffDoctor2, staffSecretary, staffNurse];

// ---------- Users ----------
const ownerUser = {
  id: id(),
  email: "owner@medlink.test",
  username: "owner",
  full_name: "مالك المركز",
  role: "Owner",
  status: "Active",
  password: "Owner123!",
  staffId: null,
  created_at: iso(daysAgo(400)),
};
const secretaryUser = {
  id: id(),
  email: "secretary@medlink.test",
  username: "secretary",
  full_name: staffSecretary.full_name,
  role: "Secretary",
  status: "Active",
  password: "Secretary123!",
  staffId: staffSecretary.id,
  created_at: iso(daysAgo(300)),
};
const doctorUser = {
  id: id(),
  email: "doctor@medlink.test",
  username: "doctor",
  full_name: staffDoctor1.full_name,
  role: "Doctor",
  status: "Active",
  password: "Doctor123!",
  staffId: staffDoctor1.id,
  clinicianId: staffDoctor1.id,
  created_at: iso(daysAgo(300)),
};

const users = [ownerUser, secretaryUser, doctorUser];

// ---------- Services ----------
const services = [
  { id: id(), name: "كشف جلدية", price: 300, duration_minutes: 30, category: "Consultation", status: "Active" },
  { id: id(), name: "جلسة ليزر إزالة شعر", price: 450, duration_minutes: 45, category: "Laser", status: "Active" },
  { id: id(), name: "تنظيف بشرة عميق", price: 500, duration_minutes: 60, category: "Skincare", status: "Active" },
  { id: id(), name: "حقن فيلر", price: 1800, duration_minutes: 40, category: "Cosmetic", status: "Active" },
  { id: id(), name: "متابعة دورية", price: 150, duration_minutes: 20, category: "Consultation", status: "Active" },
];

// ---------- Devices ----------
const devices = [
  { id: id(), name: "جهاز ليزر ديود", type: "Laser", status: "Operational", branch_id: BRANCH_ID, serial_no: "LSR-1001", purchase_date: iso(monthsAgo(20)) },
  { id: id(), name: "جهاز تنظيف بشرة هيدرافيشل", type: "Skincare", status: "Operational", branch_id: BRANCH_ID, serial_no: "HYD-2002", purchase_date: iso(monthsAgo(14)) },
  { id: id(), name: "جهاز رج بالموجات فوق الصوتية", type: "Ultrasound", status: "UnderMaintenance", branch_id: BRANCH_ID, serial_no: "USG-3003", purchase_date: iso(monthsAgo(30)) },
  { id: id(), name: "جهاز قياس ضغط الدم", type: "Vitals", status: "OutOfService", branch_id: BRANCH_ID, serial_no: "BPX-4004", purchase_date: iso(monthsAgo(40)) },
];

// ---------- Rooms ----------
const rooms = [
  { id: id(), name: "غرفة الكشف 1", type: "Consultation", status: "Available", branch_id: BRANCH_ID },
  { id: id(), name: "غرفة الكشف 2", type: "Consultation", status: "Occupied", branch_id: BRANCH_ID },
  { id: id(), name: "غرفة الليزر", type: "Procedure", status: "Available", branch_id: BRANCH_ID },
  { id: id(), name: "غرفة العمليات الصغرى", type: "Procedure", status: "Occupied", branch_id: BRANCH_ID },
];

const treatment_beds = [
  { id: id(), room_id: rooms[3].id, name: "سرير 1", status: "Occupied" },
  { id: id(), room_id: rooms[3].id, name: "سرير 2", status: "Available" },
];

// ---------- Maintenance ----------
const maintenance = [
  {
    id: id(),
    device_id: devices[2].id,
    reason: "صيانة دورية لجهاز الموجات فوق الصوتية",
    status: "Pending",
    reported_at: iso(daysAgo(3)),
    completed_at: "",
    cost: 0,
    branch_id: BRANCH_ID,
  },
  {
    id: id(),
    device_id: devices[3].id,
    reason: "استبدال كابل الطاقة لجهاز قياس الضغط",
    status: "Completed",
    reported_at: iso(daysAgo(20)),
    completed_at: iso(daysAgo(18)),
    cost: 350,
    branch_id: BRANCH_ID,
  },
  {
    id: id(),
    device_id: devices[0].id,
    reason: "معايرة رأس الليزر",
    status: "Completed",
    reported_at: iso(daysAgo(45)),
    completed_at: iso(daysAgo(43)),
    cost: 600,
    branch_id: BRANCH_ID,
  },
];

// ---------- Package templates ----------
const packageTemplates = [
  { id: id(), name: "باقة إزالة الشعر بالليزر (6 جلسات)", sessions_count: 6, price: 2200, service_id: services[1].id, status: "Active" },
  { id: id(), name: "باقة العناية بالبشرة (4 جلسات)", sessions_count: 4, price: 1600, service_id: services[2].id, status: "Active" },
  { id: id(), name: "باقة متابعة شهرية", sessions_count: 3, price: 400, service_id: services[4].id, status: "Active" },
];

// ---------- Patients ----------
const patientNames = [
  { full_name: "منى السيد", gender: "Female" },
  { full_name: "خالد فتحي", gender: "Male" },
  { full_name: "ياسمين طارق", gender: "Female" },
  { full_name: "عمر شريف", gender: "Male" },
  { full_name: "نور الهدى محمود", gender: "Female" },
  { full_name: "كريم عادل", gender: "Male" },
  { full_name: "رنا حسام", gender: "Female" },
  { full_name: "محمد جمال", gender: "Male" },
];

const patients = patientNames.map((p, i) => ({
  id: id(),
  file_no: `F-${1000 + i}`,
  full_name: p.full_name,
  gender: p.gender,
  phone: `010${(50000000 + i * 1111).toString().slice(0, 8)}`,
  national_id: `2990101012345${i}`,
  email: `patient${i + 1}@example.test`,
  dob: iso(monthsAgo(300 + i * 12, 1)),
  status: i === 6 ? "Inactive" : "Active",
  joined_date: iso(monthsAgo(11 - i, 5)),
  branch_id: BRANCH_ID,
  address: "القاهرة",
  notes: "",
}));

// ---------- Appointments ----------
const doctorsForAppt = [staffDoctor1, staffDoctor2];
const appointmentStatuses = ["Completed", "Completed", "Completed", "Scheduled", "Waiting", "InSession", "Cancelled"];
const appointments = [];
for (let i = 0; i < 13; i++) {
  const patient = patients[i % patients.length];
  const doctor = doctorsForAppt[i % doctorsForAppt.length];
  const service = services[i % services.length];
  const status = appointmentStatuses[i % appointmentStatuses.length];
  const daysOffset = status === "Completed" ? 5 + i * 4 : status === "Cancelled" ? 10 : -(i % 4); // negative = future
  const start = daysAgo(daysOffset, 9 + (i % 6), 0);
  const end = new Date(start.getTime() + (service.duration_minutes || 30) * 60000);

  appointments.push({
    id: id(),
    patient_id: patient.id,
    patient_name: patient.full_name,
    doctor_id: doctor.id,
    doctor_name: doctor.full_name,
    service_id: service.id,
    type: service.name,
    status,
    billing_type: "PerVisit",
    package_subscription_id: null,
    room_id: rooms[i % rooms.length].id,
    bed_id: null,
    starts_at: iso(start),
    ends_at: iso(end),
    created_at: iso(new Date(start.getTime() - 2 * 24 * 3600000)),
    notes: "",
    branch_id: BRANCH_ID,
  });
}

// ---------- Treatment sessions (for completed appointments) ----------
const completedAppointments = appointments.filter((a) => a.status === "Completed");
const treatment_sessions = completedAppointments.map((a) => {
  const start = new Date(a.starts_at);
  const end = new Date(a.ends_at);
  return {
    id: id(),
    appointment_id: a.id,
    patient_id: a.patient_id,
    doctor_id: a.doctor_id,
    service_id: a.service_id,
    room_id: a.room_id,
    bed_id: null,
    billing_type: a.billing_type,
    package_subscription_id: null,
    status: "Completed",
    starts_at: a.starts_at,
    ends_at: a.ends_at,
    actual_started_at: iso(start),
    actual_ended_at: iso(end),
    completed_at: a.ends_at,
    prescription: null,
    clinical_notes: "الحالة مستقرة، تم إجراء الجلسة دون مضاعفات.",
    created_at: a.created_at,
    updated_at: a.ends_at,
  };
});

// ---------- Invoices / Payments ----------
const invoices = [];
const invoice_items = [];
const payments = [];
let invoiceSeq = 101;

completedAppointments.forEach((a, i) => {
  const service = services.find((s) => s.id === a.service_id);
  const unitPrice = service?.price ?? 300;
  const total = unitPrice;
  const invoiceId = id();
  const createdAt = a.ends_at;
  const isPaid = i % 3 !== 0; // most paid, some pending

  invoices.push({
    id: invoiceId,
    invoice_no: `INV-2026-${invoiceSeq++}`,
    appointment_id: a.id,
    patient_id: a.patient_id,
    branch_id: BRANCH_ID,
    subtotal: total,
    discount: 0,
    total_amount: total,
    status: isPaid ? "Paid" : "Unpaid",
    created_at: createdAt,
    branch: BRANCH_ID,
  });

  invoice_items.push({
    id: id(),
    invoice_id: invoiceId,
    service_id: service?.id ?? null,
    description: service?.name ?? "خدمة",
    quantity: 1,
    unit_price: unitPrice,
    discount_amount: 0,
  });

  if (isPaid) {
    payments.push({
      id: id(),
      invoice_id: invoiceId,
      patient_id: a.patient_id,
      amount: total,
      method: i % 2 === 0 ? "Cash" : "Card",
      paid_at: createdAt,
      voided_at: null,
      received_by_user_id: secretaryUser.id,
      branch_id: BRANCH_ID,
    });
  }
});

const payment_refunds = [];

// ---------- Expenses ----------
const expenseCategories = ["Maintenance", "Supplies", "Utilities", "Rent", "Salaries", "Marketing"];
const expenses = [];

// Maintenance-linked expenses
maintenance
  .filter((m) => m.status === "Completed")
  .forEach((m) => {
    expenses.push({
      id: id(),
      description: `تكلفة صيانة: ${m.reason}`,
      category: "Maintenance",
      source_type: "Maintenance",
      source_id: m.id,
      amount: m.cost,
      date: m.completed_at,
      payment_method: "Cash",
      status: "Paid",
      notes: "",
      created_by_user_id: ownerUser.id,
      branch_id: BRANCH_ID,
    });
  });

// General recurring/manual expenses across the last 3 months
const manualExpenses = [
  { category: "Rent", description: "إيجار الفرع الرئيسي", amount: 15000, monthsBack: 0, day: 1 },
  { category: "Rent", description: "إيجار الفرع الرئيسي", amount: 15000, monthsBack: 1, day: 1 },
  { category: "Rent", description: "إيجار الفرع الرئيسي", amount: 15000, monthsBack: 2, day: 1 },
  { category: "Salaries", description: "رواتب فريق العمل", amount: 42000, monthsBack: 0, day: 28 },
  { category: "Salaries", description: "رواتب فريق العمل", amount: 40000, monthsBack: 1, day: 28 },
  { category: "Utilities", description: "فاتورة كهرباء ومياه", amount: 2200, monthsBack: 0, day: 5 },
  { category: "Utilities", description: "فاتورة كهرباء ومياه", amount: 1950, monthsBack: 1, day: 5 },
  { category: "Supplies", description: "مستلزمات طبية استهلاكية", amount: 3400, monthsBack: 0, day: 12 },
  { category: "Supplies", description: "مستلزمات طبية استهلاكية", amount: 2800, monthsBack: 1, day: 12 },
  { category: "Marketing", description: "حملة إعلانية على السوشيال ميديا", amount: 2500, monthsBack: 0, day: 8 },
];

manualExpenses.forEach((e) => {
  expenses.push({
    id: id(),
    description: e.description,
    category: e.category,
    source_type: "Manual",
    source_id: null,
    amount: e.amount,
    date: iso(monthsAgo(e.monthsBack, e.day)),
    payment_method: "BankTransfer",
    status: "Paid",
    notes: "",
    created_by_user_id: ownerUser.id,
    branch_id: BRANCH_ID,
  });
});

// A pending expense (today)
expenses.push({
  id: id(),
  description: "طلب شراء أجهزة قياس جديدة",
  category: "Equipment",
  source_type: "Manual",
  source_id: null,
  amount: 5200,
  date: iso(daysAgo(0)),
  payment_method: "Cash",
  status: "Pending",
  notes: "بانتظار الموافقة",
  created_by_user_id: ownerUser.id,
  branch_id: BRANCH_ID,
});

// ---------- Misc empty collections ----------
const archived_items = [];
const invitations = [];
const revoked_sessions = [];
const internal_notes = [];
const follow_ups = [];
const notifications = [];
const audit_logs = [];
const package_session_usages = [];
const patient_packages = [];
const room_equipment = [];

const db = {
  branches,
  settings,
  staff,
  users,
  services,
  devices,
  rooms,
  treatment_beds,
  maintenance,
  "package-templates": packageTemplates,
  patients,
  appointments,
  treatment_sessions,
  invoices,
  invoice_items,
  payments,
  payment_refunds,
  expenses,
  archived_items,
  invitations,
  revoked_sessions,
  internal_notes,
  follow_ups,
  notifications,
  audit_logs,
  package_session_usages,
  patient_packages,
  room_equipment,
};

const outPath = path.resolve(process.cwd(), "db.json");
fs.writeFileSync(outPath, JSON.stringify(db, null, 2), "utf-8");
console.log("Seeded db.json with", Object.keys(db).map((k) => `${k}:${Array.isArray(db[k]) ? db[k].length : 1}`).join(", "));
