import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '' })
    })
      .then(r => r.json())
      .then(d => { if (d.keys) setStats({ total: d.keys.length, today: d.todayCount }) })
      .catch(() => {})
  }, [])

  return (
    <div className="p-8 space-y-8 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-2">Oxevy Launcher Key Portal</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-zinc-900 rounded-2xl border border-white/5 p-8 space-y-6"
        style={{ boxShadow: '0 0 20px rgba(34,197,94,0.15)' }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20"
          >
            <span className="text-white font-bold text-2xl">O</span>
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-1 font-dynapuff">Welcome to Oxevy</h2>
          <p className="text-sm text-zinc-500">Generate a free key to access the launcher</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Keys', value: stats?.total ?? '--', delay: 0.3 },
            { label: 'Generated Today', value: stats?.today ?? '--', delay: 0.35 },
            { label: 'Server Status', value: 'Online', green: true, delay: 0.4 },
            { label: 'Version', value: '1.0.0', delay: 0.45 },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: item.delay }}
              className={`bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/20 rounded-xl p-4`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-green-400 mb-1">{item.label}</p>
              {item.green ? (
                <p className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-400 inline-block"
                  />
                  {item.value}
                </p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: item.delay + 0.2 }}
                  className="text-2xl font-bold text-white"
                >
                  {item.value}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-zinc-900 rounded-2xl border border-white/5 p-6 space-y-4"
      >
        <h3 className="text-white font-bold">Quick Links</h3>
        <div className="space-y-2">
          {[
            { label: 'Generate a Key', desc: 'Get your free key to access the launcher', color: 'green' },
            { label: 'How to Use', desc: 'Step-by-step guide for the launcher', color: 'zinc' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-green-500/20 transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 flex items-center justify-center`}>
                <div className={`w-4 h-4 rounded-full bg-${item.color}-400`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
