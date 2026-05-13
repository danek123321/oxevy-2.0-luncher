import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Generator() {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    if (!nickname.trim()) {
      setError('Please enter a nickname.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/get-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() })
      })
      const data = await res.json()
      if (data.key) setResult(data)
      else setError(data.error || 'Error generating key.')
    } catch {
      setError('Could not connect to server.')
    }
    setLoading(false)
  }

  return (
    <div className="p-8 space-y-8 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white">Key Generator</h1>
        <p className="text-sm text-zinc-500 mt-2">Get a free key for the Oxevy Launcher</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-zinc-900 rounded-2xl border border-white/5 p-8 space-y-6"
        style={{ boxShadow: '0 0 20px rgba(34,197,94,0.15)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3"
            >
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </motion.div>
            <p className="text-sm text-zinc-300 font-medium">Free Key Generation</p>
            <p className="text-xs text-zinc-500 mt-1">Enter a nickname to get your key instantly</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider block mb-2">Nickname</label>
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full px-4 py-3 rounded-xl border border-white/5 bg-zinc-950 text-white outline-none transition-all placeholder-zinc-600 focus:border-green-500/50"
              required
              maxLength={32}
            />
          </div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/25 text-white font-bold transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </motion.svg>
                Generating...
              </>
            ) : (
              <>
                <KeyIcon />
                Generate Key
              </>
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="text-center p-4 rounded-xl bg-green-500/5 border border-green-500/20 space-y-2 overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-2 h-2 rounded-full bg-green-400"
                />
                <p className="text-xs text-green-400 font-medium uppercase tracking-wider">Key Generated for {result.nickname}</p>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-lg font-bold text-white font-mono tracking-wider select-all"
              >
                {result.key}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="text-xs text-zinc-500"
              >
                Copy this key and paste it into the launcher
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/20 overflow-hidden"
            >
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function KeyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  )
}
