"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, Download, Settings2 } from "lucide-react";
import NextImage from "next/image";

interface ImageStats {
  name: string;
  size: number;
  width: number;
  height: number;
  url: string;
}

export default function ClientImageCompressor() {
  const [original, setOriginal] = useState<ImageStats | null>(null);
  const [compressed, setCompressed] = useState<ImageStats | null>(null);
  const [quality, setQuality] = useState<number>(0.75);
  const [maxWidth, setMaxWidth] = useState<number>(1920); // เปลี่ยน Default เป็น 1920px (Full HD) เหมาะกับงานเว็บ
  const [loading, setLoading] = useState<boolean>(false);
  
  const currentFileRef = useRef<File | null>(null);

  // แก้ปัญหา Memory Leak: เคลียร์ ObjectURL ทิ้งเมื่อ Component ถูกทำลาย
  useEffect(() => {
    return () => {
      if (original?.url) URL.revokeObjectURL(original?.url);
      if (compressed?.url) URL.revokeObjectURL(compressed?.url);
    };
  }, [original, compressed]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getImageDimensions = (file: File | Blob): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImage = async (file: File, currentQuality: number, currentMaxWidth: number) => {
    if (!file) return;
    setLoading(true);

    try {
      if (!original || original.name !== file.name || original.size !== file.size) {
        const origDims = await getImageDimensions(file);
        
        // เคลียร์ URL เก่าก่อนสร้างใหม่
        if (original?.url) URL.revokeObjectURL(original.url);
        
        setOriginal({
          name: file.name,
          size: file.size,
          width: origDims.width,
          height: origDims.height,
          url: URL.createObjectURL(file),
        });
      }

      const options = {
        maxWidthOrHeight: currentMaxWidth,
        initialQuality: currentQuality,
        useWebWorker: true,
        fileType: "image/webp",
      };

      const compressedFile = await imageCompression(file, options);
      const compDims = await getImageDimensions(compressedFile);

      // เคลียร์ URL เก่าก่อนสร้างใหม่
      if (compressed?.url) URL.revokeObjectURL(compressed.url);

      setCompressed({
        name: `compressed_${file.name.split(".")[0]}.webp`,
        size: compressedFile.size,
        width: compDims.width,
        height: compDims.height,
        url: URL.createObjectURL(compressedFile),
      });

    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบีบอัดภาพ:", error);
      alert("ไม่สามารถบีบอัดภาพได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // --- ตั้งค่า React Dropzone ---
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      currentFileRef.current = file;
      compressImage(file, quality, maxWidth);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'] // บังคับรับเฉพาะรูปภาพ
    },
    maxFiles: 1, // รับแค่ทีละไฟล์
  });

  const handleQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseFloat(e.target.value);
    setQuality(newQuality);
    if (currentFileRef.current) compressImage(currentFileRef.current, newQuality, maxWidth);
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value);
    setMaxWidth(newWidth);
    if (currentFileRef.current) compressImage(currentFileRef.current, quality, newWidth);
  };

  // ฟังก์ชันดาวน์โหลด
  const handleDownload = () => {
    if (!compressed) return;
    const link = document.createElement('a');
    link.href = compressed.url;
    link.download = compressed.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savedPercentage = original && compressed
    ? (((original.size - compressed.size) / original.size) * 100).toFixed(1)
    : "0";

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen text-slate-800">
      <h1 className="text-3xl font-bold mb-2 text-center text-indigo-600 flex justify-center items-center gap-3">
        <ImageIcon className="w-8 h-8" /> Image Compression Lab
      </h1>
      <p className="text-center text-slate-500 mb-8">
        ทดลองบีบอัดและย่อขนาดภาพด้วย Web Workers (ประมวลผลฝั่ง Client 100%)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/*s กล่อง Dropzone แทนที่ input file ธรรมดา */}
        <div 
          {...getRootProps()} 
          className={`bg-white p-6 rounded-xl shadow-sm border-2 border-dashed flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-200 
            ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400"}
            ${isDragReject ? "border-red-500 bg-red-50" : ""}
          `}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-10 h-10 mb-3 ${isDragActive ? "text-indigo-600" : "text-slate-400"}`} />
          {isDragActive ? (
            <p className="font-semibold text-indigo-600">วางรูปภาพที่นี่เลย...</p>
          ) : (
            <>
              <p className="font-semibold text-slate-700">ลาก & วางรูปภาพที่นี่</p>
              <p className="text-xs text-slate-500 mt-1">หรือคลิกเพื่อเลือกไฟล์ (JPG, PNG, WebP)</p>
            </>
          )}
          {original && <p className="mt-3 text-xs text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full truncate max-w-[200px]">{original.name}</p>}
        </div>

        {/* แผงควบคุม Quality */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Settings2 className="w-4 h-4 text-slate-400" />
            Quality (คุณภาพรูปภาพ): <span className="text-indigo-600">{(quality * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0.1" max="1.0" step="0.05"
            value={quality}
            onChange={handleQualityChange}
            disabled={!original}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
          />
          <span className="text-xs text-slate-400 block mt-2 leading-relaxed">
            ค่ายิ่งน้อย ขนาดไฟล์ยิ่งเล็ก แต่รายละเอียดภาพจะหายไป แนะนำที่ 70-80%
          </span>
        </div>

        {/* แผงควบคุม Max Width */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <label className="block text-sm font-semibold mb-2">
            Max Width (กว้างสูงสุด): <span className="text-indigo-600">{maxWidth} px</span>
          </label>
          <input
            type="range"
            min="400" max="3840" step="100"
            value={maxWidth}
            onChange={handleWidthChange}
            disabled={!original}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
          />
          <span className="text-xs text-slate-400 block mt-2 leading-relaxed">
            ภาพที่ใหญ่กว่าค่านี้ จะถูกย่อขนาดลงมารักษาสัดส่วน แนะนำ 1920px (Full HD)
          </span>
        </div>
      </div>

      {/* Metrics */}
      {original && compressed && (
        <div className="bg-linear-to-r from-indigo-600 to-violet-700 p-6 rounded-xl shadow-lg text-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">ขนาดเดิม</p>
            <p className="text-2xl font-bold">{formatBytes(original.size)}</p>
            <p className="text-xs text-indigo-300 mt-1">{original.width} x {original.height} px</p>
          </div>
          <div className="border-y sm:border-y-0 sm:border-x border-indigo-400/30 py-4 sm:py-0">
            <p className="text-indigo-200 text-sm font-medium mb-1">ขนาดหลังบีบอัด (WebP)</p>
            <p className="text-2xl font-bold text-emerald-400">{formatBytes(compressed.size)}</p>
            <p className="text-xs text-indigo-300 mt-1">{compressed.width} x {compressed.height} px</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">ประหยัดพื้นที่บนระบบ</p>
            <p className="text-3xl font-black text-amber-400 drop-shadow-sm">ลดลง {savedPercentage}%</p>
            <p className="text-xs text-indigo-300 mt-1">ประหยัดไปได้ {formatBytes(original.size - compressed.size)}</p>
          </div>
        </div>
      )}

      {/* Before & After */}
      {original && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ฝั่งภาพเดิม */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-3 text-slate-700 flex justify-between items-center">
              <span>ก่อนทำ (Original)</span>
              <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{formatBytes(original.size)}</span>
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-[url('https://grid.malven.co/assets/img/grid-bg.png')] flex items-center justify-center min-h-[350px]">
              <NextImage
                src={original.url}
                alt="Original"
                width={original.width}
                height={original.height}
                unoptimized
                className="object-contain max-h-[400px]"
              />
            </div>
          </div>

          {/* ฝั่งภาพที่บีบอัดแล้ว */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative">
            <h3 className="font-semibold mb-3 text-slate-700 flex justify-between items-center">
              <span>หลังทำ (Compressed)</span>
              <div className="flex gap-2 items-center">
                <span className="text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded-md">
                  {compressed ? formatBytes(compressed.size) : ""}
                </span>
                
                {/* ปุ่ม Download ของใหม่ */}
                {compressed && (
                  <button 
                    onClick={handleDownload}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="โหลดภาพไปทดสอบ"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-[url('https://grid.malven.co/assets/img/grid-bg.png')] flex items-center justify-center min-h-[350px] relative">
              {loading ? (
                <div className="absolute inset-0 bg-white/80 flex flex-col gap-3 items-center justify-center font-medium text-indigo-600 z-10 backdrop-blur-sm transition-all">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  กำลังบีบอัดรูปภาพ...
                </div>
              ) : null}
              {compressed && (
                <NextImage
                  src={compressed.url}
                  alt="Compressed"
                  width={compressed.width}
                  height={compressed.height}
                  unoptimized
                  className="object-contain max-h-[400px]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
