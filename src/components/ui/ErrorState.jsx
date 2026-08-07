export function ErrorState({
  message = "حدث خطأ أثناء الاتصال بالسيرفر. تأكد من تشغيل JSON Server.",
}) {
  return (
    <div className="p-16 text-center text-destructive font-bold bg-card rounded-3xl border border-border">
      {message}
    </div>
  );
}
