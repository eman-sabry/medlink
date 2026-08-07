import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useInvoices() {
  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiRequest("/invoices"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    ...invoicesQuery,
    invoices: invoicesQuery.data ?? [],
  };
}
