import sandipFoundationLogo from '@/assets/sandip-foundation-logo.jpeg';
import sandipPolytechnicLogo from '@/assets/sandip-polytechnic-logo.png';

export default function Header() {
  return (
    <header className="w-full bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={sandipFoundationLogo} 
            alt="Sandip Foundation Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <img 
            src={sandipPolytechnicLogo} 
            alt="Sandip Polytechnic Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>
    </header>
  );
}
