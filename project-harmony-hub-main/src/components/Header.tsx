import kbtcoeLogo from '@/assets/kbtcoe-logo.png';

export default function Header() {
  return (
    <header className="w-full bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={kbtcoeLogo} 
            alt="KBTCOE Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>
    </header>
  );
}
