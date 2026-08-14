import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { useAuth } from "./useAuth";
import { logActivity } from "../helpers/activityLog.helpers";
import { calculateCategoryCounts, extractEntityDisplayInfo } from "../helpers/archive.helpers";
import { ARCHIVE_ENTITY_CONFIG } from "../constants/archiveConstants";

const EMPTY_ARRAY = [];

export function useArchive() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const archiveQuery = useQuery({
    queryKey: ["archived_items"],
    queryFn: () => apiRequest("/archived_items"),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  const archivedItems = archiveQuery.data ?? EMPTY_ARRAY;

  const counts = useMemo(
    () => calculateCategoryCounts(archivedItems),
    [archivedItems],
  );

  // Move entity to archive mutation
  const moveToArchiveMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      deleteReason = "طلب نقل للأرشيف",
      originalData = null,
      title = "",
      subtitle = "",
      secondaryInfo = "",
    }) => {
      const display = originalData
        ? extractEntityDisplayInfo(entityType, originalData)
        : { title, subtitle, secondaryInfo };

      const payload = {
        entity_type: entityType,
        entity_id: String(entityId),
        delete_reason: deleteReason,
        archived_by: user?.full_name || "المسؤول",
        archived_by_user_id: user?.id || null,
        title: title || display.title,
        subtitle: subtitle || display.subtitle,
        secondary_info: secondaryInfo || display.secondaryInfo,
        original_data: originalData,
      };

      return await apiRequest("/archive/move", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (archivedRecord, variables) => {
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });
      
      const config = ARCHIVE_ENTITY_CONFIG[variables.entityType];
      if (config?.collectionKey) {
        queryClient.invalidateQueries({ queryKey: [config.collectionKey] });
      }
      // Also invalidate common aliases
      if (variables.entityType === "package") {
        queryClient.invalidateQueries({ queryKey: ["package-templates"] });
        queryClient.invalidateQueries({ queryKey: ["packages"] });
      }
      if (variables.entityType === "patient") {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      }
      if (variables.entityType === "appointment") {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      }
      if (variables.entityType === "invoice") {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["invoice_items"] });
      }
      if (variables.entityType === "expense") {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
      }
      if (variables.entityType === "device") {
        queryClient.invalidateQueries({ queryKey: ["devices"] });
      }
      if (variables.entityType === "service") {
        queryClient.invalidateQueries({ queryKey: ["services"] });
      }
      if (variables.entityType === "room") {
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      }
      if (variables.entityType === "maintenance") {
        queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      }

      logActivity({
        action: "ITEM_ARCHIVED",
        actorUserId: user?.id,
        entityType: variables.entityType,
        entityId: variables.entityId,
        details: `أرشفة: ${archivedRecord?.title || variables.entityId} — السبب: ${variables.deleteReason || "طلب حذف"}`,
      });

      const label = config?.singularLabel || "العنصر";
      toast.success(`تم نقل ${label} إلى الأرشيف بنجاح`);
    },
    onError: (err) => {
      console.error("Archive mutation error:", err);
      toast.error("فشل نقل العنصر إلى الأرشيف");
    },
  });

  // Restore entity from archive mutation
  const restoreMutation = useMutation({
    mutationFn: async (archivedItem) => {
      return await apiRequest(`/archive/${archivedItem.id}/restore`, {
        method: "POST",
        body: JSON.stringify({ id: archivedItem.id }),
      });
    },
    onSuccess: (_, archivedItem) => {
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });

      const config = ARCHIVE_ENTITY_CONFIG[archivedItem.entity_type];
      if (config?.collectionKey) {
        queryClient.invalidateQueries({ queryKey: [config.collectionKey] });
      }
      if (archivedItem.entity_type === "package") {
        queryClient.invalidateQueries({ queryKey: ["package-templates"] });
        queryClient.invalidateQueries({ queryKey: ["packages"] });
      }
      if (archivedItem.entity_type === "patient") {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      }
      if (archivedItem.entity_type === "appointment") {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      }
      if (archivedItem.entity_type === "invoice") {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["invoice_items"] });
      }
      if (archivedItem.entity_type === "expense") {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
      }
      if (archivedItem.entity_type === "device") {
        queryClient.invalidateQueries({ queryKey: ["devices"] });
      }
      if (archivedItem.entity_type === "service") {
        queryClient.invalidateQueries({ queryKey: ["services"] });
      }
      if (archivedItem.entity_type === "room") {
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      }
      if (archivedItem.entity_type === "maintenance") {
        queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      }

      logActivity({
        action: "ITEM_RESTORED",
        actorUserId: user?.id,
        entityType: archivedItem.entity_type,
        entityId: archivedItem.entity_id,
        details: `استعادة من الأرشيف: ${archivedItem.title || archivedItem.entity_id}`,
      });

      const label = config?.singularLabel || "العنصر";
      toast.success(`تمت استعادة ${label} بنجاح إلى النظام`);
    },
    onError: (err) => {
      console.error("Restore mutation error:", err);
      toast.error("فشلت استعادة العنصر من الأرشيف");
    },
  });

  // Permanent delete single item mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (archivedItem) => {
      return await apiRequest(`/archived_items/${archivedItem.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, archivedItem) => {
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });

      logActivity({
        action: "ITEM_PERMANENTLY_DELETED",
        actorUserId: user?.id,
        entityType: archivedItem.entity_type,
        entityId: archivedItem.entity_id,
        details: `حذف نهائي: ${archivedItem.title || archivedItem.entity_id}`,
      });

      toast.success("تم الحذف النهائي للعنصر بنجاح");
    },
    onError: (err) => {
      console.error("Permanent delete error:", err);
      toast.error("فشل الحذف النهائي للعنصر");
    },
  });

  // Empty all archive mutation
  const emptyArchiveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/archive/empty", {
        method: "DELETE",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });

      logActivity({
        action: "ARCHIVE_EMPTIED",
        actorUserId: user?.id,
        entityType: "archive",
        entityId: "all",
        details: `إفراغ سلة المحذوفات بالكامل (${data?.count ?? 0} عنصر)`,
      });

      toast.success("تم إفراغ سلة المحذوفات بالكامل بنجاح");
    },
    onError: (err) => {
      console.error("Empty archive error:", err);
      toast.error("فشل إفراغ سلة المحذوفات");
    },
  });

  return {
    ...archiveQuery,
    archivedItems,
    counts,
    moveToArchive: moveToArchiveMutation.mutateAsync,
    restoreArchivedItem: restoreMutation.mutateAsync,
    permanentDeleteArchivedItem: permanentDeleteMutation.mutateAsync,
    emptyArchive: emptyArchiveMutation.mutateAsync,
    isArchiving: moveToArchiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isDeletingPermanently: permanentDeleteMutation.isPending,
    isEmptying: emptyArchiveMutation.isPending,
  };
}
