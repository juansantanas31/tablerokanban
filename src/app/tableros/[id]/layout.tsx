import React from "react";

interface TableroLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

/**
 * Layout del tablero que define el slot paralelo @modal para implementar
 * rutas paralelas e interceptadas (modal con URL propia, Sección 6).
 */
export default function TableroLayout({ children, modal }: TableroLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
