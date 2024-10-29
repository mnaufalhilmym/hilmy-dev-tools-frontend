import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import LoadingSpinner from "./components/loading/LoadingSpinner";

export default function App() {
  const ffmpegRef = useRef(new FFmpeg());
  const logRef = useRef<HTMLOListElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [processingState, setProcessingState] = useState<
    "idle" | number | "error"
  >("idle");
  const [inputFile, setInputFile] = useState<File>();
  const [outputUrl, setOutputUrl] = useState("");
  const [mediaType, setMediaType] = useState<"audio" | "video">();
  const [mediaFormat, setMediaFormat] = useState<string>();

  function onFFMPEGLog(event: { type: string; message: string }) {
    if (logRef.current) {
      const li = document.createElement("li");
      li.textContent = event.message;
      logRef.current.appendChild(li);
      li.scrollIntoView({ behavior: "smooth" });
    }
  }

  function onFFMPEGProgress(event: { progress: number; time: number }) {
    setProcessingState(event.progress * 100);
  }

  useEffect(() => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", onFFMPEGLog);
    ffmpeg.on("progress", onFFMPEGProgress);

    (async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      // const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        // workerURL: await toBlobURL(
        //   `${baseURL}/ffmpeg-core.worker.js`,
        //   "text/javascript"
        // ),
      });

      setLoaded(true);
    })();

    return () => {
      ffmpeg.off("log", onFFMPEGLog);
      ffmpeg.off("progress", onFFMPEGProgress);
      ffmpeg.terminate();
    };
  }, []);

  async function transcode() {
    if (!inputFile || !mediaFormat || typeof processingState === "number")
      return;
    if (logRef.current) {
      logRef.current.innerHTML = "";
    }

    reset();

    const outputFile = `${inputFile.name.split(".").slice(0, -1).join(".")}.${
      mediaFormat?.split("/")[1]
    }`;

    const ffmpeg = ffmpegRef.current;

    try {
      await ffmpeg.writeFile("input", await fetchFile(inputFile));
      await ffmpeg.exec(["-i", "input", outputFile]);
      const data = await ffmpeg.readFile(outputFile);
      const outputUrl = URL.createObjectURL(
        new Blob([data], { type: mediaFormat })
      );

      setOutputUrl(outputUrl);

      if (logRef.current) {
        const li = document.createElement("li");
        li.textContent = `[SUCCESS]: Conversion complete`;
        li.className = "text-teal-500";
        logRef.current.appendChild(li);
        li.scrollIntoView({ behavior: "smooth" });
      }

      setProcessingState("idle");
    } catch (e) {
      setProcessingState("error");
      if (logRef.current) {
        const li = document.createElement("li");
        li.textContent = `[ERROR]: ${String(e)}`;
        li.className = "text-red-500";
        logRef.current.appendChild(li);
        li.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  function selectFile(e: ChangeEvent<HTMLInputElement>) {
    reset();

    if (e.target.files?.length) {
      setInputFile(e.target.files[0]);
    }
  }

  function downloadFile() {
    if (!inputFile) return;

    const filename = `${inputFile.name.split(".").slice(0, -1).join(".")}.${
      mediaFormat?.split("/")[1]
    }`;

    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function reset() {
    setProcessingState("idle");
    URL.revokeObjectURL(outputUrl);
    setOutputUrl("");
    if (logRef.current) {
      logRef.current.innerHTML = "";
    }
  }

  return loaded ? (
    <div className="px-4">
      <div className="h-20" />
      <div>
        <div>
          <h2 className="font-semibold">
            Convert media file locally, without uploading it
          </h2>
        </div>
        <div className="mt-4">
          <p>Select a media</p>
          <input
            type="file"
            onChange={selectFile}
            multiple={false}
            className="w-full"
          />
        </div>

        <div className="mt-4">
          <select
            required
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as "audio" | "video")}
            className="w-full p-3.5 border-2 focus-within:border-teal-500 outline-none rounded transition-colors duration-200 bg-transparent"
          >
            {!mediaType && <option value="">Media Type</option>}
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </div>

        {mediaType === "audio" && (
          <div className="mt-4">
            <select
              required={mediaType === "audio"}
              value={mediaFormat}
              onChange={(e) => setMediaFormat(e.target.value)}
              className="w-full p-3.5 border-2 focus-within:border-teal-500 outline-none rounded transition-colors duration-200 bg-transparent"
            >
              {!mediaFormat && <option value="">Media Format</option>}
              <option value="audio/aac">audio/aac</option>
              <option value="audio/flac">audio/flac</option>
              <option value="audio/mp3">audio/mp3</option>
              <option value="audio/ogg">audio/ogg</option>
              <option value="audio/opus">audio/opus</option>
              <option value="audio/wav">audio/wav</option>
            </select>
          </div>
        )}

        {mediaType === "video" && (
          <div className="mt-4">
            <select
              required={mediaType === "video"}
              value={mediaFormat}
              onChange={(e) => setMediaFormat(e.target.value)}
              className="w-full p-3.5 border-2 focus-within:border-teal-500 outline-none rounded transition-colors duration-200 bg-transparent"
            >
              {!mediaFormat && <option value="">Media Format</option>}
              <option value="video/avi">video/avi</option>
              <option value="video/mkv">video/mkv</option>
              <option value="video/mp4">video/mp4</option>
              <option value="video/ogv">video/ogv</option>
              <option value="video/webm">video/webm</option>
            </select>
          </div>
        )}

        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={transcode}
            className="mt-4 px-4 py-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 hover:drop-shadow text-white rounded transition duration-200"
          >
            {typeof processingState === "number" && !outputUrl
              ? `Converting... ${processingState.toFixed(2)}%`
              : "Convert"}
          </button>

          {inputFile && outputUrl && (
            <button
              type="button"
              onClick={downloadFile}
              className="block w-fit mt-4 px-4 py-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 hover:drop-shadow text-white rounded transition duration-200"
            >
              Download
            </button>
          )}
        </div>

        <ol
          ref={logRef}
          className="mt-4 max-h-96 list-decimal list-inside overflow-auto"
        />
      </div>
    </div>
  ) : (
    <div className="fixed w-full h-screen flex flex-col items-center justify-center">
      <LoadingSpinner classname="w-12 h-12" />
      <p className="mt-2">Downloading resources...</p>
    </div>
  );
}
