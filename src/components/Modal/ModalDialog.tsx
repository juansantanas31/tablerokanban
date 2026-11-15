"use client";

import { useEffect, useRef } from "react";
import styles from "./ModalDialog.module.css";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
}

/**
 * Modal accesible implementado con la API de <dialog> nativo (Sección 5).
 * Atrapa y devuelve el foco automáticamente.
 */
export function ModalDialog({ isOpen, onClose, titulo, children }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    if (isOpen) {
      if (typeof dialogNode.showModal === "function") {
        if (!dialogNode.open) {
          dialogNode.showModal();
        }
      } else {
        // Fallback básico si el navegador no implementa showModal
        dialogNode.setAttribute("open", "true");
      }
    } else {
      if (typeof dialogNode.close === "function") {
        if (dialogNode.open) {
          dialogNode.close();
        }
      } else {
        dialogNode.removeAttribute("open");
      }
    }
  }, [isOpen]);

  // Manejar el evento cancelar (Escape)
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
      aria-labelledby="dialog-title"
    >
      <div className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <h2 id="dialog-title" className={styles.modalTitle}>
            {titulo}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>{children}</div>
      </div>
    </dialog>
  );
}
