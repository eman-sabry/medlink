import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export function Dropdown({
  trigger,
  children,
  align = "left",
  isOpen: externalIsOpen,
  onOpenChange,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const setIsOpen = (value) => {
    if (onOpenChange) onOpenChange(value);
    if (!isControlled) setInternalIsOpen(value);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  const alignmentClass = align === "right" ? "right-0" : "left-0";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center cursor-pointer outline-none focus:outline-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)} 
          className={`absolute ${alignmentClass} mt-2 w-60 rounded-3xl border shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl overflow-hidden`}
          style={{
            background: "var(--card)",
            color: "var(--foreground)",
            borderColor: "var(--border)",
            borderRadius: "1.5rem",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  destructive = false,
  to,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    color: destructive
      ? "var(--destructive, #ef4444)"
      : isHovered
        ? "var(--primary)"
        : "var(--foreground)",
    backgroundColor: isHovered
      ? destructive
        ? "color-mix(in srgb, var(--destructive, #ef4444) 15%, transparent)"
        : "color-mix(in srgb, var(--primary) 12%, transparent)"
      : "transparent",
  };

  const baseClasses = `group flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-all font-bold cursor-pointer outline-none`;

  const iconColorStyle = {
    color: destructive
      ? "var(--destructive, #ef4444)"
      : isHovered
        ? "var(--primary)"
        : "var(--muted-foreground)",
  };

  const content = (
    <>
      {Icon && (
        <Icon
          className="h-4 w-4 shrink-0 transition-colors"
          style={iconColorStyle}
        />
      )}
      <span className="truncate">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={baseClasses}
        style={baseStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={baseClasses}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      type="button"
    >
      {content}
    </button>
  );
}

export function DropdownDivider() {
  return (
    <div className="my-1.5 border-t" style={{ borderColor: "var(--border)" }} />
  );
}

export function DropdownHeader({ title, subtitle }) {
  return (
    <div
      className="px-3.5 py-2.5 mb-1.5 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="text-sm font-black"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </div>

      {subtitle && (
        <div
          className="text-xs font-bold mt-0.5"
          style={{ color: "var(--primary)" }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
