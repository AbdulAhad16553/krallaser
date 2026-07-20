import { NextResponse } from "next/server";
import { getApplicantCvFile } from "@/lib/erpnext/services/jobApplicantService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cvFile = await getApplicantCvFile(id);

    if (!cvFile) {
      return NextResponse.json(
        { success: false, message: "CV not found for this candidate" },
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(cvFile.buffer), {
      headers: {
        "Content-Type": cvFile.contentType,
        "Content-Disposition": `inline; filename="${cvFile.filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("CV download error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to download CV" },
      { status: 500 }
    );
  }
}
