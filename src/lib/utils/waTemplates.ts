// WhatsApp template management — persisted in sessionStorage

export interface WaTemplate {
  id: string;
  name: string;
  type: "lead" | "retention";
  message: string;
  isDefault: boolean;
}

export interface WaTemplateVariables {
  name?: string;
  phone?: string;
  storeName?: string;
  ownerName?: string;
  [key: string]: string | undefined;
}

const STORAGE_KEY = "wa-templates";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const defaultTemplates: WaTemplate[] = [
  {
    id: "default-lead-1",
    name: "Lead Introduction",
    type: "lead",
    message:
      "Hi {name}! I noticed your business and wanted to share something that could help. Vondera is an ecommerce platform built for MENA merchants - it handles orders, shipping, and payments all in one place. Would love to show you how it works!",
    isDefault: true,
  },
  {
    id: "default-lead-2",
    name: "Lead Follow-Up",
    type: "lead",
    message:
      "Hi {name}! Just checking back in. Did you get a chance to look at Vondera? I'd love to answer any questions. Many merchants are seeing great results!",
    isDefault: false,
  },
  {
    id: "default-retention-1",
    name: "Retention - Renewal Reminder",
    type: "retention",
    message:
      "Hi {ownerName}! This is a friendly reminder about your store {storeName}. Your subscription is ending soon and we'd love to help you continue growing. Can we discuss renewal options?",
    isDefault: true,
  },
  {
    id: "default-retention-2",
    name: "Retention - Win Back",
    type: "retention",
    message:
      "Hi {ownerName}! We noticed {storeName} hasn't been active recently. We've added some great new features that could help your business. Would you like to hear about them?",
    isDefault: false,
  },
];

export function getWaTemplates(): WaTemplate[] {
  if (typeof window === "undefined") return defaultTemplates;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WaTemplate[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTemplates;
    }
  } catch {
    // ignore parse errors
  }

  // First load — seed with defaults and persist
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
  return defaultTemplates;
}

export function saveWaTemplates(templates: WaTemplate[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getDefaultWaTemplate(type: "lead" | "retention"): WaTemplate | null {
  const templates = getWaTemplates();
  const sameType = templates.filter((t) => t.type === type);
  return sameType.find((t) => t.isDefault) ?? sameType[0] ?? null;
}

export function resolveTemplate(template: string, variables: WaTemplateVariables): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const spacedKey = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    const aliases = Array.from(new Set([key, key.toLowerCase(), spacedKey]));

    aliases.forEach((alias) => {
      // Replace {key} with value and also support spaced aliases like {store name}
      const pattern = new RegExp(`\\{\\s*${escapeRegExp(alias)}\\s*\\}`, "gi");
      result = result.replace(pattern, value ?? "");
    });
  }
  // Clean up any remaining unreplaced variables while preserving line breaks for rich formatting/RTL.
  result = result.replace(/\{[^}]+\}/g, "");
  return result
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildDefaultWaMessage(type: "lead" | "retention", variables: WaTemplateVariables): string {
  const template = getDefaultWaTemplate(type);
  const fallback = type === "lead" ? "Hi {ownerName}!" : "Hi {ownerName}!";

  return resolveTemplate(template?.message ?? fallback, {
    name: variables.name ?? "",
    phone: variables.phone ?? "",
    storeName: variables.storeName ?? "",
    ownerName: variables.ownerName ?? variables.name ?? "",
    ...variables,
  });
}
