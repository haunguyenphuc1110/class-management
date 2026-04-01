"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg mx-4 bg-card rounded-xl shadow-xl border border-border max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  title: string;
  onClose: () => void;
  description?: string;
}

function DialogHeader({ title, description, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-start justify-between p-6 border-b border-border">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="ml-4 flex-shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function DialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-3 p-6 pt-0", className)}>
      {children}
    </div>
  );
}

export { Dialog, DialogHeader, DialogBody, DialogFooter };
