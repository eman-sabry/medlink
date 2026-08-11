import { Tag, Hash, MapPin, Activity } from "lucide-react";

export function getDeviceFormFields(roomOptions = []) {
  return [
    {
      name: "name",
      label: "اسم الجهاز",
      type: "text",
      placeholder: "مثال: جهاز علاج طبيعي 1",
      icon: Tag,
    },
    {
      name: "serial_number",
      label: "الرقم التسلسلي (Serial Number)",
      type: "text",
      placeholder: "مثال: SN-DEV-991",
      icon: Hash,
    },
    {
      name: "room_id",
      label: "الغرفة",
      type: "select",
      icon: MapPin,
      options: [{ label: "بدون غرفة", value: "" }, ...roomOptions],
    },
    {
      name: "status",
      label: "حالة الجهاز",
      type: "select",
      icon: Activity,
      options: [
        { label: "تعمل (Operational)", value: "Operational" },
        { label: "صيانة (Maintenance)", value: "Maintenance" },
        { label: "خارج الخدمة (Out-Of-Service)", value: "Out-Of-Service" },
      ],
    },
  ];
}
