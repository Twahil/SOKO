import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { uploadSellerProductImage } from "@/lib/product-images";
import { uploadSellerProductAudio } from "@/lib/product-audio";
import { saveSellerProduct } from "@/lib/products";

export const Route = createFileRoute("/sell")({
  component: SellPage,
});

function SellPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Kilo");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [audioPath, setAudioPath] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [audioBusy, setAudioBusy] = useState(false);
  const [recording, setRecording] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function chooseImage(selected: File | undefined) {
    setImageMessage("");
    setImagePath("");
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

        reader.onerror = () =>
          reject(new Error("Imeshindikana kusoma picha."));

        reader.readAsDataURL(file);
      });

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

      setImagePath(result.path);
      setPreview(result.imageUrl);
      setFile(null);
      setImageMessage("Picha imehifadhiwa. Unaweza kuendelea.");
    } catch {
      setImageMessage(
        "Picha haijahifadhiwa. Hakikisha umeingia na mipangilio ya Supabase imekamilika.",
      );
    } finally {
      setImageBusy(false);
    }
  }

  function chooseAudio(selected: File | undefined) {
    setAudioMessage("");
    setAudioPath("");
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
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        stream.getTracks().forEach((track) => track.stop());

        if (blob.size > 10 * 1024 * 1024) {
          setAudioMessage("Sauti iliyorekodiwa imezidi MB 10.");
          setRecording(false);
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
        "Imeshindikana kuanza kurekodi. Ruhusu matumizi ya maikrofoni kwenye simu.",
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

        reader.onerror = () =>
          reject(new Error("Imeshindikana kusoma sauti."));

        reader.readAsDataURL(audioFile);
      });

      const result = await uploadSellerProductAudio({
        data: {
          fileName: audioFile.name,
          contentType: audioFile.type,
          base64,
        },
      });

      setAudioPath(result.path);
      setAudioPreview(result.audioUrl);
      setAudioFile(null);
      setAudioMessage("Sauti imehifadhiwa. Unaweza kuendelea.");
    } catch {
      setAudioMessage(
        "Sauti haijahifadhiwa. Hakikisha umeingia na mipangilio ya hifadhi ya sauti imekamilika.",
      );
    } finally {
      setAudioBusy(false);
    }
  }

  async function saveProduct() {
    setMessage("");

    if (name.trim().length < 2) {
      setMessage("Andika jina la bidhaa lenye angalau herufi 2.");
      return;
    }

    if (description.trim().length < 5) {
      setMessage("Andika maelezo ya bidhaa yenye angalau herufi 5.");
      return;
    }

    const numericPrice = Number(price);

    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setMessage("Weka bei sahihi iliyo kubwa kuliko sifuri.");
      return;
    }

    if (!category.trim()) {
      setMessage("Chagua aina ya bidhaa.");
      return;
    }

    if (!imagePath) {
      setMessage("Kwanza pakia picha ya bidhaa.");
      return;
    }

    if (file || audioFile) {
      setMessage(
        "Bado kuna faili ambalo hujahifadhi. Bonyeza Hifadhi Picha au Hifadhi Sauti kwanza.",
      );
      return;
    }

    setSaving(true);

    try {
      await saveSellerProduct({
        data: {
          name: name.trim(),
          description: description.trim(),
          price: numericPrice,
          unit,
          category: category.trim(),
          imagePath,
          audioPath: audioPath || null,
          origin: origin.trim() || null,
        },
      });

      setMessage("Hongera! Tangazo lako limehifadhiwa kwenye Supabase.");

      setName("");
      setDescription("");
      setPrice("");
      setUnit("Kilo");
      setCategory("");
      setOrigin("");

      setFile(null);
      setPreview("");
      setImagePath("");
      setImageMessage("");

      setAudioFile(null);
      setAudioPreview("");
      setAudioPath("");
      setAudioMessage("");
    } catch {
      setMessage(
        "Tangazo halijahifadhiwa. Hakikisha umeingia kwenye akaunti na mipangilio ya Supabase imekamilika.",
      );
    } finally {
      setSaving(false);
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

      <label htmlFor="product-name">Jina la bidhaa</label>
      <input
        id="product-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Mfano: Mahindi"
        maxLength={150}
        style={inputStyle}
      />

      <label htmlFor="product-description">Maelezo ya bidhaa</label>
      <textarea
        id="product-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Eleza ubora na hali ya bidhaa yako"
        maxLength={3000}
        rows={4}
        style={inputStyle}
      />

      <label htmlFor="product-price">Bei (TSh)</label>
      <input
        id="product-price"
        type="number"
        min="1"
        step="any"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        placeholder="Mfano: 2500"
        style={inputStyle}
      />

      <label htmlFor="product-unit">Kipimo cha bidhaa</label>
      <select
        id="product-unit"
        value={unit}
        onChange={(event) => setUnit(event.target.value)}
        style={inputStyle}
      >
        <option value="Kilo">Kilo</option>
        <option value="Gunia">Gunia</option>
        <option value="Debe">Debe</option>
        <option value="Lita">Lita</option>
        <option value="Kipande">Kipande</option>
        <option value="Fungu">Fungu</option>
        <option value="Boksi">Boksi</option>
        <option value="Nyingine">Nyingine</option>
      </select>

      <label htmlFor="product-category">Aina ya bidhaa</label>
      <select
        id="product-category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        style={inputStyle}
      >
        <option value="">Chagua aina ya bidhaa</option>
        <option value="Mazao ya kilimo">Mazao ya kilimo</option>
        <option value="Matunda">Matunda</option>
        <option value="Mboga">Mboga</option>
        <option value="Mifugo">Mifugo</option>
        <option value="Samaki">Samaki</option>
        <option value="Vyakula">Vyakula</option>
        <option value="Bidhaa nyingine">Bidhaa nyingine</option>
      </select>

      <label htmlFor="product-origin">Mahali bidhaa ilipotoka (si lazima)</label>
      <input
        id="product-origin"
        value={origin}
        onChange={(event) => setOrigin(event.target.value)}
        placeholder="Mfano: Mwanza"
        maxLength={150}
        style={inputStyle}
      />

      <hr style={{ margin: "28px 0" }} />

      <h2>Picha ya bidhaa</h2>
      <p>Piga picha au chagua picha iliyopo kwenye simu.</p>

      <input
        id="product-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={(event) => chooseImage(event.target.files?.[0])}
        style={{ display: "block", width: "100%", marginBottom: 16 }}
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
        disabled={!file || imageBusy || saving}
        style={buttonStyle}
      >
        {imageBusy ? "Inahifadhi picha..." : "Hifadhi Picha"}
      </button>

      {imageMessage && <p role="status">{imageMessage}</p>}

      <hr style={{ margin: "28px 0" }} />

      <h2>Sauti ya bidhaa (si lazima)</h2>
      <p>Eleza bidhaa yako kwa sauti ili wanunuzi waweze kuisikiliza.</p>

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
          disabled={saving || audioBusy}
          style={{
            ...buttonStyle,
            background: "#1565c0",
          }}
        >
          Rekodi sauti mpya
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          style={{
            ...buttonStyle,
            background: "#b3261e",
          }}
        >
          Maliza kurekodi
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
        disabled={!audioFile || audioBusy || recording || saving}
        style={{ ...buttonStyle, marginTop: 10 }}
      >
        {audioBusy ? "Inahifadhi sauti..." : "Hifadhi Sauti"}
      </button>

      {audioMessage && (
        <p role="status" aria-live="polite">
          {audioMessage}
        </p>
      )}

      <hr style={{ margin: "28px 0" }} />

      <button
        type="button"
        onClick={saveProduct}
        disabled={saving || imageBusy || audioBusy || recording}
        style={{
          ...buttonStyle,
          background: saving ? "#888" : "#16803d",
          fontSize: 18,
          padding: 16,
        }}
      >
        {saving ? "Inahifadhi tangazo..." : "Hifadhi Tangazo Langu"}
      </button>

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}

      <p style={{ fontSize: 13, color: "#666" }}>
        Picha isizidi MB 5 na sauti isizidi MB 10. Ruhusu matumizi ya
        maikrofoni unapotaka kurekodi.
      </p>
    </main>
  );
}

const inputStyle = {
  display: "block",
  boxSizing: "border-box" as const,
  width: "100%",
  padding: 12,
  marginTop: 8,
  marginBottom: 18,
  border: "1px solid #ccc",
  borderRadius: 8,
  fontSize: 16,
};

const buttonStyle = {
  display: "block",
  width: "100%",
  padding: 14,
  border: "none",
  borderRadius: 8,
  background: "#16803d",
  color: "white",
  fontSize: 16,
  marginBottom: 10,
};
