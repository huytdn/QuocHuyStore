const AdminHeader = () => {
  return (
    <header className="flex justify-end items-center h-14 px-8 sticky top-0 z-40 bg-[#fbf9f9]/80 backdrop-blur-md border-b border-[#cfc4c5]">
      <div className="flex items-center space-x-4">
        <button
          className="material-symbols-outlined text-neutral-400 hover:text-black transition-all active:scale-95 cursor-pointer text-xl"
          title="Notifications"
        >
          notifications
        </button>
        <button
          className="material-symbols-outlined text-neutral-400 hover:text-black transition-all active:scale-95 cursor-pointer text-xl"
          title="Settings"
        >
          settings
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
