import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";

export function useTreatmentSessions() {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ["treatment_sessions"],
    queryFn: () => apiRequest("/treatment_sessions"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, notes }) =>
      apiRequest(`/treatment_sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment_sessions"] });
      toast.success("تمت إضافة الملاحظة الطبية بنجاح");
    },
    onError: () => toast.error("فشلت إضافة الملاحظة الطبية"),
  });

  const addPrescriptionMutation = useMutation({
    mutationFn: ({ id, prescription }) =>
      apiRequest(`/treatment_sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ prescription }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment_sessions"] });
      toast.success("تمت إضافة الروشتة بنجاح");
    },
    onError: () => toast.error("فشلت إضافة الروشتة"),
  });

  return {
    ...sessionsQuery,
    treatmentSessions: sessionsQuery.data ?? [],
    addNote: addNoteMutation.mutateAsync,
    addPrescription: addPrescriptionMutation.mutateAsync,
  };
}
