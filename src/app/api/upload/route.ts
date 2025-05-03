import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "dv8xuqlei",
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

/**
 * POST /api/upload
 * Recibe múltiples archivos con la clave "files" y los sube a Cloudinary.
 * Devuelve un array con URL y publicId de cada imagen subida.
 */
export async function POST(request: Request) {
  const data = await request.formData();
  const images = data.getAll("files");

  if (images.length === 0) {
    return NextResponse.json(
      { message: "No se han enviado imágenes" },
      { status: 400 }
    );
  }

  try {
    // Subida en paralelo
    const uploadPromises = (images as File[]).map(async (image) => {
      const bytes = await image.arrayBuffer();
      const mime = image.type;
      const base64Data = Buffer.from(bytes).toString("base64");
      const fileUri = `data:${mime};base64,${base64Data}`;

      const result = await cloudinary.uploader.upload(fileUri, {
        invalidate: true,
        folder: "maintenance-requests",
        upload_preset: "ml_default",
      });

      return {
        url: (result as any).secure_url,
        publicId: (result as any).public_id,
      };
    });

    const uploaded = await Promise.all(uploadPromises);
    return NextResponse.json({ message: "Imágenes subidas", data: uploaded });
  } catch (error: any) {
    console.error("Error subiendo imágenes:", error);
    return NextResponse.json(
      { message: "Error al subir imágenes", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Recibe { publicId } en el body y elimina la imagen correspondiente de Cloudinary.
 */
export async function DELETE(request: Request) {
  const { publicId } = await request.json();
  if (!publicId) {
    return NextResponse.json(
      { message: "El campo publicId es requerido" },
      { status: 400 }
    );
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ message: "Imagen eliminada", result });
  } catch (error: any) {
    console.error("Error eliminando imagen:", error);
    return NextResponse.json(
      { message: "Error al eliminar la imagen", error: error.message },
      { status: 500 }
    );
  }
}
