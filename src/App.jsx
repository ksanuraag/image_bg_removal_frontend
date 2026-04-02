import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Upload a clean product or portrait image.");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) {
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
    setStatus("Ready to process.");
  };

  const pollStatus = async (id) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE}/api/status/${id}/`);
          const data = await response.json();

          if (data.status === "completed") {
            clearInterval(interval);
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
      }, 2000);
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
    setStatus("Removing background...");

    try {
      const response = await fetch(`${API_BASE}/api/remove-bg/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Unable to process the image right now.");
      }

      const data = await response.json();

      if (data.output_image) {
        setResult(data.output_image);
        setStatus("Background removed successfully.");
      } else if (data.id) {
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
            Upload an image, remove the background, and export a polished PNG
            with a minimal workflow designed for speed.
          </p>
        </div>

        <div className="hero-meta">
          <div className="meta-card">
            <span className="meta-label">Format</span>
            <strong>PNG Output</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Best For</span>
            <strong>Products, portraits, branding</strong>
          </div>
        </div>
      </section>

      <section className="workspace-panel">
        <div className="toolbar">
          <label className="upload-control" htmlFor="image-upload">
            <span>Choose Image</span>
            <small>{file ? file.name : "PNG or JPG"}</small>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
          />

          <button
            className="primary-button"
            type="button"
            onClick={uploadImage}
            disabled={!file || loading}
          >
            {loading ? "Processing..." : "Remove Background"}
          </button>
        </div>

        <div className="status-row">
          <p>{status}</p>
          {error && <span className="error-text">{error}</span>}
        </div>

        <div className="preview-grid">
          <article className="image-card">
            <div className="card-header">
              <span>Original</span>
              <small>{preview ? "Uploaded preview" : "Waiting for image"}</small>
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
