import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiRefreshCw, FiImage, FiArrowRight } from "react-icons/fi";
import Footer from "../components/Footer";

const SAMPLE_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuC1khJ1vYbalmwkBOt8Q2eGT5W4XqM8zRDLIwi_kCuQSpeNO0NfDRl6FmgRFBVsuJcBr9GhKHFa12XVCJ9iM6pIzprGMBxMpqc4YMm_G-cEItvzkrHSWktVN4KKYUUc7AMu_HW5CtIgWsANCPSvcW5JmDvSSJW_lZWoVeN28NDDSrvXvHTICRaIA2ToRoi5MsThhOZCjSVmQUjEC4-fnBC9Di5qr4AQdcLQ3mNHIGUCLROF_1IazrBBZ0tu6VTV2k8ewKZ4QJC4-Bk";

const SIMILAR_PRODUCTS = [
  {
    id: "blazer",
    name: "Silk Blazer - Midnight Black",
    price: "4.500.000₫",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm69pNU6XCz9DXGZeP499ojq_pyUESS1RgXNbUz3GhugRb5mauQU7JxzArAp98UHKzU04O4ZfiK688JXQehQoFPalQwR-7Z_avyQEDJbB9Y1wFVE5BqB23vc1vEBMU_MuiUUqC7pznrYEUJvC-pfi8c-NQlggVOGC1vb0mCjf-YhZT9FJRv3xh73DNZ9t1Y9gU8GZgRArhFbrbNHrhe2jHB5JgGCtOwRouQlcdoz0DvndeVcus2o0uxT7nGj85j24X0u7hDBrLPcI"
  },
  {
    id: "silk-pants",
    name: "Silk Tailored Trousers - Ivory",
    price: "3.800.000₫",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxnmii9ILDJhlGFIYxFLG8RAHCZPyzBChZzDOQlNdhbySlYpY4KIC65Ue2sl475xBpxZ5I-smd4xE8M6aBhtwZLyjdNssEF7oUzyuiOBu-K5qYA6pkVWa0m7kXnTDePf1IpyxsYYCLWpxGQCPh2_00IbvOOIwNyv2Lw_vPxiVxh1EKpByjJG1dmvmi1JSN16aIZQ-DJvXI7WYHm2lKlsD1_t_NJ4a_OMPHbqfsR1c4TT0BFNTpXTfdpgwFcy_EaPWq4IRPMhVO0-Q"
  },
  {
    id: "cashmere-sweater",
    name: "Cashmere Sweater - Oatmeal",
    price: "2.900.000₫",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlLHigLaaETOhPtD2dGYlq9cFoDns5a2ea2NGdOwcvhHZuqI4gt4-izykLgkzEijsMqzST-WWDqwvBr-0OuQ5RZxLB_aD0JDp1m2MXYh4pGTjCYyKGMLle0rcCRKSb2q0aoUscqmaFRhCMFNW0sHLNax2ehu1RLaTxxpt7wDicGcfVbm8yBV1xDvJUASRGecZZAWyJ-On34jOzedzxH5RlHjDXiNuRJYTMMZZkhXxgxUVxpH8VBEUvKOObij9jKGQEya8-TSRXrL0"
  },
  {
    id: "wool-overcoat",
    name: "Structured Wool Overcoat - Charcoal",
    price: "8.200.000₫",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC04_5xFw-yJLnsMpePHq0URugZb1N2UlWQpbp1XlPFkPioRv5cmRQ4R3-_XEbPoYZ3hbSFl2cbryEmlEZqcordJR0OLFuOOZc9GaBlShpiXUA6MG6qIR7aMrAYFuGEF6tGwJ6igk1-BZAY55hwziq4QD9KmrBh9rBKYlyGMwTOQQGLy8B4bZE8gnU18E5QbfnJEah16oAvFM0gewNJ_weomYGVAnLMbQun2bqoFqYIP8SUKKcAyOHSpyZnhhDZNWeph5SmdfQIBVo"
  }
];

const SmartSearch = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle | scanning | results
  const [resultsVisible, setResultsVisible] = useState(false);

  // Auto-scroll to results when they are ready
  useEffect(() => {
    if (searchStatus === "results" && resultsRef.current) {
      setResultsVisible(true);
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      setResultsVisible(false);
    }
  }, [searchStatus]);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  // Click handler to open input selector
  const handleBoxClick = () => {
    if (searchStatus === "idle") {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  // Core processing
  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng tải lên một tệp ảnh hợp lệ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      startScanning();
    };
    reader.readAsDataURL(file);
  };

  // Loader simulation helper
  const startScanning = () => {
    setSearchStatus("scanning");
    setTimeout(() => {
      setSearchStatus("results");
    }, 3000); // 3 seconds scan simulation
  };

  // Reset Search
  const handleReset = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setSearchStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Demo sample loader
  const handleLoadSample = (e) => {
    e.stopPropagation();
    setImagePreview(SAMPLE_IMAGE);
    startScanning();
  };

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans">
      <main className="pt-32 pb-24 flex-grow">
        
        {/* Search Panel */}
        <section className="max-w-[800px] mx-auto px-6 md:px-0 text-center mb-24">
          <h1 className="font-serif text-[36px] md:text-[48px] font-semibold mb-4 text-black uppercase tracking-normal">
            TÌM KIẾM BẰNG HÌNH ẢNH
          </h1>
          <p className="body-md text-neutral-500 max-w-lg mx-auto mb-10">
            Tải ảnh lên hoặc kéo thả để khám phá các thiết kế tương tự từ bộ sưu tập của LUMIÈRE.
          </p>

          {/* Upload Container Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBoxClick}
            className={`group relative aspect-[16/9] md:aspect-[21/9] border border-dashed flex flex-col items-center justify-center transition-all duration-500 overflow-hidden select-none ${
              dragOver ? "border-black bg-neutral-100" : "border-neutral-300 hover:bg-neutral-50/50"
            } ${searchStatus === "idle" ? "cursor-pointer" : "cursor-default"}`}
          >
            {/* Input Element */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Scanning Line overlay */}
            {searchStatus === "scanning" && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                {/* Horizontal scanner bar */}
                <div className="w-full h-0.5 bg-black/40 shadow-[0_0_8px_#000] absolute left-0 right-0 animate-[scan_3s_ease-in-out_infinite]" />
              </div>
            )}

            {/* 1. Idle UI */}
            {searchStatus === "idle" && (
              <div className="flex flex-col items-center p-6 transition-transform duration-500 group-hover:scale-[1.03]">
                <FiCamera size={44} className="text-neutral-400 mb-4 stroke-[1.2]" />
                <p className="label-sm text-[11px] text-black uppercase tracking-widest font-semibold">
                  Kéo thả ảnh hoặc nhấn để chọn
                </p>
                <button
                  onClick={handleLoadSample}
                  className="mt-4 text-[10px] uppercase font-bold text-neutral-500 hover:text-black border border-neutral-300 hover:border-black px-4 py-2 bg-white transition-colors"
                >
                  SỬ DỤNG ẢNH MẪU
                </button>
              </div>
            )}

            {/* 2. Scanning / Preview UI */}
            {searchStatus !== "idle" && imagePreview && (
              <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Product analysis preview"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    searchStatus === "scanning" ? "opacity-60" : "opacity-80"
                  }`}
                />
                
                {searchStatus === "scanning" && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white px-6 py-3.5 border border-black label-sm text-xs text-black uppercase tracking-widest font-bold shadow-sm">
                      ĐANG PHÂN TÍCH AI...
                    </div>
                  </div>
                )}

                {searchStatus === "results" && (
                  <button
                    onClick={handleReset}
                    className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-2.5 rounded-full transition-colors z-30 cursor-pointer shadow-md"
                    aria-label="Reset Search"
                  >
                    <FiRefreshCw size={14} className="animate-spin-slow" />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* User Manual Steps */}
        {searchStatus !== "results" && (
          <section className="max-w-[1440px] mx-auto px-6 md:px-16 mb-24 border-t border-neutral-200/60 pt-16">
            <div className="text-center mb-16">
              <h2 className="font-serif text-[24px] md:text-[30px] font-medium tracking-normal text-black uppercase">
                HƯỚNG DẪN TÌM KIẾM
              </h2>
              <div className="w-12 h-[1px] bg-black mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="font-serif text-[48px] text-neutral-300 font-light select-none">01</div>
                <h3 className="label-sm text-xs tracking-widest text-black font-bold">TẢI LÊN HÌNH ẢNH</h3>
                <p className="body-md text-neutral-500 text-sm font-light leading-relaxed max-w-xs mx-auto">
                  Tải lên hoặc kéo thả tấm ảnh chụp trang phục bạn yêu thích vào vùng quét.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="font-serif text-[48px] text-neutral-300 font-light select-none">02</div>
                <h3 className="label-sm text-xs tracking-widest text-black font-bold">PHÂN TÍCH AI</h3>
                <p className="body-md text-neutral-500 text-sm font-light leading-relaxed max-w-xs mx-auto">
                  Thuật toán AI của LUMIÈRE sẽ phân tích cấu trúc vải, phom dáng và tone màu trang phục.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="font-serif text-[48px] text-neutral-300 font-light select-none">03</div>
                <h3 className="label-sm text-xs tracking-widest text-black font-bold">KHÁM PHÁ KẾT QUẢ</h3>
                <p className="body-md text-neutral-500 text-sm font-light leading-relaxed max-w-xs mx-auto">
                  Duyệt và mua sắm ngay các sản phẩm thời trang thiết kế tương thích có sẵn trong kho.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Results Grid Container */}
        <section
          ref={resultsRef}
          className={`max-w-[1440px] mx-auto px-6 md:px-16 transition-all duration-1000 transform ${
            resultsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
          }`}
        >
          <div className="flex items-baseline justify-between mb-12 border-b border-neutral-300 pb-4 select-none">
            <h2 className="font-serif text-[28px] md:text-[34px] italic text-black font-medium">Sản phẩm tương tự</h2>
            <span className="label-sm text-[11px] text-neutral-500 font-semibold">4 KẾT QUẢ</span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SIMILAR_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                onClick={() => navigate(`/product/${prod.id}`)}
                className="group cursor-pointer flex flex-col text-left"
              >
                <div className="aspect-[2/3] mb-6 overflow-hidden bg-neutral-100 relative">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <h3 className="body-md text-black font-normal uppercase tracking-tight truncate pr-4">{prod.name}</h3>
                <p className="label-sm text-neutral-500 font-semibold mt-1.5">{prod.price}</p>
              </div>
            ))}
          </div>

          {/* View More Products Button */}
          <div className="mt-20 flex justify-center">
            <button
              onClick={() => navigate("/product")}
              className="px-16 py-4.5 bg-black text-white label-sm font-bold tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Xem Thêm Sản Phẩm
            </button>
          </div>
        </section>

      </main>
      
      <Footer variant="detailed" />

      {/* Embedded CSS animation for scanner scanning line */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SmartSearch;
