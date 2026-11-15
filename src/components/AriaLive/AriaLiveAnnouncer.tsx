"use client";

interface AriaLiveAnnouncerProps {
  mensaje: string;
}

export function AriaLiveAnnouncer({ mensaje }: AriaLiveAnnouncerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {mensaje}
    </div>
  );
}
