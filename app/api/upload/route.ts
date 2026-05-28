import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MAGIC_BYTES: Record<string, Buffer> = {
  "application/pdf": Buffer.from([0x25, 0x50, 0x44, 0x46]),
  "image/jpeg": Buffer.from([0xff, 0xd8, 0xff]),
  "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47]),
};

function verifyMimeType(buffer: Buffer, mimeType: string): boolean {
  const magic = MAGIC_BYTES[mimeType];
  if (!magic) return false;
  return buffer.subarray(0, magic.length).equals(magic);
}

async function saveFile(file: File, prefix: string): Promise<{ key: string; name: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only PDF, JPG, and PNG are allowed.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit.");
  }
  if (!verifyMimeType(buffer, file.type)) {
    throw new Error("File content does not match the declared file type.");
  }

  const ext = file.type === "application/pdf" ? ".pdf" : file.type === "image/png" ? ".png" : ".jpg";
  const key = `${prefix}_${uuidv4()}${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, key), buffer);

  return { key, name: file.name };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  let jobLetterKey = "";
  let jobLetterName = "";
  let paystubKey = "";
  let paystubName = "";

  const jobLetter = formData.get("jobLetter") as File | null;
  const paystub = formData.get("paystub") as File | null;

  try {
    if (jobLetter && jobLetter.size > 0) {
      const saved = await saveFile(jobLetter, "jobletter");
      jobLetterKey = saved.key;
      jobLetterName = saved.name;
    }
    if (paystub && paystub.size > 0) {
      const saved = await saveFile(paystub, "paystub");
      paystubKey = saved.key;
      paystubName = saved.name;
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "File upload failed." },
      { status: 422 }
    );
  }

  return NextResponse.json({
    jobLetterKey,
    jobLetterName,
    paystubKey,
    paystubName,
  });
}
