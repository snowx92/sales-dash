"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  MessageSquareText,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getWaTemplates,
  saveWaTemplates,
  type WaTemplate,
} from "@/lib/utils/waTemplates";

type TemplateType = "lead" | "retention";

const VARIABLES: Record<TemplateType, { key: string; label: string }[]> = {
  lead: [
    { key: "name", label: "{name}" },
    { key: "storeName", label: "{storeName}" },
    { key: "ownerName", label: "{ownerName}" },
    { key: "phone", label: "{phone}" },
  ],
  retention: [
    { key: "name", label: "{name}" },
    { key: "storeName", label: "{storeName}" },
    { key: "ownerName", label: "{ownerName}" },
    { key: "phone", label: "{phone}" },
  ],
};

const emptyForm = { name: "", message: "" };
const supportsRtl = (value: string) => /[\u0591-\u07ff\ufb1d-\ufdfd\ufe70-\ufefc]/i.test(value);

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<TemplateType>("lead");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load on mount
  useEffect(() => {
    setTemplates(getWaTemplates());
  }, []);

  const persist = useCallback((next: WaTemplate[]) => {
    setTemplates(next);
    saveWaTemplates(next);
  }, []);

  const filtered = templates.filter((t) => t.type === activeTab);

  // ── Form actions ──

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (tpl: WaTemplate) => {
    setEditingId(tpl.id);
    setForm({ name: tpl.name, message: tpl.message });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Name and message are required");
      return;
    }

    if (editingId) {
      // Update existing
      const next = templates.map((t) =>
        t.id === editingId ? { ...t, name: form.name.trim(), message: form.message.trim() } : t
      );
      persist(next);
      toast.success("Template updated");
    } else {
      // Create new
      const isFirst = filtered.length === 0;
      const newTemplate: WaTemplate = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        type: activeTab,
        message: form.message.trim(),
        isDefault: isFirst,
      };
      persist([...templates, newTemplate]);
      toast.success("Template created");
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;

    let next = templates.filter((t) => t.id !== id);
    // If we deleted the default, promote the first remaining of the same type
    if (target.isDefault) {
      const first = next.find((t) => t.type === target.type);
      if (first) {
        next = next.map((t) => (t.id === first.id ? { ...t, isDefault: true } : t));
      }
    }
    persist(next);
    toast.success("Template deleted");
  };

  const handleSetDefault = (id: string) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;

    const next = templates.map((t) => {
      if (t.type !== target.type) return t;
      return { ...t, isDefault: t.id === id };
    });
    persist(next);
    toast.success(`"${target.name}" set as default`);
  };

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = form.message;
    const before = current.slice(0, start);
    const after = current.slice(end);

    setForm((prev) => ({ ...prev, message: before + variable + after }));

    // Restore cursor position after render
    requestAnimationFrame(() => {
      const pos = start + variable.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">WhatsApp Templates</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage message templates for leads and retention. The default template is used when clicking WhatsApp.
            </p>
            <p className="mt-1 text-xs text-slate-500">Emoji and RTL writing are fully supported.</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["lead", "retention"] as TemplateType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); closeForm(); }}
              className={[
                "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === tab
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              {tab === "lead" ? "Leads Templates" : "Retention Templates"}
            </button>
          ))}
        </div>

        {/* Create / Edit form */}
        {formOpen && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {editingId ? "Edit Template" : "New Template"}
              </h2>
              <button onClick={closeForm} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Template Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Initial Outreach"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Message</label>
                  <span className="text-xs text-slate-500">Insert variables:</span>
                </div>

                <div className="mb-2 flex flex-wrap gap-1.5">
                  {VARIABLES[activeTab].map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => insertVariable(v.label)}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message here. Use variables like {name} to personalize."
                  rows={5}
                  dir="auto"
                  style={{ unicodeBidi: "plaintext" }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use Arabic/RTL freely (for example: {"{store name}"} مرحبا). Emojis are preserved.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {editingId ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template list */}
        {filtered.length === 0 && !formOpen && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <MessageSquareText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900">No templates yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first {activeTab === "lead" ? "leads" : "retention"} template to get started.
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((tpl) => (
              <div
                key={tpl.id}
                className={[
                  "rounded-xl border bg-white p-5 shadow-sm transition-colors",
                  tpl.isDefault ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200",
                ].join(" ")}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{tpl.name}</h3>
                    {tpl.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!tpl.isDefault && (
                      <button
                        onClick={() => handleSetDefault(tpl.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        title="Set as default"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(tpl)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p
                  dir={supportsRtl(tpl.message) ? "rtl" : "auto"}
                  style={{ unicodeBidi: "plaintext" }}
                  className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600"
                >
                  {tpl.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
