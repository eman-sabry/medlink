export function dedupeById(items = []) {
  const map = new Map(items.map((item) => [item.id, item]));
  return Array.from(map.values());
}
