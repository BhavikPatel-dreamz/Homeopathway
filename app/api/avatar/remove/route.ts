import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const { path } = await req.json();

  if (!path) {
    return NextResponse.json({ success: false, error: "No file path provided." });
  }

  // Basic path validation to prevent directory traversal
  if (!path.startsWith("/avatars/")) {
    return NextResponse.json({ success: false, error: "Invalid file path." });
  }

  const fullPath = join(process.cwd(), "public", path);

  try {
    await unlink(fullPath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete file:", error);
    // It's possible the file doesn't exist, which isn't a critical server error
    if (error.code === 'ENOENT') {
        return NextResponse.json({ success: true, message: "File not found, but proceeding." });
    }
    return NextResponse.json({
      success: false,
      error: "Failed to delete file.",
    });
  }
}