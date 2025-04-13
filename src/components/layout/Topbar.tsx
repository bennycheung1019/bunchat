interface TopbarProps {
  onToggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  return (
    <div className="sticky top-0 z-30 w-full bg-white border-b border-zinc-200 shadow-sm">
      <div className="h-14 flex items-center px-4 justify-between">
        <button
          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-zinc-100 transition rounded-md shadow-sm border border-zinc-200"
          onClick={onToggleSidebar}
        >
          <span className="text-xl">☰</span>
        </button>
        <div className="w-10 h-10" />
      </div>
    </div>
  );
};

export default Topbar;
