import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided." });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({
      success: false,
      error: "Invalid file type. Please upload an image.",
    });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({
      success: false,
      error: "Image size must be less than 5MB.",
    });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure the 'public/avatars' directory exists
  const avatarsDir = join(process.cwd(), "public", "avatars");
  try {
    await require("fs/promises").mkdir(avatarsDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create directory:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create upload directory.",
    });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const path = join(avatarsDir, fileName);

  try {
    await writeFile(path, buffer);
    const imageUrl = `/avatars/${fileName}`;
    return NextResponse.json({ success: true, path: imageUrl });
  } catch (error) {
    console.error("Failed to write file:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save file.",
    });
  }
}