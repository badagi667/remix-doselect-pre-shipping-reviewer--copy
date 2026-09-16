import React, { useEffect } from "react";
import { CheckCircle2, FileSpreadsheet, X, ArrowRight, Layers, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";

export interface UploadModalData {
  isOpen: boolean;
  fileName: string;
  fileSize?: string;
  questionCount: number;
  sections: string[];
}

interface UploadSuccessModalProps {
  data: UploadModalData | null;
  onClose: () => void;
  onProceed: () => void;
}

export const UploadSuccessModal: React.FC<UploadSuccessModalProps> = ({
  data,
  onClose,
  onProceed,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && data?.isOpen) {
        onClose();
      }
    };
    if (data?.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [data?.isOpen, onClose]);

  if (!data || !data.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-text-main text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 block">
                Upload Confirmed
              </span>
              <h3 id="upload-modal-title" className="text-base font-bold leading-tight text-white">
                Assessment Data Uploaded!
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* File Name & Format Info */}
          <div className="flex items-center justify-between p-3 bg-bg border border-border/80 rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded bg-emerald-100 text-emerald-800">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-bold text-text-main truncate max-w-[240px]">
                  {data.fileName || "Uploaded Assessment"}
                </span>
                {data.fileSize && (
                  <span className="block text-[9.5px] text-text-muted font-mono">
                    Size: {data.fileSize}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded shrink-0">
              Ready
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-bg border border-border rounded-lg text-center">
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">
                Questions Detected
              </span>
              <span className="text-xl font-extrabold text-client-accent font-mono leading-none">
                {data.questionCount}
              </span>
            </div>

            <div className="p-3 bg-bg border border-border rounded-lg text-center">
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">
                Sections Identified
              </span>
              <span className="text-xl font-extrabold text-text-main font-mono leading-none">
                {data.sections.length > 0 ? data.sections.length : "1"}
              </span>
            </div>
          </div>

          {/* Sections Preview if available */}
          {data.sections.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <Layers className="w-3 h-3 text-client-accent" />
                <span>Detected Sections & Topics:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-bg/50 border border-border/60 rounded-md">
                {data.sections.map((sec, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium bg-white border border-border px-2 py-0.5 rounded text-text-main shadow-2xs"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Help Guidance Note */}
          <div className="flex items-start gap-2 p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-[10.5px] text-blue-900 leading-snug">
            <HelpCircle className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <span>
              All assessment questions have been loaded. Please verify your <strong>Target Job Role</strong>, then tap <strong>Process Assessment Review</strong> to start the diagnostic audit.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-bg/60 border-t border-border flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-wider"
          >
            Review Raw Data
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="px-4 py-2 text-xs font-bold bg-client-accent text-white rounded hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <span>Proceed to Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
