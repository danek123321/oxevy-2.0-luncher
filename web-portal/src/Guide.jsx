import React from 'react'
import { motion } from 'framer-motion'

const steps = [
  { num: 1, title: 'Enter a Nickname', desc: 'Type any nickname you want to use in the launcher.', icon: '01' },
  { num: 2, title: 'Generate Your Key', desc: 'Click the generate button. A unique key will be created and linked to your nickname.', icon: '02' },
  { num: 3, title: 'Copy the Key', desc: 'Your key appears on screen. Copy it — you will need it in the launcher.', icon: '03' },
  { num: 4, title: 'Open the Launcher', desc: 'Launch Oxevy Launcher on your PC and enter the same nickname.', icon: '04' },
  { num: 5, title: 'Paste Key & Login', desc: 'Paste the key you copied from the website, then click Login.', icon: '05' },
  { num: 6, title: 'Start Playing', desc: 'You are in! Select your Minecraft version and click Launch.', icon: '06' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const itemAnim = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
}

export default function Guide() {
  return (
    <div className="p-8 space-y-8 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white">How to Use</h1>
        <p className="text-sm text-zinc-500 mt-2">Follow these steps to get started with Oxevy Launcher</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            variants={itemAnim}
            whileHover={{ scale: 1.02, x: 4 }}
            className="bg-zinc-900 rounded-2xl border border-white/5 p-5 flex items-start gap-4 transition-colors hover:border-green-500/20 group"
            style={{ boxShadow: i === 0 ? '0 0 15px rgba(34,197,94,0.1)' : undefined }}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20"
            >
              <span className="text-white font-bold text-sm">{step.icon}</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{step.title}</h3>
              <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-xs text-zinc-600 font-mono mt-1"
            >
              {String(step.num).padStart(2, '0')}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
