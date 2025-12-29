"use client";

import { useEffect, useRef, useState } from "react";
import "@/app/admin/css/admin-style.css";
import Header from "@/app/admin/components/Header/page";
import SideNav from "@/app/admin/components/SideNav/page";
import { useRouter } from "next/navigation";
import { Image } from "react-bootstrap";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Props {
  id?: number;
}

interface MedicineImage {
  id: number;
  default_image: number; // 1 | 0
  image_url: string | null;
}

interface GetImagesResponse {
  success: boolean;
  data: {
    medicine_id: number;
    total_images: number;
    images: MedicineImage[];
  };
}

export default function MedicineImageForm({ id }: Props) {
  const router = useRouter();

  const addImagesRef = useRef<HTMLInputElement | null>(null);
  const replaceRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);

  const [defaultServerImage, setDefaultServerImage] =
    useState<MedicineImage | null>(null);
  const [defaultPreview, setDefaultPreview] = useState<string | null>(null);

  const [otherServerImages, setOtherServerImages] = useState<MedicineImage[]>(
    []
  );

  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  /* =========================
     FETCH IMAGES
  ========================= */
  const fetchImages = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await axiosInstance.get<GetImagesResponse>(
        `${API_BASE}/medicine/${id}/images/`
      );

      const imgs = res.data.data.images;

      const def = imgs.find((i) => i.default_image === 1) || null;
      const others = imgs.filter((i) => i.default_image === 0 && i.image_url);

      setDefaultServerImage(def);
      setDefaultPreview(def?.image_url ?? null);
      setOtherServerImages(others);
      setPreviews(others.map((i) => i.image_url!));

      setNewImages([]);
    } catch {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [id]);

  /* =========================
     DEFAULT IMAGE
  ========================= */
  const handleDefaultImage = async (file: File) => {
    if (!id) return;

    try {
      setLoading(true);

      // delete old default
      if (defaultServerImage) {
        await axiosInstance.delete(
          `${API_BASE}/medicine/image/${defaultServerImage.id}/delete/`
        );
      }

      // upload new default
      const fd = new FormData();
      fd.append("document", file);
      fd.append("default_image", "1");

      await axiosInstance.post(`${API_BASE}/medicine/${id}/image/upload/`, fd);

      toast.success("Default image updated");
      fetchImages();
    } catch {
      toast.error("Default image update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDefaultImage = async () => {
    if (!defaultServerImage) return;

    try {
      setLoading(true);
      await axiosInstance.delete(
        `${API_BASE}/medicine/image/${defaultServerImage.id}/delete/`
      );

      setDefaultServerImage(null);
      setDefaultPreview(null);
      toast.success("Default image deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ADDITIONAL IMAGES
  ========================= */
  const handleAddImages = async (files: FileList) => {
    if (!id) return;

    const arr = Array.from(files);

    try {
      setLoading(true);

      for (const file of arr) {
        const fd = new FormData();
        fd.append("document", file);
        fd.append("default_image", "0");

        await axiosInstance.post(
          `${API_BASE}/medicine/${id}/image/upload/`,
          fd
        );
      }

      toast.success("Images uploaded");
      fetchImages(); // 🔥 refresh from server
    } catch {
      toast.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdditionalImage = async (imageId: number) => {
    try {
      await axiosInstance.delete(
        `${API_BASE}/medicine/image/${imageId}/delete/`
      );
      toast.success("Image deleted");
      fetchImages();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleReplaceAdditionalImage = async (imageId: number, file: File) => {
    if (!id) return;

    try {
      setLoading(true);

      await axiosInstance.delete(
        `${API_BASE}/medicine/image/${imageId}/delete/`
      );

      const fd = new FormData();
      fd.append("document", file);
      fd.append("default_image", "0");

      await axiosInstance.post(`${API_BASE}/medicine/${id}/image/upload/`, fd);

      toast.success("Image updated");
      fetchImages();
    } catch {
      toast.error("Replace failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SAVE NEW IMAGES
  ========================= */
  // const handleSaveImages = async () => {
  //   if (!id || newImages.length === 0) {
  //     toast.error("No new images selected");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     for (const img of newImages) {
  //       const fd = new FormData();
  //       fd.append("document", img);
  //       fd.append("default_image", "0");

  //       await axiosInstance.post(
  //         `${API_BASE}/medicine/${id}/image/upload/`,
  //         fd
  //       );
  //     }

  //     toast.success("Images saved");
  //     fetchImages();
  //   } catch {
  //     toast.error("Save failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  /* =========================
     UI
  ========================= */
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle mb-2">
              <i className="bi bi-image me-2"></i> Medicine Images
              <button
                onClick={() => router.back()}
                className="btn-style2 float-end px-4"
              >
                ← Back
              </button>
            </div>

            <div className="main_content">
              <h5>
                <strong>Medicine ID: {id}</strong>
              </h5>
              <br />
              {/* DEFAULT IMAGE */}
              <h6>Default Image</h6>
              <div
                className="border rounded position-relative d-flex align-items-center justify-content-center mb-4"
                style={{ width: 200, height: 200, cursor: "pointer" }}
                onClick={() => document.getElementById("defaultInput")?.click()}
              >
                {defaultPreview ? (
                  <>
                    <Image
                      src={defaultPreview}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt=""
                    />
                    <i
                      className="bi bi-x-circle-fill text-danger position-absolute top-0 end-0 m-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDefaultImage();
                      }}
                    />
                  </>
                ) : (
                  <span className="text-muted">Click to upload</span>
                )}
              </div>

              <input
                id="defaultInput"
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleDefaultImage(e.target.files[0])
                }
              />

              {/* ADDITIONAL */}
              <h6>Additional Images</h6>
              <div className="d-flex flex-wrap gap-3">
                {otherServerImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="border rounded position-relative"
                    style={{ width: 120, height: 120, cursor: "pointer" }}
                    onClick={() => replaceRefs.current[index]?.click()}
                  >
                    <Image
                      src={img.image_url ?? ""}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt=""
                    />
                    <i
                      className="bi bi-x-circle-fill text-danger position-absolute top-0 end-0 m-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAdditionalImage(img.id);
                      }}
                    />
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        replaceRefs.current[index] = el;
                      }}
                      onChange={(e) =>
                        e.target.files &&
                        handleReplaceAdditionalImage(img.id, e.target.files[0])
                      }
                    />
                  </div>
                ))}

                <div
                  className="border rounded d-flex align-items-center justify-content-center"
                  style={{ width: 120, height: 120, cursor: "pointer" }}
                  onClick={() => addImagesRef.current?.click()}
                >
                  <i className="bi bi-plus-lg fs-3"></i>
                </div>
              </div>

              <input
                ref={addImagesRef}
                hidden
                multiple
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleAddImages(e.target.files)
                }
              />

              {/* <div className="text-end mt-4">
                <button
                  className="btn btn-primary px-4"
                  disabled={loading}
                  onClick={handleSaveImages}
                >
                  {loading ? "Saving..." : "Save Images"}
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
