import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 24px',
        background: 'var(--bg-primary)',
        minWidth: 0,
        /* On mobile, add top padding for fixed navbar */
      }} className="app-main">
        {children}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .app-main { padding-top: 76px !important; padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </div>
  );
}
