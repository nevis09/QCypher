'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { updateProfile, updateBusinessName } from '@/lib/actions/account'
import { User, Phone, Mail, MapPin, Check, Pencil, Search, Building2 } from 'lucide-react'

type Props = {
  initial: {
    legal_name:    string | null
    nickname:      string | null
    phone:         string | null
    street:        string | null
    city:          string | null
    state:         string | null
    zip:           string | null
    email:         string
    business_name: string | null
  }
}

type SimpleKey = 'legal_name' | 'nickname' | 'phone' | 'business_name'

const SIMPLE_FIELDS: {
  key: SimpleKey; label: string; icon: React.ElementType
  placeholder: string; color: string; bg: string
}[] = [
  { key: 'business_name', label: 'Business name', icon: Building2, placeholder: 'Your business name', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  { key: 'legal_name',    label: 'Legal name',    icon: User,      placeholder: 'Your full legal name', color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
  { key: 'phone',         label: 'Phone',         icon: Phone,     placeholder: '+1 (555) 000-0000',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
]

type NominatimResult = {
  display_name: string
  address: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
  }
}

export function ProfileForm({ initial }: Props) {
  const [form, setForm] = useState({
    business_name: initial.business_name ?? '',
    legal_name:    initial.legal_name    ?? '',
    nickname:      initial.nickname      ?? '',
    phone:         initial.phone         ?? '',
    street:        initial.street        ?? '',
    city:          initial.city          ?? '',
    state:         initial.state         ?? '',
    zip:           initial.zip           ?? '',
  })

  const [editing, setEditing] = useState<SimpleKey | 'address' | null>(null)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState<string | null>(null)

  // Street autocomplete state
  const [suggestions,    setSuggestions]    = useState<NominatimResult[]>([])
  const [suggOpen,       setSuggOpen]       = useState(false)
  const [suggLoading,    setSuggLoading]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streetRef   = useRef<HTMLInputElement>(null)

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 4) { setSuggestions([]); setSuggOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setSuggLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&countrycodes=us&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setSuggOpen(data.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setSuggLoading(false)
      }
    }, 350)
  }, [])

  function pickSuggestion(r: NominatimResult) {
    const a = r.address
    const streetParts = [a.house_number, a.road].filter(Boolean).join(' ')
    setForm(f => ({
      ...f,
      street: streetParts || f.street,
      city:   a.city ?? a.town ?? a.village ?? f.city,
      state:  a.state ?? f.state,
      zip:    a.postcode ?? f.zip,
    }))
    setSuggestions([])
    setSuggOpen(false)
  }

  // Close suggestions on outside click
  const wrapperRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSuggOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function saveField(key: string, value: Record<string, string>) {
    setSaving(true)
    try {
      if (key === 'business_name') {
        await updateBusinessName(value.business_name)
      } else {
        await updateProfile(value)
      }
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } finally {
      setSaving(false)
      setEditing(null)
    }
  }

  const addressFilled = form.street || form.city || form.state || form.zip
  const addressDisplay = [form.street, form.city, form.state, form.zip].filter(Boolean).join(', ')

  return (
    <div className="space-y-3">

      {/* Simple fields */}
      {SIMPLE_FIELDS.map(({ key, label, icon: Icon, placeholder, color, bg }) => {
        const isEditing = editing === key
        const isSaved   = saved === key

        return (
          <div key={key}
            className="rounded-2xl border transition-all"
            style={{
              borderColor: isEditing ? color : 'hsl(var(--border))',
              background:  'hsl(var(--card))',
              boxShadow:   isEditing ? `0 0 0 3px ${bg}` : 'none',
            }}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <Icon style={{ width: '15px', height: '15px', color }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</p>
                {isEditing ? (
                  <input autoFocus value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-[15px] outline-none"
                    style={{ color: 'hsl(var(--foreground))' }} />
                ) : (
                  <p className="text-[15px] truncate" style={{
                    color:      form[key] ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    fontStyle:  form[key] ? 'normal' : 'italic',
                  }}>
                    {form[key] || placeholder}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button onClick={() => setEditing(null)}
                      className="text-[15px] font-semibold px-2.5 py-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                      style={{ color: 'hsl(var(--muted-foreground))' }}>Cancel</button>
                    <button disabled={saving}
                      onClick={() => saveField(key, { [key]: form[key] })}
                      className="flex items-center gap-1 text-[15px] font-bold px-3 py-1 rounded-lg text-white disabled:opacity-60"
                      style={{ background: color }}>
                      {saving ? '…' : <><Check style={{ width: '11px', height: '11px' }} /> Save</>}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(key)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors">
                    {isSaved
                      ? <Check  style={{ width: '13px', height: '13px', color: '#10b981' }} />
                      : <Pencil style={{ width: '13px', height: '13px', color: 'hsl(var(--muted-foreground))' }} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Email — read-only */}
      <div className="rounded-2xl border"
        style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.10)' }}>
            <Mail style={{ width: '15px', height: '15px', color: '#10b981' }} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: 'hsl(var(--muted-foreground))' }}>Email</p>
            <p className="text-[15px] font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>
              {initial.email}
            </p>
          </div>
          <span className="text-[15px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            Verified
          </span>
        </div>
      </div>

      {/* Address — expanded card */}
      <div className="rounded-2xl border transition-all"
        style={{
          borderColor: editing === 'address' ? '#f97316' : 'hsl(var(--border))',
          background:  'hsl(var(--card))',
          boxShadow:   editing === 'address' ? '0 0 0 3px rgba(249,115,22,0.10)' : 'none',
        }}>

        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(249,115,22,0.10)' }}>
            <MapPin style={{ width: '15px', height: '15px', color: '#f97316' }} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: 'hsl(var(--muted-foreground))' }}>Address</p>
            <p className="text-[15px] truncate" style={{
              color:     addressFilled ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              fontStyle: addressFilled ? 'normal' : 'italic',
            }}>
              {addressFilled ? addressDisplay : 'Business / mailing address'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {editing === 'address' ? (
              <>
                <button onClick={() => setEditing(null)}
                  className="text-[15px] font-semibold px-2.5 py-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>Cancel</button>
                <button disabled={saving}
                  onClick={() => saveField('address', {
                    street: form.street, city: form.city, state: form.state, zip: form.zip,
                  })}
                  className="flex items-center gap-1 text-[15px] font-bold px-3 py-1 rounded-lg text-white disabled:opacity-60"
                  style={{ background: '#f97316' }}>
                  {saving ? '…' : <><Check style={{ width: '11px', height: '11px' }} /> Save</>}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing('address')}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors">
                {saved === 'address'
                  ? <Check  style={{ width: '13px', height: '13px', color: '#10b981' }} />
                  : <Pencil style={{ width: '13px', height: '13px', color: 'hsl(var(--muted-foreground))' }} />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded edit fields */}
        {editing === 'address' && (
          <div className="border-t px-4 pb-4 pt-3 space-y-3"
            style={{ borderColor: 'hsl(var(--border))' }}>

            {/* Street with autocomplete */}
            <div ref={wrapperRef} className="relative">
              <label className="text-[15px] font-bold uppercase tracking-widest block mb-1.5"
                style={{ color: 'hsl(var(--muted-foreground))' }}>Street address</label>
              <div className="relative">
                <input
                  ref={streetRef}
                  value={form.street}
                  onChange={e => {
                    setForm(f => ({ ...f, street: e.target.value }))
                    fetchSuggestions(e.target.value)
                  }}
                  onFocus={() => suggestions.length > 0 && setSuggOpen(true)}
                  placeholder="123 Main St"
                  autoComplete="off"
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border text-[15px] outline-none"
                  style={{
                    background:  'hsl(var(--muted))',
                    borderColor: 'hsl(var(--border))',
                    color:       'hsl(var(--foreground))',
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {suggLoading
                    ? <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                        style={{ borderColor: '#f97316', borderTopColor: 'transparent' }} />
                    : <Search style={{ width: '13px', height: '13px', color: 'hsl(var(--muted-foreground))' }} />}
                </div>
              </div>

              {/* Suggestions dropdown */}
              {suggOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border z-50 overflow-hidden"
                  style={{
                    background:  'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    boxShadow:   '0 8px 24px rgba(0,0,0,0.12)',
                  }}>
                  {suggestions.map((r, i) => (
                    <button key={i} type="button"
                      onMouseDown={e => { e.preventDefault(); pickSuggestion(r) }}
                      className="w-full text-left px-4 py-2.5 text-[15px] hover:bg-[hsl(var(--muted))] transition-colors border-b last:border-0"
                      style={{ color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}>
                      <span className="font-semibold block truncate">
                        {[r.address.house_number, r.address.road].filter(Boolean).join(' ') || r.display_name.split(',')[0]}
                      </span>
                      <span className="block truncate mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {r.display_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City / State / Zip row */}
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-2">
                <label className="text-[15px] font-bold uppercase tracking-widest block mb-1.5"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>City</label>
                <input value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="City"
                  autoComplete="address-level2"
                  className="w-full px-3 py-2.5 rounded-xl border text-[15px] outline-none"
                  style={{
                    background:  'hsl(var(--muted))',
                    borderColor: 'hsl(var(--border))',
                    color:       'hsl(var(--foreground))',
                  }} />
              </div>
              <div className="col-span-2">
                <label className="text-[15px] font-bold uppercase tracking-widest block mb-1.5"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>State</label>
                <input value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  placeholder="State"
                  autoComplete="address-level1"
                  className="w-full px-3 py-2.5 rounded-xl border text-[15px] outline-none"
                  style={{
                    background:  'hsl(var(--muted))',
                    borderColor: 'hsl(var(--border))',
                    color:       'hsl(var(--foreground))',
                  }} />
              </div>
              <div className="col-span-1">
                <label className="text-[15px] font-bold uppercase tracking-widest block mb-1.5"
                  style={{ color: 'hsl(var(--muted-foreground))' }}>Zip</label>
                <input value={form.zip}
                  onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                  placeholder="00000"
                  maxLength={10}
                  autoComplete="postal-code"
                  className="w-full px-3 py-2.5 rounded-xl border text-[15px] outline-none"
                  style={{
                    background:  'hsl(var(--muted))',
                    borderColor: 'hsl(var(--border))',
                    color:       'hsl(var(--foreground))',
                  }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
