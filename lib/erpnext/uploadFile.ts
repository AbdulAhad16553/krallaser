import dotenv from "dotenv";

dotenv.config();

const ERP_DOMAIN = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN || "";
const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY || "";
const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET || "";

export interface AttachFileOptions {
  doctype: string;
  docname: string;
  filename: string;
  fileBuffer: Buffer;
  isPrivate?: boolean;
  docfield?: string;
}

export async function attachFileToDoc(
  options: AttachFileOptions
): Promise<{ success: boolean; fileUrl?: string; message?: string }> {
  const { doctype, docname, filename, fileBuffer, isPrivate = true, docfield } = options;

  if (!ERP_DOMAIN || !API_KEY || !API_SECRET) {
    return { success: false, message: "ERPNext configuration missing" };
  }

  const params = new URLSearchParams();
  params.append("filename", filename);
  params.append("filedata", fileBuffer.toString("base64"));
  params.append("doctype", doctype);
  params.append("docname", docname);
  params.append("decode_base64", "1");
  params.append("is_private", isPrivate ? "1" : "0");
  if (docfield) {
    params.append("docfield", docfield);
  }

  try {
    const response = await fetch(
      `https://${ERP_DOMAIN}/api/method/frappe.client.attach_file`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        json?.message ||
        json?.exception ||
        json?._server_messages ||
        "Failed to upload file to ERPNext";
      console.error("ERPNext attach_file error:", message);
      return { success: false, message: String(message) };
    }

    const fileUrl = json?.message?.file_url;
    return { success: true, fileUrl };
  } catch (error: any) {
    console.error("ERPNext attach_file fetch error:", error.message);
    return { success: false, message: error.message || "File upload failed" };
  }
}
