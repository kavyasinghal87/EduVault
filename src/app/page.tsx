"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
} as any;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 12 } },
} as any;

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Animated Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.3, 0.4, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" 
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.2, 0.3, 0.2] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-mint/10 blur-[150px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/3" 
      />

      {/* Navigation */}
      <header className="fixed top-0 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(108,99,255,0.5)]">
              <span className="font-bold text-white leading-none">E</span>
            </div>
            <span className="font-bold text-lg tracking-tight">EduVault</span>
          </motion.div>
          
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex gap-8 text-sm font-medium text-muted"
          >
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#method" className="hover:text-foreground transition-colors">The Method</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </motion.nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(108,99,255,0.3)]"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col pt-32 pb-20 z-10">
        <motion.section 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="container mx-auto px-6 flex flex-col items-center text-center max-w-4xl mt-12 mb-32 relative"
        >
          
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 border border-accent/20 backdrop-blur-sm shadow-[0_0_30px_rgba(108,99,255,0.15)]">
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <span>EduVault AI is now available in Beta</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tight text-balance mb-6 leading-tight">
            Your Premium <br />
            <motion.span 
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#A8A4FF] to-accent bg-[length:200%_auto]"
            >
              Knowledge Vault
            </motion.span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted text-balance max-w-2xl mb-10 leading-relaxed">
            The most intelligent, beautiful, and effective space to build your knowledge. Combine the structure of a workspace with the active recall of hyper-optimized flashcards.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              href="/signup" 
              className="group flex items-center gap-2 px-8 py-4 text-base font-semibold bg-accent hover:bg-accent-hover text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(108,99,255,0.4)]"
            >
              Start Building Your Vault
              <div className="group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="w-5 h-5 group-hover:text-white" />
              </div>
            </Link>
            <Link 
              href="/dashboard" 
              className="px-8 py-4 text-base font-semibold bg-surface border border-white/5 hover:bg-raised text-foreground rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              View Dashboard
            </Link>
          </motion.div>
        </motion.section>

        {/* Feature Grid MVP */}
        <motion.section 
          id="features"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 grid md:grid-cols-3 gap-6 max-w-5xl scroll-mt-28"
        >
          {[
            { tag: "Structure", title: "Organize Everything", icon: Layers, desc: "Create nested vaults, study sets, and notes seamlessly linked together." },
            { tag: "Recall", title: "Active Learning", icon: BookOpen, desc: "Built-in SM-2 spaced repetition engine tracks your mastery on every single card." },
            { tag: "Intelligence", title: "AI Generation", icon: Sparkles, desc: "Upload any PDF or paste text to auto-generate beautiful flashcard decks instantly." }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-accent/30 transition-colors flex flex-col group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-background flex items-center justify-center mb-6 shadow-inner relative z-10 border border-white/5 group-hover:border-accent/20 transition-colors">
                <feature.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">{feature.title}</h3>
              <p className="text-muted leading-relaxed relative z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* The Method Section */}
        <motion.section
          id="method"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 max-w-5xl mt-32 text-center scroll-mt-28"
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">The Spaced Repetition Method</motion.h2>
          <motion.p variants={fadeUp} className="text-muted text-lg max-w-2xl mx-auto mb-16">
            EduVault uses the scientifically proven SM-2 algorithm. Reviewing material at optimally spaced intervals guarantees that you remember things for years instead of days.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
             {[
               { no: "1", title: "Create Content", desc: "Build dynamic, rich flashcards with full markdown support." },
               { no: "2", title: "Rate Difficulty", desc: "During a session, rate how easily you recalled the answer." },
               { no: "3", title: "Automated Rescheduling", desc: "Hard concepts reappear sooner, while easy ones are pushed further out." }
             ].map((step, i) => (
               <motion.div key={i} variants={fadeUp} className="bg-surface border border-white/5 p-8 rounded-3xl relative">
                 <div className="text-6xl font-bold text-white/5 absolute -top-4 -right-2 tracking-tighter">{step.no}</div>
                 <h3 className="text-xl font-bold mb-3 mt-4 relative z-10">{step.title}</h3>
                 <p className="text-muted relative z-10">{step.desc}</p>
               </motion.div>
             ))}
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          id="pricing"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 max-w-3xl mt-32 text-center mb-16 scroll-mt-28"
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">Simple Pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-muted text-lg mb-12">Start building your optimal vault today.</motion.p>
          
          <motion.div variants={fadeUp} className="bg-surface border border-accent/30 rounded-3xl p-10 max-w-md mx-auto shadow-[0_0_40px_rgba(108,99,255,0.1)] relative">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">BETA ACCESS</div>
            <h3 className="text-2xl font-bold mb-2">Free Beta</h3>
            <div className="text-5xl font-extrabold mb-6">$0<span className="text-lg text-muted font-medium">/forever</span></div>
            <ul className="text-left space-y-4 mb-8">
              {['Unlimited Vaults', 'Spaced Repetition Engine', 'Cross-Device Sync', 'Advanced Analytics'].map(feature => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-mint/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-brand-mint" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full py-4 bg-accent hover:bg-accent-hover rounded-xl text-white font-semibold transition-colors">Claim Free Account</Link>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
