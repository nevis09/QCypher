'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const INPUT: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(74,157,181,0.28)',
  borderRadius: '12px',
  padding: '11px 40px 11px 14px',
  fontSize: '15px',
  color: '#e8f0fa',
  outline: 'none',
}

export function PasswordInput({
  id, value, onChange, placeholder, required,
}: {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={INPUT}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(148,180,220,0.65)',
        }}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}
