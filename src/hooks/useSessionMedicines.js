import { useState } from "react";

export function useSessionMedicines(initialMedicines = []) {
  const [medicines, setMedicines] = useState(initialMedicines);

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { id: Date.now(), name: "", dose: "", duration: "", notes: "" },
    ]);
  };

  const updateMedicine = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med)),
    );
  };

  const deleteMedicine = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  return { medicines, addMedicine, updateMedicine, deleteMedicine };
}
