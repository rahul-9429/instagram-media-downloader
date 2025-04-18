"use client";
import { useState } from "react";
import { Silkscreen } from "next/font/google";
import Image from "next/image";

const silkscreen = Silkscreen({ subsets: ["latin"], weight: "400" });

export default function Home() {
  const [url, setUrl] = useState("");
  const [fetched, setFetched] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:5000/profile/?user=${url}`);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setFetched(imageUrl);
      setUrl("");
    } catch (error) {
      console.error("Error:", error);
      setFetched(null);
    }
  };

  const downloadProfile = () => {
    if (!fetched) return;
    const link = document.createElement("a");
    link.href = fetched;
    link.download = `instagram_profile.jpg`;  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex flex-col sm:items-center sm:justify-center min-h-screen p-8 pb-20 sm:p-20 ${silkscreen.className}`}>
      <h1 className="font-bold text-4xl sm:text-5xl pb-10 text-center">Instagram Profile Downloader</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          value={url}
          required
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
          placeholder="Enter Instagram username or profile URL"
        />
        <button
          type="submit"
          className="w-full cursor-pointer p-2 mt-4 font-bold bg-white/90 transition-colors duration-75 hover:bg-white rounded-md text-black"
        >
          Search
        </button>
      </form>

      <span className="text-sm text-white/80 flex flex-col items-center justify-center py-5">
        <h2>Simple. Secure. Reliable.</h2>
        <h5>
          <a href="mailto:rahulkasimikota@gmail.com" className="tracking-tighter text-sm hover:underline transition-all duration-75 ease-in-out">
            rahulkasimikota
          </a>
        </h5>
      </span>

      {fetched && (
        <div className="mt-6 w-full max-w-md border-2 border-white/50 rounded-md p-4 flex flex-col items-center overflow-hidden">
          <Image
            src={fetched}
            alt="Profile Picture"
            width={300}
            height={300}
            className="rounded-md object-cover"
          />
          <button
            onClick={downloadProfile}
            className="w-full cursor-pointer p-2 mt-4 font-bold bg-white/90 transition-colors duration-75 hover:bg-white rounded-md text-black"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
