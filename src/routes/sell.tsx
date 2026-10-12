import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { uploadSellerProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/sell")({
  component: SellPage,
});

function SellPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function chooseImage(selected: File | undefined) {
    setMessage("");
    setPreview("");
    setFile(null);

    if (!selected) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selected.type)) {
      setMessage("Chagua picha ya JPG, PNG au WebP.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setMessage("Picha isizidi MB 5.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function uploadImage() {
    if (!file) {
      setMessage("Tafadhali chagua au piga picha kwanza.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const base64 = await new Promise<string>(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const result = reader.result;

            if (typeof result !== "string") {
              reject(new Error("Imeshindikana kusoma picha."));
              return;
            }

            resolve(result.split(",")[1] ?? "");
          };

          reader.onerror = () =>
            reject(new Error("Imeshindikana kusoma picha."));

          reader.readAsDataURL(file);
        },
      );

      const result = await uploadSellerProductImage({
        data: {
          fileName: file.name,
          contentType: file.type as
            | "image/jpeg"
            | "image/png"
            | "image/webp",
          base64,
        },
      });

      setMessage("Picha imehifadhiwa kwa mafanikio!");
      setPreview(result.imageUrl);
      setFile(null);
    } catch {
      setMessage(
        "Picha haijahifadhiwa. Hakikisha umeingia kwenye akaunti na mipangilio ya hifadhi imekamilika.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Weka Bidhaa Sokoni</h1>

      <p>
        Piga picha ya bidhaa yako au chagua picha iliyopo
        kwenye simu.
      </p>

      <label
        htmlFor="product-image"
        style={{
          display: "block",
          padding: 16,
          border: "2px dashed #16803d",
          borderRadius: 12,
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        📷 Piga picha au chagua picha
      </label>

      <input
        id="product-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={(event) =>
          chooseImage(event.target.files?.[0])
        }
        style={{
          display: "block",
          width: "100%",
          marginTop: 12,
          marginBottom: 16,
        }}
      />

      {preview && (
        <img
          src={preview}
          alt="Picha ya bidhaa"
          style={{
            display: "block",
            width: "100%",
            maxHeight: 320,
            objectFit: "contain",
            borderRadius: 12,
            marginBottom: 16,
          }}
        />
      )}

      <button
        type="button"
        onClick={uploadImage}
        disabled={!file || busy}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 8,
          background: busy ? "#888" : "#16803d",
          color: "white",
          fontSize: 16,
          cursor: busy ? "wait" : "pointer",
        }}
      >
        {busy ? "Inahifadhi picha..." : "Hifadhi Picha"}
      </button>

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}

      <p style={{ fontSize: 13, color: "#666" }}>
        Picha inapaswa kuwa JPG, PNG au WebP, na isizidi
        MB 5.
      </p>
    </main>
  );
}
