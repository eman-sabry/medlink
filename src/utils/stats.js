export function countBy(items, predicate) {
  return items.filter(predicate).length;
}

export function sumBy(items, selector) {
  return items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);
}
