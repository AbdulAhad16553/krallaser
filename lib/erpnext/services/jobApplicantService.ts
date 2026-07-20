import dotenv from "dotenv";

dotenv.config();

const ERP_DOMAIN = process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN || "";
const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY || "";
const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET || "";
const ERP_BASE_URL = `https://${ERP_DOMAIN}/api/resource`;

export interface JobApplicant {
  name: string;
  applicant_name: string;
  email_id: string;
  phone_number: string;
  cover_letter?: string;
  status?: string;
  source?: string;
  creation?: string;
  resume_filename?: string;
}

function erpHeaders(): HeadersInit {
  return {
    Authorization: `token ${API_KEY}:${API_SECRET}`,
    "Content-Type": "application/json",
  };
}

export function parsePosition(coverLetter?: string): string | null {
  if (!coverLetter) return null;
  const match = coverLetter.match(/^Position Applied For: (.+?)(?:\n\n|$)/);
  return match ? match[1].trim() : null;
}

export function parseMessage(coverLetter?: string): string {
  if (!coverLetter) return "";
  return coverLetter.replace(/^Position Applied For: .+?\n\n/, "").trim();
}

async function fetchResumeFilename(applicantId: string): Promise<string | undefined> {
  const params = new URLSearchParams();
  params.append(
    "filters",
    JSON.stringify([
      ["attached_to_doctype", "=", "Job Applicant"],
      ["attached_to_name", "=", applicantId],
    ])
  );
  params.append("fields", JSON.stringify(["file_name", "file_url"]));
  params.append("limit_page_length", "1");
  params.append("order_by", "creation desc");

  const response = await fetch(`${ERP_BASE_URL}/File?${params.toString()}`, {
    headers: erpHeaders(),
    cache: "no-store",
  });

  if (!response.ok) return undefined;

  const json = await response.json().catch(() => ({}));
  return json?.data?.[0]?.file_name;
}

export async function listJobApplicants(): Promise<JobApplicant[]> {
  if (!ERP_DOMAIN || !API_KEY || !API_SECRET) return [];

  const params = new URLSearchParams();
  params.append(
    "fields",
    JSON.stringify([
      "name",
      "applicant_name",
      "email_id",
      "phone_number",
      "cover_letter",
      "status",
      "source",
      "creation",
    ])
  );
  params.append("limit_page_length", "200");
  params.append("order_by", "creation desc");

  const response = await fetch(`${ERP_BASE_URL}/Job%20Applicant?${params.toString()}`, {
    headers: erpHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch job applicants:", response.status);
    return [];
  }

  const json = await response.json().catch(() => ({}));
  const applicants: JobApplicant[] = json?.data || [];

  const withFilenames = await Promise.all(
    applicants.map(async (applicant) => ({
      ...applicant,
      resume_filename: await fetchResumeFilename(applicant.name),
    }))
  );

  return withFilenames;
}

export async function getJobApplicant(id: string): Promise<JobApplicant | null> {
  if (!ERP_DOMAIN || !API_KEY || !API_SECRET) return null;

  const response = await fetch(
    `${ERP_BASE_URL}/Job%20Applicant/${encodeURIComponent(id)}`,
    {
      headers: erpHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) return null;

  const json = await response.json().catch(() => ({}));
  const applicant = json?.data;
  if (!applicant) return null;

  return {
    ...applicant,
    resume_filename: await fetchResumeFilename(id),
  };
}

export async function getApplicantCvFile(
  applicantId: string
): Promise<{ buffer: Buffer; filename: string; contentType: string } | null> {
  if (!ERP_DOMAIN || !API_KEY || !API_SECRET) return null;

  const params = new URLSearchParams();
  params.append(
    "filters",
    JSON.stringify([
      ["attached_to_doctype", "=", "Job Applicant"],
      ["attached_to_name", "=", applicantId],
    ])
  );
  params.append("fields", JSON.stringify(["file_url", "file_name", "is_private"]));
  params.append("limit_page_length", "1");
  params.append("order_by", "creation desc");

  const fileListRes = await fetch(`${ERP_BASE_URL}/File?${params.toString()}`, {
    headers: erpHeaders(),
    cache: "no-store",
  });

  if (!fileListRes.ok) return null;

  const fileListJson = await fileListRes.json().catch(() => ({}));
  const fileRecord = fileListJson?.data?.[0];
  if (!fileRecord?.file_url) return null;

  const fileUrl = fileRecord.is_private
    ? `https://${ERP_DOMAIN}${fileRecord.file_url}`
    : `https://${ERP_DOMAIN}${fileRecord.file_url}`;

  const fileRes = await fetch(fileUrl, {
    headers: { Authorization: `token ${API_KEY}:${API_SECRET}` },
    cache: "no-store",
  });

  if (!fileRes.ok) return null;

  const buffer = Buffer.from(await fileRes.arrayBuffer());
  const filename = fileRecord.file_name || "resume.jpg";
  const ext = filename.split(".").pop()?.toLowerCase();

  const contentTypeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    pdf: "application/pdf",
  };

  return {
    buffer,
    filename,
    contentType: contentTypeMap[ext || ""] || "application/octet-stream",
  };
}
