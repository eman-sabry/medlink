import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function usePayments() {
  const paymentsQuery = useQuery({
    queryKey: ["payments"],
    queryFn: () => apiRequest("/payments"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    ...paymentsQuery,
    payments: paymentsQuery.data ?? [],
  };
}
