import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

const API_BASE = import.meta.env.VITE_API_URL;
const INITIAL_STATUS = "Upload a clean product or portrait image.";
const POLL_INTERVAL = 2000;
const MAX_COMPRESSION_SIZE_MB = 1;
const MAX_DIMENSION = 1920;

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Waiting for image");
  const [fileStats, setFileStats] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const updateProgress = (value, label) => {
    setProgress((current) => Math.max(current, Math.min(100, Math.round(value))));
    if (label) {
      setProgressLabel(label);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / 1024 ** index;

    return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`;
  };

  const handleChange = async (event) => {
    const selected = event.target.files?.[0];

    if (!selected) {
      return;
    }

    setResult(null);
    setError("");
    setProgress(0);

    if (!selected.type.startsWith("image/")) {
      setFile(null);
      setFileStats(null);
      setStatus("Please choose an image file.");
      setError("Only image uploads are supported.");
      return;
    }

    setLoading(true);
    setStatus("Optimizing image on your device...");
    updateProgress(8, "Preparing your image");

    try {
      const compressedFile = await imageCompression(selected, {
        maxSizeMB: MAX_COMPRESSION_SIZE_MB,
        maxWidthOrHeight: MAX_DIMENSION,
        useWebWorker: true,
        onProgress: (value) => {
          updateProgress(8 + value * 0.5, "Compressing on your phone");
        },
      });

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setFile(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      setFileStats({
        originalName: selected.name,
        originalSize: selected.size,
        compressedSize: compressedFile.size,
      });
      setStatus("Compressed and ready to process.");
      updateProgress(100, "Compression complete");
    } catch (compressionError) {
      console.error(compressionError);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setFileStats({
        originalName: selected.name,
        originalSize: selected.size,
        compressedSize: selected.size,
      });
      setStatus("Using original image.");
      setError("Compression was skipped, but you can still continue.");
      updateProgress(100, "Ready without compression");
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (id) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          setProgress((current) => (current < 94 ? current + 4 : current));
          setProgressLabel("Refining edges and transparency");
          const response = await fetch(`${API_BASE}/api/status/${id}/`);
          const data = await response.json();

          if (data.status === "completed") {
            clearInterval(interval);
            updateProgress(100, "Background removed");
            resolve(data.output_image);
          }

          if (data.status === "failed") {
            clearInterval(interval);
            reject(new Error("Background removal failed."));
          }
        } catch (pollError) {
          clearInterval(interval);
          reject(pollError);
        }
      }, POLL_INTERVAL);
    });
  };

  const uploadImage = async () => {
    if (!file || loading) {
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    setError("");
    setStatus("Uploading optimized image...");
    updateProgress(12, "Starting secure upload");

    try {
      updateProgress(28, "Sending file to the remover");
      const response = await fetch(`${API_BASE}/api/remove-bg/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Unable to process the image right now.");
      }

      const data = await response.json();

      if (data.output_image) {
        updateProgress(100, "Background removed");
        setResult(data.output_image);
        setStatus("Background removed successfully.");
      } else if (data.id) {
        updateProgress(68, "AI is refining the cutout");
        setStatus("Finishing the render...");
        const outputImage = await pollStatus(data.id);
        setResult(outputImage);
        setStatus("Background removed successfully.");
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.message || "Something went wrong.");
      setStatus("Please try again.");
      updateProgress(0, "Upload interrupted");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = async () => {
    if (!result) {
      return;
    }

    try {
      const response = await fetch(result);

      if (!response.ok) {
        throw new Error("Unable to download the processed image.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = "background-removed.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      console.error(downloadError);
      setError(downloadError.message || "Download failed.");
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">AI Background Remover</span>
          <h1>Create clean cutouts in seconds.</h1>
          <p className="hero-text">
            Upload an image, compress it right on the device, remove the
            background, and export a polished PNG with a workflow built for
            mobile speed.
          </p>
        </div>

        <div className="hero-meta">
          <div className="meta-card">
            <span className="meta-label">Format</span>
            <strong>PNG Output</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Upload Flow</span>
            <strong>Phone-side compression before upload</strong>
          </div>
        </div>
      </section>

      <section className="workspace-panel">
        {loading && (
          <div className="loading-overlay" aria-live="polite" aria-busy="true">
            <div className="loading-card">
              <div
                className="loading-ring"
                style={{ "--progress": progress }}
              >
                <strong>{progress}%</strong>
              </div>
              <div className="loading-copy">
                <span className="loading-eyebrow">Working on your image</span>
                <h2>{progressLabel}</h2>
                <p>{status}</p>
              </div>
              <div className="progress-track" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}

        <div className="toolbar">
          <label className="upload-control" htmlFor="image-upload">
            <span>{loading ? "Preparing Image" : "Choose Image"}</span>
            <small>{fileStats?.originalName || "PNG, JPG or WEBP"}</small>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
            disabled={loading}
          />

          <button
            className="primary-button"
            type="button"
            onClick={uploadImage}
            disabled={!file || loading}
          >
            {loading ? `${progress}% in progress` : "Remove Background"}
          </button>
        </div>

        <div className="status-row">
          <p>{status}</p>
          {error && <span className="error-text">{error}</span>}
        </div>

        {fileStats && (
          <div className="compression-summary">
            <div className="summary-pill">
              <span>Original</span>
              <strong>{formatSize(fileStats.originalSize)}</strong>
            </div>
            <div className="summary-pill">
              <span>Upload Size</span>
              <strong>{formatSize(fileStats.compressedSize)}</strong>
            </div>
            <div className="summary-pill accent">
              <span>Saved</span>
              <strong>
                {fileStats.originalSize
                  ? Math.max(
                      0,
                      Math.round(
                        ((fileStats.originalSize - fileStats.compressedSize) /
                          fileStats.originalSize) *
                          100
                      )
                    )
                  : 0}
                %
              </strong>
            </div>
          </div>
        )}

        <div className="preview-grid">
          <article className="image-card">
            <div className="card-header">
              <span>Original</span>
              <small>
                {preview ? "Optimized preview ready" : "Waiting for image"}
              </small>
            </div>

            <div className="image-stage">
              {preview ? (
                <img src={preview} alt="Uploaded preview" />
              ) : (
                <div className="empty-state">
                  <span>Drop in your source image to start.</span>
                </div>
              )}
            </div>
          </article>

          <article className="image-card">
            <div className="card-header">
              <span>Result</span>
              <small>{result ? "Transparent output" : "Generated output"}</small>
            </div>

            <div className="image-stage result-stage">
              {result ? (
                <img src={result} alt="Background removed result" />
              ) : (
                <div className="empty-state">
                  <span>Your processed image will appear here.</span>
                </div>
              )}
            </div>

            {result && (
              <div className="result-actions">
                <a
                  className="secondary-button"
                  href="#download"
                  onClick={(event) => {
                    event.preventDefault();
                    downloadResult();
                  }}
                >
                  Download PNG
                </a>
                <a
                  className="secondary-button"
                  href={result}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Full Image
                </a>
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
