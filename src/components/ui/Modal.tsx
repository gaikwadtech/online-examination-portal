"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info, X, AlertCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: "danger" | "success" | "info" | "warning";
  confirmLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  variant = "info",
  confirmLabel = "Confirm",
  onConfirm,
  isLoading = false,
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow render before transitioning opacity
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to finish before unmounting
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  // Variant Styles Configurations
  const variants = {
    danger: {
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
      buttonFocus: "ring-red-500",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      buttonBg: "bg-green-600 hover:bg-green-700",
      buttonFocus: "ring-green-500",
    },
    warning: {
      icon: AlertCircle,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      buttonBg: "bg-yellow-500 hover:bg-yellow-600",
      buttonFocus: "ring-yellow-500",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
      buttonFocus: "ring-blue-500",
    },
  };

  const currentVariant = variants[variant];
  const Icon = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop with Blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* Close Button (Top Right) */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
          {/* Icon Badge */}
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${currentVariant.iconBg} ${isVisible ? "animate-bounce-slow" : ""}`}
          >
            <Icon className={`h-6 w-6 ${currentVariant.iconColor}`} />
          </div>

          <div className="flex-1 w-full">
            <h3 className="text-xl font-bold text-gray-900 leading-6 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse justify-end gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-wait ${currentVariant.buttonBg} ${currentVariant.buttonFocus} shadow-${variant === 'info' ? 'blue' : variant}-200`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
