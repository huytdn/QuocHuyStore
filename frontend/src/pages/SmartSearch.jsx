import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCamera,
  FiRefreshCw,
  FiImage,
  FiUploadCloud,
  FiHeart,
  FiSliders,
  FiCheckCircle,
  FiAlertCircle,
  FiZap,
  FiLayers,
  FiCpu,
  FiX,
  FiArrowRight,
  FiMaximize2,
} from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { useImageSearch } from "../hooks/api/useImageSearch";
import { useToggleLike } from "../hooks/api/useLikes";
import { useAuthStore } from "../store/useAuthStore";

// Curated 1-Click Demo Looks for instant testing
const DEMO_LOOKS = [
  {
    id: "blazer-black",
    title: "Blazer Dạ Đen",
    subtitle: "Classic Tailored Blazer",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAm69pNU6XCz9DXGZeP499ojq_pyUESS1RgXNbUz3GhugRb5mauQU7JxzArAp98UHKzU04O4ZfiK688JXQehQoFPalQwR-7Z_avyQEDJbB9Y1wFVE5BqB23vc1vEBMU_MuiUUqC7pznrYEUJvC-pfi8c-NQlggVOGC1vb0mCjf-YhZT9FJRv3xh73DNZ9t1Y9gU8GZgRArhFbrbNHrhe2jHB5JgGCtOwRouQlcdoz0DvndeVcus2o0uxT7nGj85j24X0u7hDBrLPcI",
  },
  {
    id: "cashmere-sweater",
    title: "Áo Len Cashmere Kem Cát",
    subtitle: "Oatmeal Knitwear",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAlLHigLaaETOhPtD2dGYlq9cFoDns5a2ea2NGdOwcvhHZuqI4gt4-izykLgkzEijsMqzST-WWDqwvBr-0OuQ5RZxLB_aD0JDp1m2MXYh4pGTjCYyKGMLle0rcCRKSb2q0aoUscqmaFRhCMFNW0sHLNax2ehu1RLaTxxpt7wDicGcfVbm8yBV1xDvJUASRGecZZAWyJ-On34jOzedzxH5RlHjDXiNuRJYTMMZZkhXxgxUVxpH8VBEUvKOObij9jKGQEya8-TSRXrL0",
  },
  {
    id: "wool-overcoat",
    title: "Măng Tô Dạ Dáng Dài",
    subtitle: "Structured Wool Coat",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC04_5xFw-yJLnsMpePHq0URugZb1N2UlWQpbp1XlPFkPioRv5cmRQ4R3-_XEbPoYZ3hbSFl2cbryEmlEZqcordJR0OLFuOOZc9GaBlShpiXUA6MG6qIR7aMrAYFuGEF6tGwJ6igk1-BZAY55hwziq4QD9KmrBh9rBKYlyGMwTOQQGLy8B4bZE8gnU18E5QbfnJEah16oAvFM0gewNJ_weomYGVAnLMbQun2bqoFqYIP8SUKKcAyOHSpyZnhhDZNWeph5SmdfQIBVo",
  },
  {
    id: "silk-pants",
    title: "Quần Silk Trousers",
    subtitle: "Ivory Wide-Leg Pants",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxnmii9ILDJhlGFIYxFLG8RAHCZPyzBChZzDOQlNdhbySlYpY4KIC65Ue2sl475xBpxZ5I-smd4xE8M6aBhtwZLyjdNssEF7oUzyuiOBu-K5qYA6pkVWa0m7kXnTDePf1IpyxsYYCLWpxGQCPh2_00IbvOOIwNyv2Lw_vPxiVxh1EKpByjJG1dmvmi1JSN16aIZQ-DJvXI7WYHm2lKlsD1_t_NJ4a_OMPHbqfsR1c4TT0BFNTpXTfdpgwFcy_EaPWq4IRPMhVO0-Q",
  },
];

const AI_PIPELINE_STEPS = [
  "Tiền xử lý & Chuẩn hóa ảnh (Lanczos Downscale 1024px)...",
  "YOLOv8n: Tự động phát hiện & Cắt chủ thể người mặc (+10% padding)...",
  "Fashion-CLIP ViT-B/32: Trích xuất 512 đặc trưng thị giác L2-normalized...",
  "pgvector Engine: Tính toán Cosine Similarity & DISTINCT ON (p.id)...",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SmartSearch = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);
  const imageSearchMutation = useImageSearch();
  const toggleLikeMutation = useToggleLike();

  // Search States
  const [dragOver, setDragOver] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // 'idle' | 'camera' | 'scanning' | 'results'
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [topK, setTopK] = useState(8);
  const [resultsVisible, setResultsVisible] = useState(false);

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // 'user' | 'environment'

  // Local like state overrides for instant UI feedback
  const [likedMap, setLikedMap] = useState({});

  // Cycle through AI pipeline step messages while scanning
  useEffect(() => {
    let interval = null;
    if (searchStatus === "scanning") {
      setAiStepIndex(0);
      interval = setInterval(() => {
        setAiStepIndex((prev) => (prev + 1) % AI_PIPELINE_STEPS.length);
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [searchStatus]);

  // Auto-scroll to results when ready
  useEffect(() => {
    if (searchStatus === "results" && resultsRef.current) {
      setResultsVisible(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      setResultsVisible(false);
    }
  }, [searchStatus]);

  // Clean up camera stream when unmounting
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Start live webcam stream
  const handleStartCamera = async () => {
    setImagePreview(null);
    setCurrentFile(null);
    setSearchStatus("camera");
    setIsCameraActive(true);

    try {
      if (streamRef.current) {
        stopCameraStream();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error("Không thể mở máy ảnh. Vui lòng cấp quyền truy cập camera!");
      stopCameraStream();
      setSearchStatus("idle");
    }
  };

  // Switch between front and back camera
  const handleToggleFacingMode = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    stopCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setSearchStatus("camera");
    } catch (err) {
      toast.error("Không thể chuyển đổi ống kính máy ảnh!");
    }
  };

  // Capture frame from webcam and submit to AI Search
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Chụp ảnh thất bại!");
          return;
        }

        const capturedFile = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg",
        });

        // Set visual preview
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setImagePreview(dataUrl);
        setCurrentFile(capturedFile);

        // Turn off camera stream
        stopCameraStream();

        // Trigger AI Search
        performSearch(capturedFile);
      },
      "image/jpeg",
      0.95
    );
  };

  // Client validation
  const validateFile = (file) => {
    if (!file) {
      toast.warn("Vui lòng chọn hoặc kéo thả một tệp hình ảnh.");
      return false;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(
        "Định dạng tệp không được hỗ trợ! Vui lòng chọn ảnh JPEG, PNG hoặc WEBP."
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Dung lượng ảnh vượt quá 5MB. Vui lòng tải ảnh nhỏ hơn!");
      return false;
    }

    return true;
  };

  // Core search execution
  const performSearch = (file, requestedK = topK) => {
    if (!validateFile(file)) return;

    setSearchStatus("scanning");

    imageSearchMutation.mutate(
      { file, k: requestedK },
      {
        onSuccess: (data) => {
          const results = data?.results || [];
          setSearchResults(results);

          // Populate initial like status map from backend
          const initialLikes = {};
          results.forEach((item) => {
            if (item.product?.id) {
              initialLikes[item.product.id] = item.product.isLikedByMe || false;
            }
          });
          setLikedMap(initialLikes);

          setSearchStatus("results");
          if (results.length === 0) {
            toast.info(
              "Không tìm thấy sản phẩm có độ tương đồng đủ cao trong kho hàng."
            );
          } else {
            toast.success(`Tìm thấy ${results.length} thiết kế tương đồng!`);
          }
        },
        onError: (err) => {
          setSearchStatus("idle");
          const status = err.response?.status;
          const msg = err.response?.data?.message;

          if (status === 429) {
            toast.error(
              "Bạn đã vượt quá giới hạn tìm kiếm (tối đa 10 lượt/phút). Vui lòng đợi trong giây lát!"
            );
          } else if (status === 503) {
            toast.error(
              "Dịch vụ AI Visual Search hiện đang bảo trì hoặc quá tải. Vui lòng thử lại sau!"
            );
          } else if (status === 400) {
            toast.error(msg || "Tệp ảnh không hợp lệ hoặc không đúng chuẩn.");
          } else {
            toast.error(msg || "Đã xảy ra lỗi khi tìm kiếm bằng hình ảnh!");
          }
        },
      }
    );
  };

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
      handleFileSelected(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!validateFile(file)) return;

    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      performSearch(file);
    };
    reader.readAsDataURL(file);
  };

  // Handle 1-Click Curated Demo Look
  const handleSelectDemoLook = async (look) => {
    try {
      toast.info(`Đang nạp ảnh mẫu: ${look.title}...`);
      setImagePreview(look.image);
      setSearchStatus("scanning");

      // Fetch sample image as Blob to form a real File for API
      const response = await fetch(look.image);
      const blob = await response.blob();
      const demoFile = new File([blob], `${look.id}.jpg`, {
        type: "image/jpeg",
      });

      setCurrentFile(demoFile);
      performSearch(demoFile);
    } catch (err) {
      toast.error("Không thể tải ảnh mẫu demo. Vui lòng thử ảnh khác!");
      setSearchStatus("idle");
    }
  };

  // Reset entire search state
  const handleResetSearch = (e) => {
    if (e) e.stopPropagation();
    stopCameraStream();
    setImagePreview(null);
    setCurrentFile(null);
    setSearchResults([]);
    setSearchStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Re-run search if user changes topK
  const handleChangeTopK = (newK) => {
    setTopK(newK);
    if (currentFile && searchStatus === "results") {
      performSearch(currentFile, newK);
    }
  };

  // Toggle wishlist like
  const handleToggleLike = (e, productId) => {
    e.stopPropagation();

    if (!isUserLoggedIn) {
      toast.warn("Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!");
      navigate("/login");
      return;
    }

    const currentStatus = likedMap[productId] || false;
    // Optimistic UI update
    setLikedMap((prev) => ({ ...prev, [productId]: !currentStatus }));

    toggleLikeMutation.mutate(productId, {
      onSuccess: (data) => {
        setLikedMap((prev) => ({ ...prev, [productId]: data.isLiked }));
        if (data.isLiked) {
          toast.success("Đã thêm vào danh sách yêu thích!");
        } else {
          toast.info("Đã xóa khỏi danh sách yêu thích.");
        }
      },
      onError: () => {
        // Revert on error
        setLikedMap((prev) => ({ ...prev, [productId]: currentStatus }));
        toast.error("Thao tác yêu thích thất bại!");
      },
    });
  };

  // Helper to format similarity percentage badge style
  const getSimilarityBadge = (similarity) => {
    const pct = Math.round((similarity || 0) * 100);
    let badgeColor = "bg-[#FAF6EE] text-[#8C6B38] border-[#EADFCB]"; // Luxury Gold/Tan
    if (pct >= 85) {
      badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
    } else if (pct >= 70) {
      badgeColor = "bg-[#FAF6EE] text-[#8C6B38] border-[#EADFCB]";
    }
    return { pct, badgeColor };
  };

  return (
    <div className="bg-surface-bg text-black min-h-screen flex flex-col font-dmsans selection:bg-black selection:text-white">
      <main className="pt-28 md:pt-32 pb-24 flex-grow">
        {/* Hidden Canvas for Camera Frame Ingestion */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hero Section & Title */}
        <section className="max-w-[960px] mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
            <FiCpu className="text-black" size={13} />
            Fashion-CLIP & YOLOv8n Vector Retrieval
          </div>

          <h1 className="font-serif text-[34px] sm:text-[44px] md:text-[52px] font-semibold mb-4 text-black uppercase tracking-tight leading-tight">
            TÌM KIẾM BẰNG HÌNH ẢNH
          </h1>
          <p className="body-md text-neutral-500 max-w-xl mx-auto mb-8 font-light">
            Tải ảnh chụp, ảnh lưu từ mạng xã hội hoặc chụp trực tiếp để khám phá
            các thiết kế có cùng phom dáng, chất liệu và màu sắc trong kho hàng.
          </p>

          {/* Upload & Ingestion Box */}
          <div className="relative max-w-[760px] mx-auto">
            {/* Box Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (searchStatus === "idle") fileInputRef.current?.click();
              }}
              className={`group relative aspect-[16/10] md:aspect-[21/10] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 overflow-hidden select-none rounded-sm ${
                dragOver
                  ? "border-black bg-neutral-100 scale-[1.01]"
                  : "border-neutral-300 bg-white hover:border-neutral-600 hover:bg-neutral-50/50"
              } ${searchStatus === "idle" ? "cursor-pointer" : "cursor-default"}`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* 1. Idle UI State */}
              {searchStatus === "idle" && (
                <div className="flex flex-col items-center p-8 transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-700 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <FiUploadCloud size={28} className="stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-black mb-1">
                    Kéo thả ảnh hoặc bấm để tải lên
                  </h3>
                  <p className="label-sm text-[10px] text-neutral-400 font-normal tracking-wider mb-6">
                    Hỗ trợ định dạng JPEG, PNG, WEBP • Tối đa 5MB
                  </p>

                  <div
                    className="flex flex-wrap items-center justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-black text-white text-[11px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                    >
                      Chọn Tệp Ảnh
                    </button>
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-300 text-black text-[11px] uppercase tracking-widest font-bold hover:border-black transition-colors shadow-xs cursor-pointer"
                    >
                      <FiCamera size={14} />
                      Chụp Trực Tiếp
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Live Camera Viewfinder State */}
              {searchStatus === "camera" && (
                <div
                  className="absolute inset-0 bg-black flex flex-col items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Viewfinder Target Framing Brackets */}
                  <div className="absolute inset-8 border border-white/30 pointer-events-none rounded-xs flex flex-col justify-between p-4">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-t-2 border-l-2 border-[#C5A880]" />
                      <div className="w-6 h-6 border-t-2 border-r-2 border-[#C5A880]" />
                    </div>
                    <p className="text-center text-[10px] uppercase tracking-widest text-white/80 font-bold bg-black/40 py-1 px-3 self-center rounded-full backdrop-blur-xs">
                      Căn chỉnh trang phục vào khung ngắm
                    </p>
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-b-2 border-l-2 border-[#C5A880]" />
                      <div className="w-6 h-6 border-b-2 border-r-2 border-[#C5A880]" />
                    </div>
                  </div>

                  {/* Camera Control Bar */}
                  <div className="absolute bottom-4 flex items-center gap-4 z-30">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                      title="Chuyển đổi camera"
                    >
                      <FiRefreshCw size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="w-14 h-14 rounded-full border-4 border-white bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                      title="Chụp ảnh"
                    >
                      <div className="w-6 h-6 rounded-full bg-white" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopCameraStream();
                        setSearchStatus("idle");
                      }}
                      className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                      title="Đóng camera"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Scanning & Analysis / Preview State */}
              {(searchStatus === "scanning" || searchStatus === "results") &&
                imagePreview && (
                  <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Query Image Preview"
                      className={`w-full h-full object-cover transition-opacity duration-700 ${
                        searchStatus === "scanning" ? "opacity-40" : "opacity-90"
                      }`}
                    />

                    {/* Scanning Laser Line */}
                    {searchStatus === "scanning" && (
                      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent shadow-[0_0_15px_#C5A880] absolute left-0 right-0 animate-[scan_2.8s_ease-in-out_infinite]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/60 pointer-events-none" />
                      </div>
                    )}

                    {/* AI Step Overlay Message */}
                    {searchStatus === "scanning" && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 backdrop-blur-[2px] z-30">
                        <div className="bg-white/95 px-6 py-4 border border-black shadow-lg text-center max-w-md">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <FiZap className="text-[#8C6B38] animate-bounce" size={16} />
                            <span className="label-sm text-[11px] text-black font-bold tracking-widest">
                              ĐANG PHÂN TÍCH THỊ GIÁC AI
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 font-medium transition-all duration-300">
                            {AI_PIPELINE_STEPS[aiStepIndex]}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick Reset Button in Results mode */}
                    {searchStatus === "results" && (
                      <button
                        type="button"
                        onClick={handleResetSearch}
                        className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all z-30 cursor-pointer shadow-md backdrop-blur-xs"
                        title="Tìm ảnh khác"
                      >
                        <FiRefreshCw size={13} />
                        <span>Ảnh Mới</span>
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Curated 1-Click Demo Looks Bar */}
          {searchStatus === "idle" && (
            <div className="mt-12 max-w-[760px] mx-auto text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="label-sm text-[10px] text-neutral-400 font-bold tracking-widest">
                  GỢI Ý TRẢI NGHIỆM NHANH (1-CLICK DEMO LOOKS)
                </span>
                <span className="text-[10px] text-neutral-400">
                  Chọn mẫu để AI tìm trang phục tương đương
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DEMO_LOOKS.map((look) => (
                  <div
                    key={look.id}
                    onClick={() => handleSelectDemoLook(look)}
                    className="group border border-neutral-200 bg-white p-2.5 rounded-xs cursor-pointer hover:border-black transition-all duration-300 hover:shadow-xs flex flex-col"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-neutral-100 mb-2 relative rounded-xs">
                      <img
                        src={look.image}
                        alt={look.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider transition-opacity duration-300 shadow-xs">
                          Thử Mẫu
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-black truncate">
                      {look.title}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {look.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Results Section */}
        {searchStatus === "results" && (
          <section
            ref={resultsRef}
            className={`max-w-[1440px] mx-auto px-6 md:px-16 transition-all duration-700 transform ${
              resultsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8 pointer-events-none"
            }`}
          >
            {/* Results Header Bar */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10 border-b border-neutral-300 pb-5">
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="w-14 h-18 rounded-xs overflow-hidden border border-neutral-300 shadow-xs shrink-0 hidden sm:block">
                    <img
                      src={imagePreview}
                      alt="Query Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="label-sm text-[10px] text-[#8C6B38] font-bold tracking-widest block mb-1">
                    KẾT QUẢ TÌM KIẾM VECTOR PGVECTOR
                  </span>
                  <h2 className="font-serif text-[26px] md:text-[32px] text-black font-semibold uppercase tracking-tight">
                    {searchResults.length > 0
                      ? `Tìm Thấy ${searchResults.length} Thiết Kế Tương Đồng`
                      : "Không Tìm Thấy Sản Phẩm Tương Thích"}
                  </h2>
                </div>
              </div>

              {/* Top-K Selector Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Số kết quả:
                  </span>
                  <div className="inline-flex border border-neutral-300 rounded-xs overflow-hidden bg-white">
                    {[4, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleChangeTopK(num)}
                        className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                          topK === num
                            ? "bg-black text-white"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-4 py-2 border border-neutral-300 text-black text-[11px] uppercase tracking-widest font-bold hover:border-black transition-colors bg-white cursor-pointer"
                >
                  Tải Ảnh Khác
                </button>
              </div>
            </div>

            {/* Results Grid / Empty State */}
            {searchResults.length === 0 ? (
              <div className="py-20 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <FiAlertCircle size={32} />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-2">
                  Chưa có sản phẩm phù hợp trong kho
                </h3>
                <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                  Khoảng cách vector vượt quá ngưỡng tối đa cho phép (0.38). Bạn
                  hãy thử lại với góc chụp chính diện hơn, đủ ánh sáng hoặc khám
                  phá toàn bộ bộ sưu tập hiện có.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleResetSearch}
                    className="px-6 py-3 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Thử Lại Với Ảnh Khác
                  </button>
                  <button
                    onClick={() => navigate("/product")}
                    className="px-6 py-3 border border-neutral-300 text-black text-xs uppercase tracking-widest font-bold hover:border-black transition-colors bg-white cursor-pointer"
                  >
                    Xem Tất Cả Sản Phẩm
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {searchResults.map((item) => {
                  const product = item.product || {};
                  const isLiked = likedMap[product.id] ?? product.isLikedByMe ?? false;
                  const { pct, badgeColor } = getSimilarityBadge(item.similarity);
                  const displayImage = item.colorImageUrl || product.thumbnailUrl;
                  const formattedPrice = product.minPrice
                    ? Number(product.minPrice).toLocaleString("vi-VN") + "₫"
                    : "Liên hệ";
                  const displayRating =
                    product.averageStar !== undefined && product.averageStar !== null
                      ? Number(product.averageStar).toFixed(1)
                      : null;

                  return (
                    <div
                      key={`${product.id}-${item.colorId}`}
                      onClick={() =>
                        navigate(`/product/${product.slug || product.id}`, {
                          state: { colorId: item.colorId },
                        })
                      }
                      className="group flex flex-col cursor-pointer select-none border border-neutral-200 hover:border-black transition-all duration-300 bg-white p-3 rounded-xs hover:shadow-sm"
                    >
                      {/* Image Container with Match Badge */}
                      <div className="w-full aspect-[2/3] overflow-hidden bg-neutral-100 relative rounded-xs mb-3">
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Similarity Score Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${badgeColor}`}
                          >
                            <FiCheckCircle size={10} />
                            {pct}% Phù Hợp
                          </span>
                        </div>

                        {/* Wishlist Heart Icon */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleLike(e, product.id)}
                          aria-label={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
                          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
                        >
                          {isLiked ? (
                            <FaHeart size={14} className="text-red-600 animate-pulse" />
                          ) : (
                            <FiHeart size={14} className="stroke-[1.75]" />
                          )}
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col gap-1 text-left flex-grow justify-between">
                        <div>
                          {/* Matched Color Badge */}
                          {item.colorName && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-2 h-2 rounded-full bg-black/60" />
                              <span className="label-sm text-neutral-500 font-bold tracking-widest text-[9px] uppercase">
                                Màu: {item.colorName}
                              </span>
                            </div>
                          )}

                          {/* Product Title */}
                          <h3 className="font-sans text-sm md:text-base text-black font-medium leading-snug line-clamp-1 group-hover:underline underline-offset-4 transition-all">
                            {product.name}
                          </h3>

                          {product.categoryName && (
                            <p className="text-[11px] text-neutral-400 capitalize mt-0.5">
                              {product.categoryName}
                            </p>
                          )}
                        </div>

                        {/* Price & Rating */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100">
                          <span className="font-sans text-sm md:text-base font-semibold text-neutral-900">
                            {formattedPrice}
                          </span>

                          {displayRating && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-800 bg-[#FAF6EE] border border-[#EADFCB] px-1.5 py-0.5 rounded-xs shrink-0">
                              <FaStar size={10} className="text-[#E6A117]" />
                              <span>{displayRating}</span>
                              {product.reviewCount > 0 && (
                                <span className="text-[9px] text-neutral-400 font-normal">
                                  ({product.reviewCount})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Navigation CTA */}
            <div className="mt-16 flex justify-center gap-4">
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-8 py-3.5 border border-black bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Tìm Kiếm Bằng Ảnh Khác
              </button>
              <button
                type="button"
                onClick={() => navigate("/product")}
                className="px-8 py-3.5 bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Xem Thêm Bộ Sưu Tập</span>
                <FiArrowRight size={14} />
              </button>
            </div>
          </section>
        )}

        {/* Informative Deep Dive: How AI Visual Search Works */}
        {searchStatus !== "results" && (
          <section className="max-w-[1280px] mx-auto px-6 md:px-16 mt-20 border-t border-neutral-200/80 pt-16">
            <div className="text-center mb-12">
              <span className="label-sm text-[10px] text-neutral-400 font-bold tracking-widest block mb-1">
                KIẾN TRÚC THỊ GIÁC MÁY TÍNH
              </span>
              <h2 className="font-serif text-[24px] md:text-[30px] font-semibold text-black uppercase tracking-tight">
                CƠ CHẾ HOẠT ĐỘNG CỦA AI VISUAL RETRIEVAL
              </h2>
              <div className="w-12 h-[1px] bg-black mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-3 text-left hover:border-black transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black font-bold font-serif">
                  01
                </div>
                <h3 className="label-sm text-xs tracking-wider text-black font-bold">
                  YOLOv8n DYNAMIC CROP
                </h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  Tự động phát hiện chủ thể người mặc, loại bỏ 100% bối cảnh
                  nhiễu xung quanh với cơ chế padding an toàn 10%, giữ trọn vẹn
                  phom dáng trang phục.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-3 text-left hover:border-black transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black font-bold font-serif">
                  02
                </div>
                <h3 className="label-sm text-xs tracking-wider text-black font-bold">
                  FASHION-CLIP EMBEDDING
                </h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  Mô hình Vision Transformer (ViT-B/32) trích xuất vector đặc
                  trưng 512 chiều chuyên sâu về cổ áo, độ dài ống tay, chất liệu
                  dệt và sắc độ màu sắc thời trang.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-3 text-left hover:border-black transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black font-bold font-serif">
                  03
                </div>
                <h3 className="label-sm text-xs tracking-wider text-black font-bold">
                  PGVECTOR COSINE SIMILARITY
                </h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  Toán tử khoảng cách Cosine trên PostgreSQL 16 kết hợp mệnh đề
                  DISTINCT ON lọc ngay màu sắc tương thích nhất của mỗi sản phẩm
                  với độ trễ dưới 15ms.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer variant="detailed" />

      {/* Laser Scanning Radar Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SmartSearch;
