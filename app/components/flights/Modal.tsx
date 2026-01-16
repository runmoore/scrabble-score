import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export type ModalPosition = "right" | "center" | "left" | "top" | "bottom";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: ModalPosition;
  size?: ModalSize;
  className?: string;
  backdropClassName?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  showCloseButton?: boolean;
  animationDuration?: number;
  fromPeek?: boolean; // New prop to indicate modal should animate from peek position
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[32rem]",
  xl: "w-[40rem]",
  full: "w-full",
};

const positionClasses: Record<ModalPosition, string> = {
  right: "top-0 right-0 h-full",
  left: "top-0 left-0 h-full",
  center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  top: "top-0 left-1/2 transform -translate-x-1/2",
  bottom: "bottom-0 left-1/2 transform -translate-x-1/2",
};

const animationClasses: Record<ModalPosition, { enter: string; exit: string }> =
  {
    right: {
      enter: "modal-panel-slide-right-enter",
      exit: "modal-panel-slide-right-exit",
    },
    left: {
      enter: "modal-panel-slide-left-enter",
      exit: "modal-panel-slide-left-exit",
    },
    center: {
      enter: "modal-panel-center-enter",
      exit: "modal-panel-center-exit",
    },
    top: {
      enter: "modal-panel-slide-top-enter",
      exit: "modal-panel-slide-top-exit",
    },
    bottom: {
      enter: "modal-panel-slide-bottom-enter",
      exit: "modal-panel-slide-bottom-exit",
    },
  };

export function Modal({
  isOpen,
  onClose,
  children,
  position = "right",
  size = "md",
  className = "",
  backdropClassName = "",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  showCloseButton = false,
  animationDuration = 250,
  fromPeek = false,
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Handle modal opening
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isClosing, closeOnEscape]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, preventBodyScroll]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShouldRender(false);
    }, animationDuration);
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      handleClose();
    }
  };

  if (!shouldRender) return null;

  // Determine animation class based on state and fromPeek prop
  let enterAnimationClass = animationClasses[position].enter;
  if (fromPeek && position === "right" && !isClosing) {
    enterAnimationClass = "modal-panel-from-peek";
  }

  const panelClasses = [
    "fixed bg-white shadow-2xl z-50",
    sizeClasses[size],
    positionClasses[position],
    isClosing ? animationClasses[position].exit : enterAnimationClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const backdropClasses = [
    "fixed inset-0 bg-black bg-opacity-50 z-40",
    isClosing ? "modal-backdrop-exit" : "modal-backdrop-enter",
    backdropClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Backdrop */}
      <div
        className={backdropClasses}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={panelClasses}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-2xl font-light text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </>
  );
}

// Hook for easier modal state management
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
