'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDialKit } from 'dialkit'

export default function SpringModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [replayCount, setReplayCount] = useState(0)

  const vals = useDialKit(
    'Spring Modal',
    {
      spring: { type: 'spring' as const, visualDuration: 0.35, bounce: 0.3 },
      overlayOpacity: [0, 1, 0.5] as [number, number, number],
      borderRadius: [0, 48, 16] as [number, number, number],
      replay: { type: 'action' as const, label: 'Replay entrance' },
    },
    {
      onAction: (action) => {
        if (action === 'replay') {
          setIsOpen(true)
          setReplayCount((c) => c + 1)
        }
      },
    },
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spring = vals.spring as any

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 24px',
          fontSize: 15,
          borderRadius: 8,
          border: '1px solid #ddd',
          cursor: 'pointer',
          background: '#111',
          color: '#fff',
        }}
      >
        Open Modal
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: vals.overlayOpacity as number }}
              exit={{ opacity: 0 }}
              transition={spring}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'black',
                zIndex: 40,
              }}
            />

            {/* Centering container — animated for entrance/exit/replay */}
            <motion.div
              key={`modal-${replayCount}`}
              initial={{ opacity: 0, scale: 0.88, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 28 }}
              transition={spring}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  pointerEvents: 'all',
                  background: '#fff',
                  padding: '32px',
                  borderRadius: vals.borderRadius as number,
                  width: 420,
                  maxWidth: '90vw',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                }}
              >
                <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Spring Modal</h2>
                <p style={{ margin: '0 0 24px', color: '#555', fontSize: 14 }}>
                  Use the DialKit panel to tune the entrance spring, overlay opacity,
                  border radius, and replay the animation.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
