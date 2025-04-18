"use client";
import { Silkscreen } from "next/font/google"; 
import Link from "next/dist/client/link";
import {FlipWords} from "./components/ui/flip-words";
import '@fontsource/noto-sans-tamil';
import '@fontsource/noto-sans-telugu';
import '@fontsource/noto-sans-kannada';
import '@fontsource/noto-sans-malayalam';

const silkscreen = Silkscreen({ subsets: ["latin"], weight: "400" });

export default function Home() {
  return (
    <div className={`flex flex-col sm:items-center sm:justify-center min-h-screen p-8 pb-20 sm:p-20 ${silkscreen.className}`
    }>
          <FlipWords words={["స్వాగతం", "Welcome", "स्वागत", "வரவேற்பு", "സ്വാഗതം"]} duration={3000} className="font-bold text-4xl sm:text-5xl pb-10 text-center" />
      <Link href="/instagram" className="w-full max-w-md">
      <button
              className="w-full cursor-pointer p-2 mt-4 hover:bg-white/20 font-bold border border-amber-50 bg-white/10 transition-colors duration-75 rounded-md text-white"
            >
              Insta Downloader
            </button>
      </Link>  
      <Link href="/insta-profile" className="w-full max-w-md">
      <button
             className="w-full cursor-pointer p-2 mt-4 hover:bg-white/20 font-bold border border-amber-50 bg-white/10 transition-colors duration-75 rounded-md text-white"
            >
              Insta Profile Downloader
            </button>
      </Link>  
    
    </div>
  );
}
