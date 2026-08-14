import { useState, useMemo } from "react";
import { Archive, SearchX } from "lucide-react";
import { useArchive } from "../hooks/useArchive";
import { ArchiveHeader } from "../components/archive/ArchiveHeader";
import { ArchiveWarningBanner } from "../components/archive/ArchiveWarningBanner";
import { ArchiveCategoryTabs } from "../components/archive/ArchiveCategoryTabs";
import { ArchiveToolbar } from "../components/archive/ArchiveToolbar";
import { ArchiveCard } from "../components/archive/ArchiveCard";
import { PermanentDeleteModal } from "../components/archive/PermanentDeleteModal";
import { EmptyArchiveModal } from "../components/archive/EmptyArchiveModal";
import { RestoreConfirmModal } from "../components/archive/RestoreConfirmModal";
import { filterAndSortArchivedItems } from "../helpers/archive.helpers";

export function ArchivePage() {
  const {
    archivedItems,
    counts,
    isLoading,
    refetch,
    restoreArchivedItem,
    permanentDeleteArchivedItem,
    emptyArchive,
    isRestoring,
    isDeletingPermanently,
    isEmptying,
  } = useArchive();

  // Filters & Sorting state
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Modal states
  const [itemToRestore, setItemToRestore] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return filterAndSortArchivedItems(archivedItems, {
      category: activeCategory,
      searchQuery,
      sortOrder,
    });
  }, [archivedItems, activeCategory, searchQuery, sortOrder]);

  // Handlers
  const handleConfirmRestore = async () => {
    if (!itemToRestore) return;
    try {
      await restoreArchivedItem(itemToRestore);
      setItemToRestore(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!itemToDelete) return;
    try {
      await permanentDeleteArchivedItem(itemToDelete);
      setItemToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmEmptyArchive = async () => {
    try {
      await emptyArchive();
      setShowEmptyModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="archive-page" className="space-y-6 pb-12" dir="rtl">
      {/* 1. Top Header */}
      <ArchiveHeader
        totalCount={archivedItems.length}
        onEmptyArchive={() => setShowEmptyModal(true)}
        onRefresh={() => refetch()}
        isLoading={isLoading}
      />

      {/* 2. Warning & Retention Info Banner */}
      <ArchiveWarningBanner totalCount={archivedItems.length} />

      {/* 3. Category Tabs */}
      <ArchiveCategoryTabs
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        counts={counts}
      />

      {/* 4. Search & Sort Toolbar */}
      <ArchiveToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        resultCount={filteredItems.length}
      />

      {/* 5. Content Grid or Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-48 bg-card/60 rounded-2xl border border-border animate-pulse p-5"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ArchiveCard
              key={item.id}
              item={item}
              onRestore={(it) => setItemToRestore(it)}
              onPermanentDelete={(it) => setItemToDelete(it)}
              isRestoring={isRestoring && itemToRestore?.id === item.id}
              isDeleting={isDeletingPermanently && itemToDelete?.id === item.id}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 text-center bg-card rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center">
          {searchQuery || activeCategory !== "all" ? (
            <>
              <div className="p-4 rounded-2xl bg-muted text-muted-foreground mb-4">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                لا توجد عناصر مؤرشفة تطابق معايير البحث
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                جرّب تعديل كلمات البحث أو اختيار تبويب تصنيف مختلف لعرض المؤرشفات.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
              >
                إعادة ضبط الفلاتر
              </button>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
                <Archive className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                سلة المحذوفات فارغة تماماً
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                أي عنصر تقوم بحذفه من المرضى، المواعيد، الفواتير، الباقات، أو الأجهزة سينتقل إلى هنا تلقائياً ليمكنك استعادته خلال 30 يوماً.
              </p>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <RestoreConfirmModal
        isOpen={Boolean(itemToRestore)}
        item={itemToRestore}
        onClose={() => setItemToRestore(null)}
        onConfirm={handleConfirmRestore}
        isLoading={isRestoring}
      />

      <PermanentDeleteModal
        isOpen={Boolean(itemToDelete)}
        item={itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmPermanentDelete}
        isLoading={isDeletingPermanently}
      />

      <EmptyArchiveModal
        isOpen={showEmptyModal}
        totalCount={archivedItems.length}
        onClose={() => setShowEmptyModal(false)}
        onConfirm={handleConfirmEmptyArchive}
        isLoading={isEmptying}
      />
    </div>
  );
}
