const PRINT_RENDER_DELAY_MS = 200;

export function printPrescription(setIsPrinting) {
  setIsPrinting(true);
  window.setTimeout(() => {
    window.print();
    window.addEventListener("afterprint", () => setIsPrinting(false), { once: true });
  }, PRINT_RENDER_DELAY_MS);
}
