import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { uploadSellerProductImage } from "@/lib/product-images";
import { uploadSellerProductAudio } from "@/lib/product-audio";

export const Route = createFileRoute("/sell")({
  component: SellPage,
});

function SellPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [audioBusy, setAudioBusy] = useState(false);
  const [recording, setRecording] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function chooseImage(selected: File | undefined) {
    setImageMessage("");
    setPreview("");
    setFile(null);

    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setImageMessage("Chagua picha ya JPG, PNG au WebP.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setImageMessage("Picha isizidi MB 5.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function uploadImage() {
    if (!file) {
      setImageMessage("Tafadhali chagua picha kwanza.");
      return;
    }

    setImageBusy(true);
    setImageMessage("");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("Imeshindikana kusoma picha."));
            return;
          }
          resolve(reader.result.split(",")[1] ?? "");
        };

        reader.onerror = () => reject(new Error("Imeshindikana kusoma picha."));
        reader.readAsDataURL(file);
      });

      const result = await uploadSellerProductImage({
        data: {
          fileName: file.name,
          contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
          base64,
        },
      });

      setPreview(result.imageUrl);
      setFile(null);
      setImageMessage("Picha imehifadhiwa kwa mafanikio!");
    } catch {
      setImageMessage(
        "Picha haijahifadhiwa. Hakikisha umeingia kwenye akaunti na mipangilio ya hifadhi imekamilika.",
      );
    } finally {
      setImageBusy(false);
    }
  }

  function chooseAudio(selected: File | undefined) {
    setAudioMessage("");
    setAudioPreview("");
    setAudioFile(null);

    if (!selected) return;

    const allowedTypes = [
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
  "audio/3gpp",
  "audio/webm;codecs=opus",
  "audio/mp4;codecs=mp4a.40.2",
];

    if (!allowedTypes.includes(selected.type)) {
      setAudioMessage(
        "Muundo huu wa sauti hautumiki. Jaribu MP3, M4A, WAV, OGG au WEBM.",
      );
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setAudioMessage("Sauti isizidi MB 10.");
      return;
    }

    setAudioFile(selected);
    setAudioPreview(URL.createObjectURL(selected));
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setAudioMessage(
        "Kifaa hiki hakitumii kurekodi sauti hapa. Chagua sauti iliyopo kwenye simu.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const preferredType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        stream.getTracks().forEach((track) => track.stop());

        if (blob.size > 10 * 1024 * 1024) {
          setAudioMessage("Sauti iliyorekodiwa imezidi MB 10.");
          return;
        }

        const extension = blob.type.includes("mp4") ? "m4a" : "webm";
        const recordedFile = new File(
          [blob],
          `sauti-bidhaa-${Date.now()}.${extension}`,
          { type: blob.type },
        );

        chooseAudio(recordedFile);
        setRecording(false);
      };

      recorder.start();
      setRecording(true);
      setAudioMessage("Unarekodi sauti. Bonyeza Maliza kurekodi ukimaliza.");
    } catch {
      setAudioMessage(
        "Imeshindikana kuanza kurekodi. Ruhusu matumizi ya maikrofoni kwenye simu yako.",
      );
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function uploadAudio() {
    if (!audioFile) {
      setAudioMessage("Chagua au rekodi sauti kwanza.");
      return;
    }

    setAudioBusy(true);
    setAudioMessage("");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("Imeshindikana kusoma sauti."));
            return;
          }
          resolve(reader.result.split(",")[1] ?? "");
        };

        reader.onerror = () => reject(new Error("Imeshindikana kusoma sauti."));
        reader.readAsDataURL(audioFile);
      });

      const result = await uploadSellerProductAudio({
        data: {
          fileName: audioFile.name,
          contentType: audioFile.type as
            | "audio/mpeg"
            | "audio/mp4"
            | "audio/webm"
            | "audio/ogg"
            | "audio/wav"
            | "audio/x-m4a"
            | "audio/aac",
          base64,
        },
      });

      setAudioPreview(result.audioUrl);
      setAudioFile(null);
      setAudioMessage("Sauti imehifadhiwa kwa mafanikio!");
    } catch {
      setAudioMessage(
        "Sauti haijahifadhiwa. Hakikisha umeingia kwenye akaunti na bucket product-audio ina ruhusa sahihi.",
      );
    } finally {
      setAudioBusy(false);
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

      <h2>Picha ya bidhaa</h2>
      <p>Piga picha ya bidhaa yako au chagua picha iliyopo kwenye simu.</p>

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
        onChange={(event) => chooseImage(event.target.files?.[0])}
        style={{ display: "block", width: "100%", marginTop: 12, marginBottom: 16 }}
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
        disabled={!file || imageBusy}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 8,
          background: imageBusy ? "#888" : "#16803d",
          color: "white",
          fontSize: 16,
        }}
      >
        {imageBusy ? "Inahifadhi picha..." : "Hifadhi Picha"}
      </button>

      {imageMessage && <p role="status">{imageMessage}</p>}

      <hr style={{ margin: "28px 0" }} />

      <h2>Sauti ya bidhaa</h2>
      <p>Eleza bidhaa yako kwa sauti ili wanunuzi waweze kuisikiliza.</p>

      <label htmlFor="product-audio" style={{ display: "block", marginBottom: 8 }}>
        🎵 Chagua sauti iliyopo kwenye simu
      </label>

      <input
        id="product-audio"
        type="file"
        accept="audio/*"
        onChange={(event) => chooseAudio(event.target.files?.[0])}
        style={{ display: "block", width: "100%", marginBottom: 16 }}
      />

      {!recording ? (
        <button
          type="button"
          onClick={startRecording}
          style={{
            width: "100%",
            padding: 14,
            border: "none",
            borderRadius: 8,
            background: "#1565c0",
            color: "white",
            fontSize: 16,
            marginBottom: 10,
          }}
        >
          🎙️ Rekodi sauti mpya
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          style={{
            width: "100%",
            padding: 14,
            border: "none",
            borderRadius: 8,
            background: "#b3261e",
            color: "white",
            fontSize: 16,
            marginBottom: 10,
          }}
        >
          ⏹ Maliza kurekodi
        </button>
      )}

      {audioPreview && (
        <audio
          controls
          src={audioPreview}
          style={{ display: "block", width: "100%", margin: "12px 0" }}
        />
      )}

      <button
        type="button"
        onClick={uploadAudio}
        disabled={!audioFile || audioBusy || recording}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 8,
          background: audioBusy ? "#888" : "#16803d",
          color: "white",
          fontSize: 16,
        }}
      >
        {audioBusy ? "Inahifadhi sauti..." : "Hifadhi Sauti"}
      </button>

      {audioMessage && (
        <p role="status" aria-live="polite">
          {audioMessage}
        </p>
      )}

      <p style={{ fontSize: 13, color: "#666" }}>
        Sauti isizidi MB 10. Ruhusu maikrofoni unapotaka kurekodi.
      </p>
    </main>
  );
}
