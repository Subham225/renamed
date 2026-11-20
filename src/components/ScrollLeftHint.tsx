import { MoveLeft } from "lucide-react";

interface ScrollLeftHintProps {
  className?: string;
  tone?: "light" | "dark";
}

export default function ScrollLeftHint({
  className = "",
  tone = "light",
}: ScrollLeftHintProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`flex items-center justify-end gap-2 mt-1 pr-1 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <span
        className={`h-px w-7 bg-gradient-to-r from-transparent ${
          isDark ? "to-pink-500/50" : "to-pink-400/70"
        }`}
      />
      <span
        className={`inline-flex items-center gap-1 text-[9px] sm:text-[9.5px] font-bold italic tracking-[0.16em] uppercase ${
          isDark ? "text-slate-400" : "text-slate-400"
        }`}
      >
        <MoveLeft
          className={`w-3 h-3 stroke-[2.25] ${
            isDark ? "text-pink-400" : "text-pink-500"
          }`}
        />
        <span>Scroll Left</span>
      </span>
    </div>
  );
}
