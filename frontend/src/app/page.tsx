import Link from "next/link";
import * as motion from "framer-motion/client";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      overflow: 'hidden'
    }}>
      {/* Animated Glow background */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} 
      />
      
      <motion.div 
        style={{ position: 'fixed', bottom: '10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', maxWidth: 800, zIndex: 10 }}
      >
        <motion.div variants={itemVariants} style={{ fontSize: 72, marginBottom: 16 }}>🎓</motion.div>
        <motion.h1 variants={itemVariants} style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em' }}>
          Learn Smarter with<br />
          <span style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Tutor Buddy</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} style={{ fontSize: 19, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 48, maxWidth: 550, margin: '0 auto 48px' }}>
          Your ultimate AI-powered learning sidekick. Chat with documents, generate smart flashcards, take personalized quizzes, and crush your goals.
        </motion.p>

        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard" style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', color: 'white', textDecoration: 'none',
              padding: '16px 36px', borderRadius: 16, fontWeight: 700, fontSize: 16,
              boxShadow: '0 8px 32px rgba(59,130,246,0.3)', display: 'inline-block', transition: 'box-shadow 0.2s'
            }}>
              Get Started →
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/chat" style={{
              background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)', textDecoration: 'none',
              padding: '16px 36px', borderRadius: 16, fontWeight: 600, fontSize: 16,
              border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', display: 'inline-block'
            }}>
              Try AI Chat
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature grid */}
        <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { icon: '💬', title: 'AI Chat', desc: 'Step-by-step explanations on any topic' },
            { icon: '📄', title: 'Document RAG', desc: 'Chat directly with your PDFs & notes' },
            { icon: '🃏', title: 'Smart Flashcards', desc: 'Master concepts with spaced repetition' },
            { icon: '📝', title: 'AI Quiz Gen', desc: 'Instant multiple-choice quizzes' },
            { icon: '🗺️', title: 'Study Roadmaps', desc: 'Personalized weekly learning plans' },
            { icon: '📊', title: 'Progress Tracking', desc: 'Deep insights into your journey' },
          ].map((f, i) => (
            <motion.div 
              key={f.title} 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02, backgroundColor: 'rgba(59,130,246,0.08)' }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ 
                borderRadius: 20, padding: '24px', textAlign: 'left',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)', cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#fff' }}>{f.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
