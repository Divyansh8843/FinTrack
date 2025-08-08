"use client";

export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="w-full flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
