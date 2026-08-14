import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "./useAuth";
import { canAccessRoute } from "../permissions/routePermissions";

export function useGlobalSearch() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounce input to prevent unnecessary requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const enabled = debouncedTerm.length > 0;

  const {
    data: rawResults = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["global-search", debouncedTerm],
    queryFn: async () => {
      if (!debouncedTerm) return [];
      return await apiRequest(`/search?q=${encodeURIComponent(debouncedTerm)}`);
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds cache
    refetchOnWindowFocus: false,
  });

  // Filter based on user's active RBAC permissions
  const filteredResults = useMemo(() => {
    const userRole = user?.role || "User";
    return (rawResults || []).filter((item) => {
      if (!item.route) return true;
      return canAccessRoute(userRole, item.route);
    });
  }, [rawResults, user?.role]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups = new Map();
    filteredResults.forEach((item) => {
      const cat = item.category || "أخرى";
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat).push(item);
    });
    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [filteredResults]);

  // Flattened list for keyboard navigation
  const flatItems = useMemo(() => {
    return groupedResults.flatMap((g) => g.items);
  }, [groupedResults]);

  const safeSelectedIndex = selectedIndex < flatItems.length ? selectedIndex : 0;

  const handleSetSearchTerm = (term) => {
    setSearchTerm(term);
    setSelectedIndex(0);
  };

  return {
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    debouncedTerm,
    isOpen,
    setIsOpen,
    selectedIndex: safeSelectedIndex,
    setSelectedIndex,
    isLoading: isLoading && enabled,
    isError,
    error,
    refetch,
    rawResults,
    filteredResults,
    groupedResults,
    flatItems,
  };
}
