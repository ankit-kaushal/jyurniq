"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ImageLibrary.module.css";

interface Image {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  createdAt: string;
}

interface ImageLibraryProps {
  onImageSelect: (url: string) => void;
  onClose: () => void;
}

export default function ImageLibrary({ onImageSelect, onClose }: ImageLibraryProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/images");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error("Failed to fetch images", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setUploading(true);
    e.target.value = "";

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch("/api/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64 }),
          });

          if (res.ok) {
            const newImage = await res.json();
            setImages((prev) => [newImage, ...prev]);
          } else {
            alert("Failed to upload image");
          }
        } catch (err) {
          console.error("Upload error", err);
          alert("Failed to upload image");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error", err);
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/images?id=${encodeURIComponent(imageId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        alert("Failed to delete image");
      }
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete image");
    }
  };

  const handleDragStart = (e: React.DragEvent, url: string) => {
    e.dataTransfer.setData("text/plain", url);
    e.dataTransfer.effectAllowed = "copy";
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.library} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.library} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Image Library</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.actions}>
          <label className={styles.uploadButton}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
            {uploading ? "Uploading..." : "+ Upload Image"}
          </label>
        </div>

        {images.length === 0 ? (
          <div className={styles.empty}>
            <p>No images in your library yet.</p>
            <p>Upload images to use them in your blogs.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {images.map((image) => (
              <div
                key={image.id}
                className={styles.imageItem}
                draggable
                onDragStart={(e) => handleDragStart(e, image.url)}
                onClick={() => {
                  onImageSelect(image.url);
                  onClose();
                }}
              >
                <img src={image.thumbnail} alt="Library image" />
                <div className={styles.imageOverlay}>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDelete(image.id, e)}
                    title="Delete image"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
