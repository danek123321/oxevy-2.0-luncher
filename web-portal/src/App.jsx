import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Generator from './Generator'
import Admin from './Admin'
import Home from './Home'
import Guide from './Guide'
import LiveBackground from './LiveBackground'

const navItems = [
  { id: 'home', icon: HomeIcon, label: 'Home' },
  { id: 'generator', icon: KeyIcon, label: 'Generator' },
  { id: 'guide', icon: GuideIcon, label: 'Guide' },
  { id: 'admin', icon: AdminIcon, label: 'Admin' },
]

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <>
      <LiveBackground />

      <div className="flex h-screen text-zinc-300 overflow-hidden relative z-10">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="w-20 bg-zinc-950/80 backdrop-blur-xl flex flex-col items-center py-6 border-r border-white/5 gap-2"
        >
          <motion.div
            className="mb-8"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-white font-bold text-lg font-dynapuff">O</span>
            </div>
          </motion.div>

          {navItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 transition-all duration-200 rounded-xl w-14 h-14 flex items-center justify-center ${
                activeTab === item.id
                  ? 'text-green-400 bg-green-500/10 shadow-lg shadow-green-500/10 border border-green-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <item.icon />
            </motion.button>
          ))}

          <div className="mt-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-14 h-14 mx-auto rounded-xl overflow-hidden border-2 border-white/10 bg-zinc-800 flex items-center justify-center"
            >
              <UserIcon />
            </motion.div>
            <p className="text-[10px] text-zinc-500 text-center mt-1 truncate w-16 mx-auto">Guest</p>
          </div>
        </motion.div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
            className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-950/30 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase font-dynapuff">Oxevy Launcher</span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-medium text-green-400"
              >
                online
              </motion.span>
            </div>
          </motion.div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <Home />
                </motion.div>
              )}
              {activeTab === 'generator' && (
                <motion.div key="generator" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <Generator />
                </motion.div>
              )}
              {activeTab === 'guide' && (
                <motion.div key="guide" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <Guide />
                </motion.div>
              )}
              {activeTab === 'admin' && (
                <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <Admin />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  )
}

function GuideIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
