export function TeamMemberAvatar({ name, url, size = "md" }) {
  const sizeClass = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  if (url) {
    return <img src={url} alt={name} className={`${sizeClass} rounded-xl object-cover shrink-0`} />;
  }
  return (
    <div
      className={`${sizeClass} rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0`}
    >
      {name?.trim()?.[0] ?? "?"}
    </div>
  );
}
