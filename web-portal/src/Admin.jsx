import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const [keys, setKeys] = useState([])
  const [todayCount, setTodayCount] = useState(0)
  const [search, setSearch] = useState('')

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.keys) {
        setKeys(data.keys)
        setTodayCount(data.todayCount || 0)
      }
    } catch {}
  }, [password])

  const handleLogin = async () => {
    setLoginError(null)
    if (!password) {
      setLoginError('Please enter the admin password.')
      return
    }
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setLoggedIn(true)
        fetchKeys()
      } else {
        setLoginError('Invalid admin password.')
      }
    } catch {
      setLoginError('Could not connect to server.')
    }
  }

  const handleDelete = async (key) => {
    if (!confirm(`Delete key ${key}?`)) return
    try {
      const res = await fetch('/api/admin/keys/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, key }),
      })
      if ((await res.json()).success) fetchKeys()
    } catch {}
  }

  const handleGenerate = async () => {
    try {
      const res = await fetch('/api/admin/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, count: 5 }),
      })
      const data = await res.json()
      if (data.keys) {
        alert(`Generated ${data.keys.length} keys!`)
        fetchKeys()
      }
    } catch {}
  }

  const filteredKeys = keys.filter(k =>
    k.key.toLowerCase().includes(search.toLowerCase())
  )

  if (!loggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-8 space-y-8 max-w-lg mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-zinc-500 mt-2">Manage launcher keys</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-zinc-900 rounded-2xl border border-white/5 p-8 space-y-4"
          style={{ boxShadow: '0 0 20px rgba(34,197,94,0.15)' }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3"
            >
              <LockIcon />
            </motion.div>
            <p className="text-sm text-zinc-300 font-medium">Admin Authentication</p>
            <p className="text-xs text-zinc-500 mt-1">Enter the admin password to manage keys</p>
          </div>
          <div className="relative">
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Admin password"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-white/5 bg-zinc-950 text-white outline-none transition-all placeholder-zinc-600 focus:border-green-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/25 text-white font-bold transition-all text-sm uppercase tracking-wider"
          >
            Login
          </motion.button>
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/20"
              >
                <p className="text-sm text-red-400 font-medium">{loginError}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-8 space-y-8 max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
        <p className="text-sm text-zinc-500 mt-2">Manage launcher keys</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <StatCard label="Total Keys" value={keys.length} delay={0.15} />
        <StatCard label="Generated Today" value={todayCount} delay={0.2} />
        <StatCard label="Server Status" value="Online" green delay={0.25} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
        className="bg-zinc-900 rounded-2xl border border-white/5 p-6 flex items-center justify-between"
      >
        <div>
          <p className="text-white font-bold">Generate Keys</p>
          <p className="text-xs text-zinc-500 mt-0.5">Create multiple keys at once</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/25 text-white font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <PlusIcon />
          Generate 5 Keys
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <p className="text-white font-bold">All Keys</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys..."
              className="px-3 py-2 rounded-lg border border-white/5 bg-zinc-950 text-white text-xs outline-none focus:border-green-500/50 w-48 placeholder-zinc-600"
            />
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
              onClick={fetchKeys}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <RefreshIcon />
            </motion.button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Key</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Nickname</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Created</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-zinc-600 py-8 text-sm">No keys found</td>
                  </tr>
                ) : (
                  filteredKeys.map((k, i) => (
                    <motion.tr
                      key={k.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{k.key}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{k.nickname || '--'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {k.created ? new Date(k.created).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(k.key)}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors font-medium"
                        >
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
          <motion.span
            key={keys.length}
            initial={{ scale: 1.5, color: '#4ade80' }}
            animate={{ scale: 1, color: '#71717a' }}
            transition={{ duration: 0.5 }}
          >
            {keys.length} keys total
          </motion.span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={fetchKeys}
            className="text-green-400 hover:text-green-300 transition-colors font-medium"
          >
            Refresh
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ label, value, green, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/20 rounded-xl p-4`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-green-400 mb-1">{label}</p>
      {green ? (
        <p className="text-lg font-bold text-white flex items-center gap-2 mt-1">
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-400 inline-block"
          />
          {value}
        </p>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="text-2xl font-bold text-white"
        >
          {value}
        </motion.p>
      )}
    </motion.div>
  )
}

function LockIcon() {
  return (
    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}
