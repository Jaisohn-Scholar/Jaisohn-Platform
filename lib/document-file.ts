export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export type AllowedDocument = {
  extension: "pdf" | "doc" | "docx";
  mimeType: string;
};

const ALLOWED_MIME_TYPES: Record<AllowedDocument["extension"], Set<string>> = {
  pdf: new Set(["application/pdf"]),
  doc: new Set(["application/msword"]),
  docx: new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
};

function hasPrefix(buffer: Buffer, signature: number[]) {
  return signature.every((byte, index) => buffer[index] === byte);
}

export function validateDocumentFile(file: File, buffer: Buffer): AllowedDocument | null {
  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (extension !== "pdf" && extension !== "doc" && extension !== "docx") return null;
  if (!ALLOWED_MIME_TYPES[extension].has(file.type.toLowerCase())) return null;

  const hasValidSignature =
    (extension === "pdf" && hasPrefix(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) ||
    (extension === "doc" && hasPrefix(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) ||
    (extension === "docx" &&
      (hasPrefix(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
        hasPrefix(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
        hasPrefix(buffer, [0x50, 0x4b, 0x07, 0x08])));

  if (!hasValidSignature) return null;
  return { extension, mimeType: [...ALLOWED_MIME_TYPES[extension]][0] };
}
