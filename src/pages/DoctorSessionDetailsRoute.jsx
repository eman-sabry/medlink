
import { useParams, useNavigate } from "react-router-dom";
import { useDoctorSessions } from "../hooks/useDoctorSessions";
import SessionDetailsPage from "./SessionDetailsPage";

export default function DoctorSessionDetailsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, isLoading } = useDoctorSessions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-foreground font-bold">
        جاري تحميل تفاصيل الجلسة...
      </div>
    );
  }

  const currentSession = appointments.find((app) => app.id === id);

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center font-sans">
        <h2 className="text-xl font-black text-foreground">عذراً، لم يتم العثور على هذه الجلسة أو الموعد</h2>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md cursor-pointer"
        >
          العودة للخلف
        </button>
      </div>
    );
  }

  return (
    <SessionDetailsPage
      sessionData={currentSession}
      onBack={() => navigate(-1)}
    />
  );
}