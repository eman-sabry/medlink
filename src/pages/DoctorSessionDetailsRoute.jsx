import { useParams } from "react-router-dom";
import SessionDetailsPage from "./SessionDetailsPage";

export default function DoctorSessionDetailsRoute() {
  const { id } = useParams();
  return <SessionDetailsPage appointmentId={id} />;
}
