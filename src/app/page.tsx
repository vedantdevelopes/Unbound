'use client';

import Link from "next/link";
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="page-wrapper relative overflow-hidden">
      {/* Background illustration */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.4,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           style={{
             width: '800px',
             height: '800px',
             background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(220,229,240,0.2) 50%, rgba(255,255,255,0) 70%)',
             filter: 'blur(40px)'
           }}
         />
      </div>

      <motion.header 
        className="header z-[10] relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <Link href="/create" className="btn-secondary">
          CREATE A LIBRARY
        </Link>
      </motion.header>

      <div className="hero-main z-[10] relative">
        <motion.h1 
          className="hero-title font-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          write stories <br/> for every moment
        </motion.h1>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
        >
          <Link href="/create" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
            CREATE A LIBRARY <span style={{ marginLeft: '10px' }}>&rarr;</span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
