"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import { buildWhatsAppAppUrl, buildWhatsAppUrl, type WhatsAppClient } from "@/lib/utils/whatsapp";
import {
  buildDefaultWaMessage,
  getWaTemplates,
  resolveTemplate,
  type WaTemplate,
  type WaTemplateVariables,
} from "@/lib/utils/waTemplates";

type WaTemplateType = "lead" | "retention";

interface WhatsAppPickerRequest {
  type: WaTemplateType;
  phone: string;
  variables: WaTemplateVariables;
  title?: string;
}

interface WhatsAppTemplateContextValue {
  openTemplatePicker: (request: WhatsAppPickerRequest) => void;
}

const WhatsAppTemplateContext = createContext<WhatsAppTemplateContextValue | null>(null);

export function WhatsAppTemplateProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<WhatsAppPickerRequest | null>(null);
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const close = useCallback(() => {
    setIsOpen(false);
    setRequest(null);
    setTemplates([]);
    setSelectedTemplateId("");
  }, []);

  const openWhatsapp = useCallback((phone: string, message: string) => {
    window.open(buildWhatsAppUrl(phone, message), "_blank");
  }, []);

  const openClientWithFallback = useCallback((phone: string, message: string, client: WhatsAppClient) => {
    const appUrl = buildWhatsAppAppUrl(phone, message, client);
    const fallbackUrl = buildWhatsAppUrl(phone, message);
    const fallbackTimer = window.setTimeout(() => {
      window.open(fallbackUrl, "_blank");
    }, 1200);

    const handleVisibility = () => {
      if (document.hidden) {
        window.clearTimeout(fallbackTimer);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility, { once: true });
    window.location.href = appUrl;
  }, []);

  const openTemplatePicker = useCallback(
    (nextRequest: WhatsAppPickerRequest) => {
      if (!nextRequest.phone) return;

      const matchingTemplates = getWaTemplates().filter((template) => template.type === nextRequest.type);

      if (matchingTemplates.length === 0) {
        openWhatsapp(nextRequest.phone, buildDefaultWaMessage(nextRequest.type, nextRequest.variables));
        return;
      }

      const defaultTemplate = matchingTemplates.find((template) => template.isDefault) ?? matchingTemplates[0];

      setRequest(nextRequest);
      setTemplates(matchingTemplates);
      setSelectedTemplateId(defaultTemplate.id);
      setIsOpen(true);
    },
    [openWhatsapp]
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null,
    [selectedTemplateId, templates]
  );

  const previewMessage = useMemo(() => {
    if (!selectedTemplate || !request) return "";
    return resolveTemplate(selectedTemplate.message, request.variables);
  }, [request, selectedTemplate]);

  const handleSend = useCallback(
    (client: WhatsAppClient | "web") => {
      if (!request || !selectedTemplate) return;
      const message = resolveTemplate(selectedTemplate.message, request.variables);

      if (client === "web") {
        openWhatsapp(request.phone, message);
      } else {
        openClientWithFallback(request.phone, message, client);
      }

      close();
    },
    [close, openClientWithFallback, openWhatsapp, request, selectedTemplate]
  );

  const hasMessage = useMemo(() => {
    if (!request || !selectedTemplate) return;
    return true;
  }, [request, selectedTemplate]);

  return (
    <WhatsAppTemplateContext.Provider value={{ openTemplatePicker }}>
      {children}

      {isOpen && request && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Choose WhatsApp Template</h3>
                <p className="text-xs text-slate-500">
                  {request.type === "lead" ? "Leads template" : "Retention template"}
                  {request.title ? ` - ${request.title}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close template picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
              <div className="max-h-[420px] overflow-y-auto border-b border-slate-200 p-3 md:border-b-0 md:border-r">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Templates</p>
                <div className="space-y-2">
                  {templates.map((template) => {
                    const isSelected = template.id === selectedTemplateId;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={[
                          "w-full rounded-lg border p-3 text-left transition-colors",
                          isSelected
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                          {template.isDefault && (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p
                          dir="auto"
                          className="mt-1 line-clamp-2 text-xs text-slate-600"
                          style={{ unicodeBidi: "plaintext" }}
                        >
                          {resolveTemplate(template.message, request.variables)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p dir="auto" className="whitespace-pre-wrap text-sm text-slate-700" style={{ unicodeBidi: "plaintext" }}>
                    {previewMessage || "No message preview"}
                  </p>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{request.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleSend("normal")}
                  disabled={!hasMessage}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  Open WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSend("business")}
                  disabled={!hasMessage}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                >
                  Open WhatsApp Business
                </button>
                <button
                  type="button"
                  onClick={() => handleSend("web")}
                  disabled={!hasMessage}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  Open Web
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </WhatsAppTemplateContext.Provider>
  );
}

export function useWhatsAppTemplatePicker() {
  const context = useContext(WhatsAppTemplateContext);
  if (!context) {
    throw new Error("useWhatsAppTemplatePicker must be used within WhatsAppTemplateProvider");
  }
  return context;
}
