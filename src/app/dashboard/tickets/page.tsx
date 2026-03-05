/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Search,
  Table2,
  Ticket,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/tables/Pagination";
import { ticketsService } from "@/lib/api/tickets/ticketsService";
import type {
  CreateTicketRequest,
  SalesTicket,
  TicketListData,
  TicketPriority,
  TicketStatus,
  UpdateTicketInfoRequest,
} from "@/lib/api/tickets/types";
import { parseFirestoreDate } from "@/lib/utils/firestoreDate";

type TicketFormMode = "create" | "edit";
type ViewMode = "table" | "cards";

type TicketFormState = {
  title: string;
  desc: string;
  priority: TicketPriority;
  tags: string[];
  tagInput: string;
  attachments: string[];
};

const initialFormState: TicketFormState = {
  title: "",
  desc: "",
  priority: "MEDIUM",
  tags: [],
  tagInput: "",
  attachments: [],
};

const statusTabs: Array<{ value: "all" | TicketStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const priorityOptions: Array<{ value: "all" | TicketPriority; label: string }> = [
  { value: "all", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const statusBadge: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
};

const priorityBadge: Record<TicketPriority, string> = {
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

const stripHtml = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeHtmlDescription = (value: string | null | undefined) => {
  const html = (value ?? "").trim();
  if (!html) return "";
  return stripHtml(html) ? html : "";
};

const descriptionPreview = (value: string | null | undefined) => stripHtml(value) || "No description";

const normalizeTag = (value: string) => value.trim().toLowerCase();

const normalizeTicketForUi = (ticket: SalesTicket): SalesTicket => ({
  ...ticket,
  title: ticket.title || "",
  desc: ticket.desc || "",
  tags: Array.isArray(ticket.tags) ? ticket.tags : [],
  attachments: Array.isArray(ticket.attachments) ? ticket.attachments : [],
});

const isValidTicketRecord = (ticket: SalesTicket | null): ticket is SalesTicket =>
  Boolean(ticket && typeof ticket.id === "string" && typeof ticket.status === "string" && typeof ticket.priority === "string");

type QuillLike = {
  root: { innerHTML: string };
  clipboard: { dangerouslyPasteHTML: (indexOrHtml: number | string, html?: string) => void };
  getSelection: () => { index: number; length: number } | null;
  getLength: () => number;
  setSelection: (index: number, length: number) => void;
  insertEmbed: (index: number, type: string, value: string, source?: string) => void;
  format: (name: string, value: unknown) => void;
  getModule: (name: string) => unknown;
  on: (eventName: string, handler: () => void) => void;
  off: (eventName: string, handler: () => void) => void;
};

type QuillConstructor = new (
  element: Element,
  options: {
    theme: string;
    placeholder?: string;
    modules?: Record<string, unknown>;
    formats?: string[];
  }
) => QuillLike;

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillLike | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;
    let textChangeHandler: (() => void) | null = null;

    const handleInsertImage = async () => {
      const quill = quillRef.current;
      if (!quill) return;

      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = "image/*";
      picker.onchange = async () => {
        const file = picker.files?.[0];
        if (!file) return;

        try {
          const encoded = await fileToBase64(file);
          const selection = quill.getSelection() || { index: quill.getLength(), length: 0 };
          quill.insertEmbed(selection.index, "image", encoded, "user");
          quill.setSelection(selection.index + 1, 0);
        } catch (error) {
          console.error("Failed to embed image in editor:", error);
          toast.error("Failed to insert image");
        }
      };
      picker.click();
    };

    const handleInsertLink = () => {
      const quill = quillRef.current;
      if (!quill) return;

      const url = window.prompt("Enter URL:");
      if (!url) return;

      const selection = quill.getSelection();
      if (selection && selection.length > 0) {
        quill.format("link", url);
      } else {
        const index = selection ? selection.index : quill.getLength();
        quill.clipboard.dangerouslyPasteHTML(index, `<a href="${url}" target="_blank">${url}</a>`);
      }
    };

    const handleInsertTable = () => {
      const quill = quillRef.current;
      if (!quill) return;

      const tableModule = quill.getModule("table") as { insertTable?: (rows: number, columns: number) => void } | null;

      if (tableModule?.insertTable) {
        tableModule.insertTable(2, 2);
        return;
      }

      const selection = quill.getSelection() || { index: quill.getLength(), length: 0 };
      quill.clipboard.dangerouslyPasteHTML(
        selection.index,
        "<table><tbody><tr><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p><br/></p>"
      );
    };

    const initialize = async () => {
      const quillModule = await import("quill");
      const Quill = quillModule.default as unknown as QuillConstructor;

      if (!mounted || !mountRef.current || !toolbarRef.current) return;
      if (quillRef.current) return;

      const editorDiv = document.createElement("div");
      mountRef.current.innerHTML = "";
      mountRef.current.appendChild(editorDiv);

      const quill = new Quill(editorDiv, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: {
            container: toolbarRef.current,
            handlers: {
              paragraph: () => quillRef.current?.format("header", false),
              link: () => handleInsertLink(),
              image: () => {
                void handleInsertImage();
              },
              table: () => handleInsertTable(),
            },
          },
        },
      });

      if (!mounted) return;

      quillRef.current = quill;

      if (initialValueRef.current) {
        quill.clipboard.dangerouslyPasteHTML(initialValueRef.current);
      }

      setCharCount(stripHtml(quill.root.innerHTML).length);

      textChangeHandler = () => {
        const html = quill.root.innerHTML;
        onChangeRef.current(html);
        setCharCount(stripHtml(html).length);
      };

      quill.on("text-change", textChangeHandler);
    };

    void initialize();

    return () => {
      mounted = false;
      if (quillRef.current && textChangeHandler) {
        quillRef.current.off("text-change", textChangeHandler);
      }
      quillRef.current = null;
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ticket-editor-shell">
      <div ref={toolbarRef} className="ticket-editor-toolbar ql-toolbar ql-snow">
        <span className="ql-formats">
          <button type="button" className="ql-header ticket-heading-btn" value="1">
            H1
          </button>
          <button type="button" className="ql-header ticket-heading-btn" value="2">
            H2
          </button>
          <button type="button" className="ql-header ticket-heading-btn" value="3">
            H3
          </button>
          <button type="button" className="ql-paragraph ticket-heading-btn">
            T
          </button>
        </span>

        <span className="ql-formats">
          <button type="button" className="ql-bold" />
          <button type="button" className="ql-italic" />
          <button type="button" className="ql-underline" />
          <button type="button" className="ql-strike" />
        </span>

        <span className="ql-formats">
          <button type="button" className="ql-list" value="bullet" />
          <button type="button" className="ql-list" value="ordered" />
        </span>

        <span className="ql-formats">
          <button type="button" className="ql-align" />
          <button type="button" className="ql-align" value="center" />
          <button type="button" className="ql-align" value="right" />
        </span>

        <span className="ql-formats">
          <button type="button" className="ql-blockquote" />
          <button type="button" className="ql-code-block" />
        </span>

        <span className="ql-formats">
          <button type="button" className="ql-link" />
          <button type="button" className="ql-image" />
          <button type="button" className="ql-table ticket-table-btn">
            ▦
          </button>
        </span>
      </div>

      <div className="ticket-editor-canvas">
        <div ref={mountRef} />
      </div>

      <div className="ticket-editor-footer">{charCount} characters</div>
    </div>
  );
};

const toImageSrc = (value: string) => {
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `data:image/jpeg;base64,${value}`;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const filesToBase64 = async (files: FileList | File[]) => {
  const list = Array.from(files);
  return Promise.all(list.map((file) => fileToBase64(file)));
};

const buildRequestPayload = (form: TicketFormState): CreateTicketRequest => ({
  title: form.title.trim(),
  desc: normalizeHtmlDescription(form.desc),
  tags: form.tags,
  priority: form.priority,
  attachments: form.attachments,
});

const TicketModal = ({
  open,
  mode,
  form,
  loading,
  onClose,
  onSubmit,
  onChange,
  onAddTag,
  onRemoveTag,
  onUploadAttachments,
  onRemoveAttachment,
  onPreviewImage,
}: {
  open: boolean;
  mode: TicketFormMode;
  form: TicketFormState;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (next: Partial<TicketFormState>) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onUploadAttachments: (files: FileList | null) => Promise<void>;
  onRemoveAttachment: (index: number) => void;
  onPreviewImage: (src: string) => void;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{mode === "create" ? "Create Ticket" : "Edit Ticket"}</h2>
            <p className="text-xs text-slate-500">Professional ticket details with tags and image attachments.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              value={form.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Ticket title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <span className="text-xs text-slate-500">Builder mode</span>
            </div>
            <div className="ticket-editor">
              <RichTextEditor
                value={form.desc}
                onChange={(value) => onChange({ desc: value })}
                placeholder="Enter ticket description"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
              <select
                value={form.priority}
                onChange={(event) => onChange({ priority: event.target.value as TicketPriority })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tags (press Enter)</label>
              <div className="flex gap-2">
                <input
                  value={form.tagInput}
                  onChange={(event) => onChange({ tagInput: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      onAddTag();
                    }
                  }}
                  placeholder="web"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={onAddTag}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {tag}
                      <button type="button" onClick={() => onRemoveTag(tag)} className="text-indigo-600 hover:text-indigo-800">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Attachments (Images as base64)</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 hover:bg-slate-100">
              <Upload className="h-4 w-4" />
              Upload image attachments
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const input = event.currentTarget;
                  await onUploadAttachments(event.target.files);
                  if (input) input.value = "";
                }}
              />
            </label>

            {form.attachments.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.attachments.map((attachment, index) => (
                  <div key={`${attachment.slice(0, 24)}-${index}`} className="group relative overflow-hidden rounded-md border border-slate-200 bg-white">
                    <img src={toImageSrc(attachment)} alt={`Attachment ${index + 1}`} onClick={() => onPreviewImage(toImageSrc(attachment))} className="h-20 w-full cursor-pointer object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Ticket" : "Save Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TicketsPage() {
  const [ticketPageData, setTicketPageData] = useState<TicketListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>("all");
  const [ownerFilter, setOwnerFilter] = useState<"all" | string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [tagFilterInput, setTagFilterInput] = useState("");
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TicketFormMode>("create");
  const [selectedTicket, setSelectedTicket] = useState<SalesTicket | null>(null);
  const [formState, setFormState] = useState<TicketFormState>(initialFormState);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketsService.getTickets({
        pageNo: currentPage,
        limit,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(priorityFilter !== "all" ? { priority: priorityFilter } : {}),
      });

      setTicketPageData(
        response
          ? {
              ...response,
              items: (response.items || []).map(normalizeTicketForUi),
            }
          : null
      );
    } catch (error) {
      console.error("Failed to load tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [currentPage, priorityFilter, statusFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    setCurrentPage(1);
  }, [priorityFilter, statusFilter]);

  const tickets = useMemo(() => ticketPageData?.items ?? [], [ticketPageData]);

  const ownerOptions = useMemo(() => {
    const map = new Map<string, string>();

    tickets.forEach((ticket) => {
      const ownerId = ticket.createdBy || ticket.user?.id || "unknown";
      const ownerName =
        (ticket.user?.name && ticket.user.name.trim()) ||
        (ticket.user?.email && ticket.user.email.trim()) ||
        "Unknown";

      if (!map.has(ownerId)) {
        map.set(ownerId, ownerName);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tickets]);

  const addTagFilter = () => {
    const normalized = normalizeTag(tagFilterInput);
    if (!normalized) return;

    setTagFilters((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setTagFilterInput("");
  };

  const removeTagFilter = (tag: string) => {
    setTagFilters((prev) => prev.filter((item) => item !== tag));
  };

  const visibleTickets = useMemo(() => {
    const lower = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      if (lower) {
        const text = `${ticket.title} ${stripHtml(ticket.desc)} ${(ticket.tags || []).join(" ")} ${ticket.user?.name || ""}`.toLowerCase();
        if (!text.includes(lower)) return false;
      }

      if (tagFilters.length > 0) {
        const ticketTags = (ticket.tags || []).map((tag) => normalizeTag(tag));
        const hasAllTags = tagFilters.every((tag) => ticketTags.includes(tag));
        if (!hasAllTags) return false;
      }

      if (ownerFilter !== "all") {
        const ownerId = ticket.createdBy || ticket.user?.id || "unknown";
        if (ownerId !== ownerFilter) return false;
      }

      return true;
    });
  }, [ownerFilter, searchTerm, tagFilters, tickets]);

  const counters = useMemo(() => {
    const source = visibleTickets.length ? visibleTickets : tickets;

    return {
      open: source.filter((ticket) => ticket.status === "OPEN").length,
      inProgress: source.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      resolved: source.filter((ticket) => ticket.status === "RESOLVED").length,
      closed: source.filter((ticket) => ticket.status === "CLOSED").length,
    };
  }, [tickets, visibleTickets]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedTicket(null);
    setFormState(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (ticket: SalesTicket) => {
    const normalizedTicket = normalizeTicketForUi(ticket);
    setModalMode("edit");
    setSelectedTicket(normalizedTicket);
    setFormState({
      title: normalizedTicket.title,
      desc: normalizedTicket.desc,
      priority: normalizedTicket.priority,
      tags: normalizedTicket.tags,
      tagInput: "",
      attachments: normalizedTicket.attachments,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const addFormTag = () => {
    const normalized = normalizeTag(formState.tagInput);
    if (!normalized) return;

    const exists = formState.tags.some((tag) => normalizeTag(tag) === normalized);
    if (!exists) {
      setFormState((prev) => ({ ...prev, tags: [...prev.tags, normalized] }));
    }

    setFormState((prev) => ({ ...prev, tagInput: "" }));
  };

  const removeFormTag = (tag: string) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.filter((value) => value !== tag),
    }));
  };

  const uploadAttachments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const encoded = await filesToBase64(files);
      setFormState((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...encoded],
      }));
    } catch (error) {
      console.error("Failed to process attachments:", error);
      toast.error("Failed to attach images");
    }
  };

  const removeAttachment = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submitTicket = async () => {
    const payload = buildRequestPayload(formState);

    if (!payload.title || !payload.desc) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setSubmitting(true);

      if (modalMode === "create") {
        await ticketsService.createTicket(payload);
        toast.success("Ticket created");
      } else if (selectedTicket) {
        const updatePayload: UpdateTicketInfoRequest = {
          title: payload.title,
          desc: payload.desc,
          tags: payload.tags,
          priority: payload.priority,
          attachments: payload.attachments,
        };
        const updatedTicket = await ticketsService.updateTicketInfo(selectedTicket.id, updatePayload);

        setTicketPageData((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            items: prev.items.map((ticket) => {
              if (ticket.id !== selectedTicket.id) return ticket;

              if (isValidTicketRecord(updatedTicket)) {
                return normalizeTicketForUi(updatedTicket);
              }

              return normalizeTicketForUi({
                ...ticket,
                title: updatePayload.title,
                desc: updatePayload.desc,
                tags: updatePayload.tags || [],
                priority: updatePayload.priority,
                attachments: updatePayload.attachments || [],
              });
            }),
          };
        });
        toast.success("Ticket updated");
      }

      setModalOpen(false);
      await loadTickets();
    } catch (error) {
      console.error("Failed to submit ticket:", error);
      toast.error("Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      await ticketsService.updateTicketStatus(ticketId, status);
      toast.success("Status updated");
      await loadTickets();
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteTicket = async (ticketId: string) => {
    const shouldDelete = window.confirm("Delete this ticket?");
    if (!shouldDelete) return;

    try {
      await ticketsService.deleteTicket(ticketId);
      toast.success("Ticket deleted");
      await loadTickets();
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      toast.error("Failed to delete ticket");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Tickets</h1>
            <p className="mt-1 text-sm text-slate-600">Track CRM issues and follow-up tasks in one board.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-md px-2 py-1 text-xs font-medium ${viewMode === "table" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Table2 className="mr-1 inline h-3.5 w-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`rounded-md px-2 py-1 text-xs font-medium ${viewMode === "cards" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <LayoutGrid className="mr-1 inline h-3.5 w-3.5" />
                Cards
              </button>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-blue-600">Open</p>
            <p className="mt-2 text-2xl font-bold text-blue-700">{counters.open}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-amber-600">In Progress</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{counters.inProgress}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-emerald-600">Resolved</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{counters.resolved}</p>
          </div>
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Closed</p>
            <p className="mt-2 text-2xl font-bold text-slate-700">{counters.closed}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search tickets..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as "all" | TicketPriority)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
            >
              <option value="all">Written By: All</option>
              {ownerOptions.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={[
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Filter With Tags</label>
            <div className="flex gap-2">
              <input
                value={tagFilterInput}
                onChange={(event) => setTagFilterInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addTagFilter();
                  }
                }}
                placeholder="Type tag and press Enter"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addTagFilter}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Add
              </button>
            </div>
            {tagFilters.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagFilters.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {tag}
                    <button type="button" onClick={() => removeTagFilter(tag)} className="text-indigo-600 hover:text-indigo-800">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-slate-500" />
            <p className="text-sm text-slate-500">Loading tickets...</p>
          </div>
        )}

        {!loading && visibleTickets.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Ticket className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900">No tickets found</h3>
            <p className="mt-1 text-sm text-slate-500">Create a ticket or change filters.</p>
          </div>
        )}

        {!loading && visibleTickets.length > 0 && viewMode === "table" && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Attachments</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {visibleTickets.map((ticket) => {
                    const createdDate = parseFirestoreDate(ticket.createdAt);
                    const ownerName = ticket.user?.name || ticket.user?.email || ticket.createdBy || "Unknown";
                    return (
                      <tr key={ticket.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 align-top">
                          <p className="max-w-[280px] truncate text-sm font-semibold text-slate-900">{ticket.title || "Untitled ticket"}</p>
                          <p className="mt-1 max-w-[320px] truncate text-xs text-slate-500">{descriptionPreview(ticket.desc)}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="text-xs font-medium text-slate-700">{ownerName}</span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex max-w-[220px] flex-wrap gap-1">
                            {(ticket.tags || []).length > 0 ? (
                              (ticket.tags || []).map((tag) => (
                                <span key={tag} className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityBadge[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <select
                            value={ticket.status}
                            onChange={(event) => updateStatus(ticket.id, event.target.value as TicketStatus)}
                            className={`rounded-lg border px-2 py-1 text-xs font-medium outline-none ${statusBadge[ticket.status]}`}
                          >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {(ticket.attachments || []).length > 0 ? (
                            <div className="flex items-center gap-1">
                              {(ticket.attachments || []).slice(0, 2).map((attachment, index) => (
                                <img
                                  key={`${ticket.id}-attach-${index}`}
                                  src={toImageSrc(attachment)}
                                  alt="attachment"
                                  onClick={() => setPreviewImage(toImageSrc(attachment))}
                                  className="h-8 w-8 cursor-pointer rounded border border-slate-200 object-cover hover:ring-2 hover:ring-indigo-400"
                                />
                              ))}
                              {(ticket.attachments || []).length > 2 && (
                                <span className="text-xs text-slate-500">+{(ticket.attachments || []).length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-slate-500">
                          {createdDate ? createdDate.toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(ticket)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTicket(ticket.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && visibleTickets.length > 0 && viewMode === "cards" && (
          <div className="space-y-3">
            {visibleTickets.map((ticket) => {
              const createdDate = parseFirestoreDate(ticket.createdAt);
              const descPreview = descriptionPreview(ticket.desc).slice(0, 180);

              return (
                <div key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold text-slate-900">{ticket.title || "Untitled ticket"}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityBadge[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>

                      <p className="mb-2 text-sm text-slate-600">{descPreview || "No description"}</p>

                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {(ticket.tags || []).map((tag) => (
                          <span key={tag} className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {tag}
                          </span>
                        ))}
                        {(ticket.tags || []).length === 0 && <span className="text-xs text-slate-400">No tags</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>#{ticket.id}</span>
                        <span>{createdDate ? createdDate.toLocaleString() : "-"}</span>
                        <span>{ticket.user?.name || "Unknown user"}</span>
                      </div>

                      {(ticket.attachments || []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(ticket.attachments || []).slice(0, 4).map((attachment, index) => (
                            <img
                              key={`${ticket.id}-card-attach-${index}`}
                              src={toImageSrc(attachment)}
                              alt="attachment"
                              onClick={() => setPreviewImage(toImageSrc(attachment))}
                              className="h-10 w-10 cursor-pointer rounded border border-slate-200 object-cover hover:ring-2 hover:ring-indigo-400"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:w-[250px] lg:justify-end">
                      <select
                        value={ticket.status}
                        onChange={(event) => updateStatus(ticket.id, event.target.value as TicketStatus)}
                        className={`rounded-lg border px-2 py-1 text-xs font-medium outline-none ${statusBadge[ticket.status]}`}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>

                      <button
                        onClick={() => openEditModal(ticket)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && (ticketPageData?.totalItems || 0) > limit && (
          <Pagination
            totalItems={ticketPageData?.totalItems || 0}
            itemsPerPage={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <TicketModal
        open={modalOpen}
        mode={modalMode}
        form={formState}
        loading={submitting}
        onClose={closeModal}
        onSubmit={submitTicket}
        onChange={(next) => setFormState((prev) => ({ ...prev, ...next }))}
        onAddTag={addFormTag}
        onRemoveTag={removeFormTag}
        onUploadAttachments={uploadAttachments}
        onRemoveAttachment={removeAttachment}
        onPreviewImage={setPreviewImage}
      />

      {!loading && ticketPageData && ticketPageData.items.length === 0 && (
        <div className="fixed bottom-4 right-4 hidden rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700 shadow-sm xl:flex xl:items-center xl:gap-2">
          <AlertCircle className="h-3.5 w-3.5" />
          No tickets in current filter scope.
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 shadow-lg hover:bg-slate-100"
            >
              <X className="h-4 w-4 text-slate-700" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
