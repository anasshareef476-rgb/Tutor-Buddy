import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 28px',
        background: '#000',
        minWidth: 0,
      }} className="app-main">
        {children}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .app-main { padding-top: 76px !important; padding-left: 16px !important; padding-right: 16px !important; padding-bottom: 24px !important; }
        }
      `}</style>
    </div>
  );
}
