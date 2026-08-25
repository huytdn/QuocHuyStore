import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminAnalytics = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf9f9] text-xs font-semibold text-neutral-500">
      Đang chuyển hướng sang trang Tổng quan & Thống kê...
    </div>
  );
};

export default AdminAnalytics;
