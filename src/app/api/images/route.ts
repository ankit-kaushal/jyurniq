import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Fetch user's image library
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: "Cloudinary not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch all images from user's folder in Cloudinary
    const result = await cloudinary.search
      .expression(`folder:users/${sessionUser.id}/*`)
      .max_results(100)
      .execute();

    // Sort by created_at descending manually
    const resources = result.resources || [];
    resources.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order
    });

    const images = resources.map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      thumbnail: resource.secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill/"),
      width: resource.width,
      height: resource.height,
      createdAt: resource.created_at,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST - Upload image to user's library
export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: "Cloudinary not configured" },
      { status: 500 }
    );
  }

  try {
    const { file } = await request.json();
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Upload to user's specific folder
    const upload = await cloudinary.uploader.upload(file, {
      folder: `users/${sessionUser.id}`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return NextResponse.json({
      id: upload.public_id,
      url: upload.secure_url,
      thumbnail: upload.secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill/"),
      width: upload.width,
      height: upload.height,
    });
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// DELETE - Delete image from library
export async function DELETE(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json({ error: "Missing image ID" }, { status: 400 });
    }

    // Verify the image belongs to the user
    if (!imageId.startsWith(`users/${sessionUser.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await cloudinary.uploader.destroy(imageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
