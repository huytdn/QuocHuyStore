const AdminHeader = () => {
  return (
    <header className="flex justify-end items-center h-16 px-16 sticky top-0 z-40 bg-[#fbf9f9]/80 backdrop-blur-md border-b border-[#cfc4c5]">
      <div className="flex items-center space-x-6">
        <button
          className="material-symbols-outlined text-neutral-400 hover:text-black transition-all active:scale-95 cursor-pointer"
          title="Notifications"
        >
          notifications
        </button>
        <button
          className="material-symbols-outlined text-neutral-400 hover:text-black transition-all active:scale-95 cursor-pointer"
          title="Settings"
        >
          settings
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
