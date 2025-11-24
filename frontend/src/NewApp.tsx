import React, { useState } from 'react';
import axios from 'axios';
import { Upload, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

// ----------------------------------------------------------------------
// 🔗 PASTE YOUR CLOUDFLARE URL HERE (from the spare laptop terminal)
// Example: "https://random-words.trycloudflare.com"
// ----------------------------------------------------------------------
const API_URL = "http://localhost:8000";
// const API_URL = "https://had-distributors-downtown-killing.trycloudflare.com";

function NewApp() {
  // Define strict types for state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Type the event as a standard HTML Input Change Event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Safety check for the URL
    if (API_URL.includes("YOUR-CLOUDFLARE-URL") || API_URL.includes("YOUR-ID-HERE")) {
      setError("⚠️ You forgot to paste your Cloudflare URL in App.tsx!");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // We explicitly tell Axios we expect a Blob in response
      // NOTE: Cloudflare sometimes has stricter timeouts/checks, but for images <5MB it works great.
      const response = await axios.post(`${API_URL}/generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob', 
      });

      // Create a URL from the received Blob
      const imageUrl = URL.createObjectURL(response.data);
      setResult(imageUrl);
    } catch (err: any) {
      console.error(err);
      // specific error handling
      if (err.message === 'Network Error') {
        setError("Network Error: Could not reach the spare laptop. Is the Cloudflare tunnel running?");
      } else if (err.response?.status === 413) {
        setError("File too large for Cloudflare free tier (Limit is 100MB, usually fine).");
      } else {
        setError("Failed to process image. Server might be busy.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-gray-950 text-white">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent mb-2">
          Thermal<span className="text-white">2</span>RGB
        </h1>
        <p className="text-gray-400">GAN-Powered Night Vision Converter</p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Upload Area (Only show if no image selected) */}
        {!preview && (
          <div className="border-2 border-dashed border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center hover:border-orange-500 hover:bg-gray-800/30 transition-all cursor-pointer relative group">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="p-4 bg-gray-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-xl font-medium text-gray-300">Drop your thermal image here</p>
            <p className="text-sm text-gray-500 mt-2">or click to browse</p>
          </div>
        )}

        {/* Comparison View (Show after upload) */}
        {preview && (
          <div className="animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              
              {/* Left: Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Original Thermal</span>
                    <button onClick={clearSelection} className="text-xs text-red-400 hover:underline">Clear</button>
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-700 shadow-lg bg-black">
                  <img src={preview} alt="Thermal Input" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Right: Output */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Generated RGB</span>
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-700 bg-black/50 shadow-lg flex items-center justify-center">
                  
                  {/* Empty State / Loading */}
                  {!result && !loading && (
                    <div className="text-center">
                        <button 
                            onClick={handleUpload}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition flex items-center gap-2 mx-auto"
                        >
                            Generate <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                  )}

                  {/* Loading Spinner */}
                  {loading && (
                    <div className="flex flex-col items-center">
                        <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                        <span className="text-gray-400 text-sm animate-pulse">Running GAN Model...</span>
                    </div>
                  )}

                  {/* Result Image */}
                  {result && (
                    <img src={result} alt="Generated RGB" className="w-full h-full object-cover animate-in zoom-in duration-300" />
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 text-gray-600 text-sm">
        Running on Node.js + ONNX Runtime via Cloudflare
      </div>
    </div>
  );
}

export default NewApp;