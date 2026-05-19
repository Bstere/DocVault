import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

/* ═══════════════════════════════════════════════════════════
   HOLY FAMILY UNIVERSITY — AI TEACHING HUB
   Document Management & Embed Platform
   ═══════════════════════════════════════════════════════════ */

const BRAND = {
  primary: '#1A6FB5',
  primaryLight: '#37A2E1',
  primaryDark: '#0D4F82',
  primaryMuted: 'rgba(55, 162, 225, 0.08)',
  primaryBorder: 'rgba(55, 162, 225, 0.2)',
  accent: '#E8A838',
  accentMuted: 'rgba(232, 168, 56, 0.1)',
  bg: '#F8F9FC',
  bgWhite: '#FFFFFF',
  bgDark: '#0D1B2A',
  bgSidebar: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgInput: '#F3F5F9',
  text: '#1A1A2E',
  textSecondary: '#5A6478',
  textMuted: '#8B95A8',
  border: '#E8EBF0',
  borderLight: '#F0F2F6',
  danger: '#DC3545',
  dangerMuted: 'rgba(220, 53, 69, 0.08)',
  success: '#28A745',
  successMuted: 'rgba(40, 167, 69, 0.08)',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
  shadowLg: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
  shadowHover: '0 8px 24px rgba(26, 111, 181, 0.12)',
  radius: '8px',
  radiusLg: '12px',
  radiusXl: '16px',
}

const SUPABASE_URL = 'https://oguvjvdoirfwexnhkqnf.supabase.co'
const SUPABASE_KEY = 'sb_publishable_vvvryO7vRZaml_870oaJyQ_n9pEmNAw'

/* ───────────── INJECT GLOBAL STYLES ───────────── */
if (typeof document !== 'undefined' && !document.getElementById('hfu-styles')) {
  const s = document.createElement('style')
  s.id = 'hfu-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #root { height: 100%; }
    body { background:${BRAND.bg}; font-family:'DM Sans',Arial,sans-serif; color:${BRAND.text}; -webkit-font-smoothing:antialiased; }
    ::selection { background:${BRAND.primaryLight}; color:white; }
    ::-webkit-scrollbar { width:6px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:${BRAND.border}; border-radius:3px; }
    ::-webkit-scrollbar-thumb:hover { background:${BRAND.textMuted}; }
    input:focus, select:focus, textarea:focus { outline:none; border-color:${BRAND.primaryLight} !important; box-shadow: 0 0 0 3px ${BRAND.primaryMuted} !important; }
    button { cursor:pointer; transition: all 0.2s ease; }
    button:active { transform: scale(0.98); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes slideRight { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }
    .fade-up { animation: fadeUp 0.4s ease both; }
    .fade-in { animation: fadeIn 0.3s ease both; }
    .slide-right { animation: slideRight 0.3s ease both; }
    .scale-in { animation: scaleIn 0.25s ease both; }
  `
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════ */
export default function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setPage('dashboard')
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') { setPage('reset'); return }
      if (session) setPage('dashboard')
      else setPage('login')
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:BRAND.bg }}>
      <div style={{ width:40, height:40, border:`3px solid ${BRAND.border}`, borderTopColor:BRAND.primaryLight, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <p style={{ color:BRAND.textMuted, marginTop:16, fontSize:14 }}>Loading AI Teaching Hub...</p>
    </div>
  )

  if (page === 'forgot') return <ForgotPasswordPage onBack={() => setPage('login')} />
  if (page === 'reset') return <ResetPasswordPage onDone={() => setPage('login')} />
  if (page === 'dashboard' && session) return <Dashboard session={session} onLogout={async () => { await supabase.auth.signOut(); setSession(null); setPage('login') }} />
  return <LoginPage onForgot={() => setPage('forgot')} />
}

/* ═══════════════════════════════════════
   AUTH: HFU CREST + LOGIN
   ═══════════════════════════════════════ */
function HFUCrest({ size = 48 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size/4, background:`linear-gradient(135deg, ${BRAND.primaryDark}, ${BRAND.primaryLight})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 16px rgba(26,111,181,0.3)` }}>
      <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
        <path d="M2 17L12 22L22 17"/>
        <path d="M2 12L12 17L22 12"/>
      </svg>
    </div>
  )
}

function LoginPage({ onForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) return setError('Please fill in all fields')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex' }}>
      {/* Left panel — branding */}
      <div style={{ flex:1, background:`linear-gradient(160deg, ${BRAND.bgDark} 0%, ${BRAND.primaryDark} 100%)`, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:60, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, opacity:0.04, backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize:'60px 60px, 40px 40px' }} />
        <div className="fade-up" style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:420 }}>
          <HFUCrest size={72} />
          <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:36, fontWeight:600, color:'white', marginTop:28, lineHeight:1.2 }}>Holy Family<br/>University</h1>
          <div style={{ width:48, height:2, background:BRAND.accent, margin:'20px auto', borderRadius:1 }} />
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.7)', fontWeight:300, lineHeight:1.6 }}>AI Teaching Hub</p>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginTop:12, lineHeight:1.6 }}>Manage and distribute your educational resources with a secure, embeddable document platform.</p>
        </div>
      </div>
      {/* Right panel — form */}
      <div style={{ width:480, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 56px', background:BRAND.bgWhite }}>
        <div className="fade-up">
          <h2 style={{ fontSize:24, fontWeight:600, marginBottom:6 }}>Welcome back</h2>
          <p style={{ color:BRAND.textSecondary, fontSize:14, marginBottom:32 }}>Sign in to the AI Teaching Hub dashboard</p>
          {error && <div style={S.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={S.label}>Email address</label>
            <input style={S.input} type="email" placeholder="you@holyfamily.edu" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
              <button type="button" onClick={onForgot} style={S.linkBtn}>Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} style={S.primaryBtn}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   AUTH: FORGOT PASSWORD
   ═══════════════════════════════════════ */
function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email) return setError('Please enter your email')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:BRAND.bg }}>
      <div className="fade-up" style={{ width:420, maxWidth:'90vw' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <HFUCrest size={56} />
          <h2 style={{ fontSize:22, fontWeight:600, marginTop:16 }}>Reset your password</h2>
          <p style={{ color:BRAND.textSecondary, fontSize:14, marginTop:4 }}>We'll send you a link to reset it</p>
        </div>
        <div style={S.formCard}>
          {sent ? (
            <div style={{ textAlign:'center', padding:12 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:BRAND.successMuted, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:22, color:BRAND.success }}>✓</div>
              <p style={{ color:BRAND.textSecondary, fontSize:14, marginBottom:20 }}>Reset link sent to <strong style={{ color:BRAND.text }}>{email}</strong></p>
              <button onClick={onBack} style={S.secondaryBtn}>Back to sign in</button>
            </div>
          ) : (
            <>
              {error && <div style={S.errorBox}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <label style={S.label}>Email address</label>
                <input style={S.input} type="email" placeholder="you@holyfamily.edu" value={email} onChange={e => setEmail(e.target.value)} />
                <button type="submit" disabled={loading} style={{ ...S.primaryBtn, marginBottom:12 }}>{loading ? 'Sending...' : 'Send reset link'}</button>
              </form>
              <button onClick={onBack} style={{ ...S.secondaryBtn, width:'100%' }}>Back to sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   AUTH: RESET PASSWORD
   ═══════════════════════════════════════ */
function ResetPasswordPage({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!password) return setError('Please enter a new password')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError("Passwords don't match")
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) setError(err.message)
    else setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:BRAND.bg }}>
      <div className="fade-up" style={{ textAlign:'center', maxWidth:400, padding:20 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:BRAND.successMuted, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:22, color:BRAND.success }}>✓</div>
        <h2 style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>Password updated</h2>
        <p style={{ color:BRAND.textSecondary, fontSize:14, marginBottom:24 }}>You can now sign in with your new password</p>
        <button onClick={onDone} style={S.secondaryBtn}>Back to sign in</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:BRAND.bg }}>
      <div className="fade-up" style={{ width:420, maxWidth:'90vw' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <HFUCrest size={56} />
          <h2 style={{ fontSize:22, fontWeight:600, marginTop:16 }}>Set new password</h2>
        </div>
        <div style={S.formCard}>
          {error && <div style={S.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={S.label}>New password</label>
            <input style={S.input} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            <label style={S.label}>Confirm new password</label>
            <input style={S.input} type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
            <button type="submit" disabled={loading} style={S.primaryBtn}>{loading ? 'Updating...' : 'Update password'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════ */
function Dashboard({ session, onLogout }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [documents, setDocuments] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)

  const fetchAll = useCallback(async () => {
    const [cats, subs, docs] = await Promise.all([
      supabase.from('categories').select('*').order('created_at'),
      supabase.from('subcategories').select('*').order('created_at'),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
    ])
    setCategories(cats.data || [])
    setSubcategories(subs.data || [])
    setDocuments(docs.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const filteredDocs = documents.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !search || d.name.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q)
    const matchCat = !selectedCat || d.category_id === selectedCat
    const matchSub = !selectedSub || d.subcategory_id === selectedSub
    return matchSearch && matchCat && matchSub
  })

  const getCatName = (id) => categories.find(c => c.id === id)?.name || ''
  const getSubName = (id) => subcategories.find(s => s.id === id)?.name || ''
  const docCount = (catId) => documents.filter(d => d.category_id === catId).length

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:BRAND.bg }}>
      <div style={{ width:40, height:40, border:`3px solid ${BRAND.border}`, borderTopColor:BRAND.primaryLight, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', background:BRAND.bg }}>
      {/* ── SIDEBAR ── */}
      <div style={{ width:272, background:BRAND.bgSidebar, borderRight:`1px solid ${BRAND.border}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
        {/* Sidebar header */}
        <div style={{ padding:'20px 20px 16px', borderBottom:`1px solid ${BRAND.borderLight}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <HFUCrest size={36} />
            <div>
              <div style={{ fontWeight:600, fontSize:14, lineHeight:1.2 }}>AI Teaching Hub</div>
              <div style={{ fontSize:11, color:BRAND.textMuted, marginTop:2 }}>Holy Family University</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflow:'auto', padding:'12px 10px' }}>
          <button onClick={() => setModal({ type:'category' })} style={{ width:'100%', padding:'9px 12px', background:BRAND.primaryMuted, color:BRAND.primary, border:`1px dashed ${BRAND.primaryBorder}`, borderRadius:BRAND.radius, fontSize:13, fontWeight:500, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16, lineHeight:1 }}>+</span> New collection
          </button>

          <NavItem label="All resources" icon="📚" active={!selectedCat} count={documents.length} onClick={() => { setSelectedCat(null); setSelectedSub(null) }} />

          {categories.map(cat => (
            <div key={cat.id}>
              <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                <NavItem label={cat.name} icon="📁" active={selectedCat === cat.id && !selectedSub} count={docCount(cat.id)}
                  onClick={() => { setSelectedCat(cat.id); setSelectedSub(null) }} style={{ flex:1 }} />
                <button onClick={() => setModal({ type:'subcategory', data:{ category_id:cat.id } })} style={S.iconBtnSm} title="Add subcollection">+</button>
                <button onClick={async () => { if(confirm('Delete this collection?')) { await supabase.from('categories').delete().eq('id', cat.id); fetchAll(); showToast('Collection deleted'); if(selectedCat===cat.id){setSelectedCat(null);setSelectedSub(null)} }}} style={S.iconBtnSm} title="Delete">×</button>
              </div>
              {selectedCat === cat.id && subcategories.filter(s => s.category_id === cat.id).map(sub => (
                <div key={sub.id} style={{ display:'flex', alignItems:'center', gap:2 }}>
                  <NavItem label={sub.name} icon="└" active={selectedSub === sub.id} indent
                    count={documents.filter(d => d.subcategory_id === sub.id).length}
                    onClick={() => setSelectedSub(sub.id)} style={{ flex:1 }} />
                  <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('subcategories').delete().eq('id', sub.id); fetchAll(); showToast('Deleted'); if(selectedSub===sub.id) setSelectedSub(null) }}} style={S.iconBtnSm}>×</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 16px', borderTop:`1px solid ${BRAND.borderLight}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:12, color:BRAND.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{session.user.email}</div>
          <button onClick={onLogout} style={{ background:'none', border:'none', color:BRAND.danger, fontSize:12, fontWeight:500 }}>Sign out</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <div style={{ padding:'16px 32px', background:BRAND.bgWhite, borderBottom:`1px solid ${BRAND.border}`, display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
          <div style={{ position:'relative', flex:1, maxWidth:400 }}>
            <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:BRAND.textMuted }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input style={{ ...S.input, paddingLeft:38, marginBottom:0 }} placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
            <button onClick={() => setModal({ type:'embed' })} style={S.secondaryBtnSm}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>
              Embed code
            </button>
            <button onClick={() => setModal({ type:'document' })} style={S.primaryBtnSm}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload resource
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{ padding:'16px 32px 0', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
          <span onClick={() => { setSelectedCat(null); setSelectedSub(null) }} style={{ color:BRAND.primary, cursor:'pointer', fontWeight:500 }}>All resources</span>
          {selectedCat && <><span style={{ color:BRAND.textMuted }}>›</span><span onClick={() => setSelectedSub(null)} style={{ color: selectedSub ? BRAND.primary : BRAND.text, cursor:'pointer', fontWeight:500 }}>{getCatName(selectedCat)}</span></>}
          {selectedSub && <><span style={{ color:BRAND.textMuted }}>›</span><span style={{ color:BRAND.text, fontWeight:500 }}>{getSubName(selectedSub)}</span></>}
          <span style={{ color:BRAND.textMuted, marginLeft:4 }}>· {filteredDocs.length} resource{filteredDocs.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Document grid */}
        <div style={{ padding:'20px 32px 32px', flex:1 }}>
          {filteredDocs.length === 0 ? (
            <div className="fade-up" style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:BRAND.primaryMuted, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:32 }}>📄</div>
              <h3 style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>No resources found</h3>
              <p style={{ color:BRAND.textSecondary, fontSize:14, marginBottom:24 }}>Upload your first resource to get started</p>
              <button onClick={() => setModal({ type:'document' })} style={S.primaryBtnSm}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Upload resource
              </button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
              {filteredDocs.map((doc, i) => (
                <DocCard key={doc.id} doc={doc} index={i} getCatName={getCatName} getSubName={getSubName}
                  onPreview={() => setPreviewDoc(doc)}
                  onDelete={async () => { if(confirm('Delete this resource?')) { await supabase.from('documents').delete().eq('id', doc.id); fetchAll(); showToast('Resource deleted') } }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal?.type === 'category' && <CategoryModal onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); showToast('Collection created') }} />}
      {modal?.type === 'subcategory' && <SubcategoryModal categoryId={modal.data.category_id} onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); showToast('Subcollection created') }} />}
      {modal?.type === 'document' && <DocumentModal categories={categories} subcategories={subcategories} onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); showToast('Resource uploaded') }} />}
      {modal?.type === 'embed' && <EmbedModal categories={categories} subcategories={subcategories} onClose={() => setModal(null)} onCopy={() => showToast('Embed code copied!')} />}
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      {/* ── TOAST ── */}
      {toast && (
        <div className="slide-right" style={{ position:'fixed', bottom:24, right:24, zIndex:9000, background:BRAND.bgWhite, border:`1px solid ${BRAND.border}`, borderLeft:`3px solid ${toast.type === 'success' ? BRAND.success : BRAND.danger}`, borderRadius:BRAND.radius, padding:'12px 20px', fontSize:14, boxShadow:BRAND.shadowLg, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}
    </div>
  )
}

/* ── NAV ITEM ── */
function NavItem({ label, icon, active, count, onClick, indent, style = {} }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}
      style={{ width:'100%', padding: indent ? '6px 12px 6px 32px' : '8px 12px', background: active ? BRAND.primaryMuted : hovered ? BRAND.bgInput : 'transparent', color: active ? BRAND.primary : BRAND.text, border:'none', borderRadius:6, fontSize:13, fontWeight: active ? 600 : 400, textAlign:'left', display:'flex', alignItems:'center', gap:8, margin:'1px 0', ...style }}>
      <span style={{ fontSize: indent ? 12 : 14, opacity:0.8 }}>{icon}</span>
      <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</span>
      {count !== undefined && <span style={{ fontSize:11, color:BRAND.textMuted, background:BRAND.bgInput, padding:'1px 6px', borderRadius:10 }}>{count}</span>}
    </button>
  )
}

/* ── DOCUMENT CARD ── */
function DocCard({ doc, index, getCatName, getSubName, onPreview, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const typeIcons = { pdf:'📕', image:'🖼️', word:'📘', excel:'📗', powerpoint:'📙', file:'📄' }

  return (
    <div className="fade-up" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:BRAND.bgCard, borderRadius:BRAND.radiusLg, border:`1px solid ${hovered ? BRAND.primaryBorder : BRAND.border}`, overflow:'hidden', boxShadow: hovered ? BRAND.shadowHover : BRAND.shadow, transition:'all 0.25s ease', animationDelay:`${index * 40}ms`, cursor:'pointer' }}
      onClick={onPreview}>
      {/* Thumbnail */}
      <div style={{ height:160, background: `linear-gradient(135deg, ${BRAND.bgInput} 0%, ${BRAND.border} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {doc.thumbnail_url ? (
          <img src={doc.thumbnail_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <span style={{ fontSize:48, filter:'grayscale(0.2)' }}>{typeIcons[doc.file_type] || '📄'}</span>
        )}
        <div style={{ position:'absolute', top:10, right:10, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(4px)', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, color:BRAND.primaryDark, textTransform:'uppercase', letterSpacing:'0.5px' }}>
          {doc.file_type || 'file'}
        </div>
        {hovered && (
          <div className="fade-in" style={{ position:'absolute', inset:0, background:'rgba(13,27,42,0.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <button onClick={(e) => { e.stopPropagation(); window.open(doc.file_url, '_blank') }} style={{ padding:'8px 16px', background:'white', color:BRAND.text, border:'none', borderRadius:6, fontSize:12, fontWeight:600 }}>Open</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete() }} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.3)', borderRadius:6, fontSize:12, fontWeight:500 }}>Delete</button>
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding:'14px 16px' }}>
        <h4 style={{ fontSize:14, fontWeight:600, marginBottom:4, lineHeight:1.3 }}>{doc.name}</h4>
        {doc.description && <p style={{ fontSize:12, color:BRAND.textSecondary, marginBottom:8, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{doc.description}</p>}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {doc.category_id && <span style={{ fontSize:11, background:BRAND.primaryMuted, color:BRAND.primary, padding:'2px 8px', borderRadius:20, fontWeight:500 }}>{getCatName(doc.category_id)}</span>}
          {doc.subcategory_id && <span style={{ fontSize:11, background:BRAND.accentMuted, color:'#B07D20', padding:'2px 8px', borderRadius:20, fontWeight:500 }}>{getSubName(doc.subcategory_id)}</span>}
        </div>
      </div>
    </div>
  )
}

/* ── PREVIEW MODAL ── */
function PreviewModal({ doc, onClose }) {
  const isImage = doc.file_type === 'image'
  const isPdf = doc.file_type === 'pdf'

  return (
    <div style={S.overlay} onClick={onClose}>
      <div className="scale-in" onClick={e => e.stopPropagation()} style={{ background:BRAND.bgWhite, borderRadius:BRAND.radiusXl, width: 720, maxWidth:'92vw', maxHeight:'88vh', overflow:'hidden', boxShadow:BRAND.shadowLg, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'18px 24px', borderBottom:`1px solid ${BRAND.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h3 style={{ fontSize:16, fontWeight:600 }}>{doc.name}</h3>
            {doc.description && <p style={{ fontSize:13, color:BRAND.textSecondary, marginTop:2 }}>{doc.description}</p>}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={S.primaryBtnSm}>Open file</a>
            <button onClick={onClose} style={S.closeBtn}>✕</button>
          </div>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:24, display:'flex', alignItems:'center', justifyContent:'center', background:BRAND.bgInput, minHeight:400 }}>
          {isImage ? (
            <img src={doc.file_url} alt={doc.name} style={{ maxWidth:'100%', maxHeight:'60vh', borderRadius:8, boxShadow:BRAND.shadow }} />
          ) : isPdf ? (
            <iframe src={doc.file_url} style={{ width:'100%', height:'60vh', border:'none', borderRadius:8 }} title={doc.name} />
          ) : (
            <div style={{ textAlign:'center', padding:40 }}>
              <span style={{ fontSize:64, display:'block', marginBottom:16 }}>📄</span>
              <p style={{ color:BRAND.textSecondary, fontSize:14, marginBottom:16 }}>Preview not available for this file type</p>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={S.primaryBtnSm}>Download file</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   MODALS
   ═══════════════════════════════════════ */
function ModalWrap({ title, subtitle, onClose, children, wide }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div className="scale-in" onClick={e => e.stopPropagation()} style={{ ...S.modal, width: wide ? 620 : 460 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h3 style={{ fontSize:17, fontWeight:600 }}>{title}</h3>
            {subtitle && <p style={{ fontSize:13, color:BRAND.textSecondary, marginTop:2 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={S.closeBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function CategoryModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSave = async () => {
    if (!name.trim()) return; setLoading(true)
    await supabase.from('categories').insert({ name:name.trim(), description:desc.trim()||null })
    setLoading(false); onSave()
  }
  return (
    <ModalWrap title="New collection" subtitle="Organize your resources into collections" onClose={onClose}>
      <label style={S.label}>Collection name</label>
      <input style={S.input} placeholder="e.g. AI Lesson Plans" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <label style={S.label}>Description (optional)</label>
      <input style={S.input} placeholder="Brief description" value={desc} onChange={e => setDesc(e.target.value)} />
      <button onClick={handleSave} disabled={loading||!name.trim()} style={S.primaryBtn}>{loading ? 'Creating...' : 'Create collection'}</button>
    </ModalWrap>
  )
}

function SubcategoryModal({ categoryId, onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSave = async () => {
    if (!name.trim()) return; setLoading(true)
    await supabase.from('subcategories').insert({ name:name.trim(), description:desc.trim()||null, category_id:categoryId })
    setLoading(false); onSave()
  }
  return (
    <ModalWrap title="New subcollection" onClose={onClose}>
      <label style={S.label}>Subcollection name</label>
      <input style={S.input} placeholder="e.g. Week 1 Materials" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <label style={S.label}>Description (optional)</label>
      <input style={S.input} placeholder="Brief description" value={desc} onChange={e => setDesc(e.target.value)} />
      <button onClick={handleSave} disabled={loading||!name.trim()} style={S.primaryBtn}>{loading ? 'Creating...' : 'Create subcollection'}</button>
    </ModalWrap>
  )
}

function DocumentModal({ categories, subcategories, onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [catId, setCatId] = useState('')
  const [subId, setSubId] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const filteredSubs = catId ? subcategories.filter(s => s.category_id === catId) : []

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image'
    if (['doc','docx'].includes(ext)) return 'word'
    if (['xls','xlsx'].includes(ext)) return 'excel'
    if (['ppt','pptx'].includes(ext)) return 'powerpoint'
    return 'file'
  }

  const handleFile = (f) => { if(f) { setFile(f); if(!name) setName(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')) } }

  const handleUpload = async () => {
    if (!name.trim() || !file) return setError('Name and file are required')
    setLoading(true); setError('')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadErr } = await supabase.storage.from('documents').upload(fileName, file)
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      const ft = getFileType(file.name)
      const { error: insertErr } = await supabase.from('documents').insert({
        name:name.trim(), description:desc.trim()||null, category_id:catId||null, subcategory_id:subId||null,
        file_url:urlData.publicUrl, thumbnail_url: ft==='image' ? urlData.publicUrl : null, file_type:ft,
      })
      if (insertErr) throw insertErr
      onSave()
    } catch (err) { setError(err.message || 'Upload failed') }
    setLoading(false)
  }

  return (
    <ModalWrap title="Upload resource" subtitle="Add a document, image, or file to your hub" onClose={onClose}>
      {error && <div style={S.errorBox}>{error}</div>}

      {/* Drag & drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileInputRef.current?.click()}
        style={{ border:`2px dashed ${dragOver ? BRAND.primaryLight : BRAND.border}`, borderRadius:BRAND.radiusLg, padding:'28px 20px', textAlign:'center', marginBottom:20, background: dragOver ? BRAND.primaryMuted : BRAND.bgInput, cursor:'pointer', transition:'all 0.2s' }}>
        <input ref={fileInputRef} type="file" onChange={e => handleFile(e.target.files[0])} style={{ display:'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.svg" />
        {file ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <span style={{ fontSize:24 }}>📎</span>
            <span style={{ fontSize:14, fontWeight:500 }}>{file.name}</span>
            <span style={{ fontSize:12, color:BRAND.textMuted }}>({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={BRAND.textMuted} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:8 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style={{ fontSize:14, color:BRAND.textSecondary, fontWeight:500 }}>Drop a file here or click to browse</p>
            <p style={{ fontSize:12, color:BRAND.textMuted, marginTop:4 }}>PDF, Word, Excel, PowerPoint, Images</p>
          </>
        )}
      </div>

      <label style={S.label}>Resource name</label>
      <input style={S.input} placeholder="e.g. AI Ethics Syllabus" value={name} onChange={e => setName(e.target.value)} />
      <label style={S.label}>Description (optional)</label>
      <textarea style={{ ...S.input, height:64, resize:'vertical' }} placeholder="Brief description of this resource" value={desc} onChange={e => setDesc(e.target.value)} />
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ flex:1 }}>
          <label style={S.label}>Collection</label>
          <select style={S.select} value={catId} onChange={e => { setCatId(e.target.value); setSubId('') }}>
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {filteredSubs.length > 0 && (
          <div style={{ flex:1 }}>
            <label style={S.label}>Subcollection</label>
            <select style={S.select} value={subId} onChange={e => setSubId(e.target.value)}>
              <option value="">None</option>
              {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>
      <button onClick={handleUpload} disabled={loading||!name.trim()||!file} style={S.primaryBtn}>{loading ? 'Uploading...' : 'Upload resource'}</button>
    </ModalWrap>
  )
}

/* ═══════════════════════════════════════
   EMBED CODE GENERATOR
   ═══════════════════════════════════════ */
function EmbedModal({ categories, subcategories, onClose, onCopy }) {
  const [embedType, setEmbedType] = useState('all')
  const [embedCatId, setEmbedCatId] = useState('')
  const [embedSubId, setEmbedSubId] = useState('')
  const filteredSubs = embedCatId ? subcategories.filter(s => s.category_id === embedCatId) : []

  const generateEmbedCode = () => {
    let filter = ''
    if (embedType === 'category' && embedCatId) filter = `&category_id=eq.${embedCatId}`
    if (embedType === 'subcategory' && embedSubId) filter = `&subcategory_id=eq.${embedSubId}`

    return `<!-- AI Teaching Hub — Resource Embed -->
<div id="hfu-resources"></div>
<script>
(function(){
  var C=document.getElementById('hfu-resources');
  C.innerHTML='<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif;color:#5A6478;">Loading resources...</div>';
  fetch('${SUPABASE_URL}/rest/v1/documents?select=*&order=created_at.desc${filter}',{
    headers:{'apikey':'${SUPABASE_KEY}','Authorization':'Bearer ${SUPABASE_KEY}'}
  }).then(function(r){return r.json()}).then(function(docs){
    if(!docs.length){C.innerHTML='<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif;color:#5A6478;">No resources available.</div>';return}
    var g=document.createElement('div');
    g.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
    docs.forEach(function(d){
      var c=document.createElement('a');c.href=d.file_url;c.target='_blank';c.rel='noopener noreferrer';
      c.style.cssText='display:block;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;text-decoration:none;color:#1a202c;transition:all 0.25s;background:#fff;';
      c.onmouseenter=function(){c.style.boxShadow='0 8px 24px rgba(26,111,181,0.12)';c.style.borderColor='rgba(55,162,225,0.3)';c.style.transform='translateY(-2px)'};
      c.onmouseleave=function(){c.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)';c.style.borderColor='#e2e8f0';c.style.transform='translateY(0)'};
      var t=document.createElement('div');
      t.style.cssText='height:140px;background:linear-gradient(135deg,#f0f4f8,#e2e8f0);display:flex;align-items:center;justify-content:center;overflow:hidden;';
      if(d.thumbnail_url){var img=document.createElement('img');img.src=d.thumbnail_url;img.style.cssText='width:100%;height:100%;object-fit:cover;';t.appendChild(img)}
      else{t.innerHTML='<span style="font-size:40px;">'+(d.file_type==='pdf'?'📕':d.file_type==='image'?'🖼️':'📄')+'</span>'}
      var b=document.createElement('div');
      b.style.cssText='position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.95);padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;color:#0D4F82;text-transform:uppercase;letter-spacing:0.5px;';
      b.textContent=d.file_type||'file';
      var tw=document.createElement('div');tw.style.cssText='position:relative;';tw.appendChild(t);tw.appendChild(b);
      var info=document.createElement('div');info.style.cssText='padding:14px 16px;';
      info.innerHTML='<h4 style="margin:0 0 4px;font-size:14px;font-weight:600;line-height:1.3;">'+d.name+'</h4>'+
        (d.description?'<p style="margin:0;font-size:12px;color:#5A6478;line-height:1.5;">'+d.description+'</p>':'')+
        '<div style="margin-top:10px;display:flex;align-items:center;gap:6px;"><span style="font-size:11px;color:#1A6FB5;font-weight:500;">View resource →</span></div>';
      c.appendChild(tw);c.appendChild(info);g.appendChild(c)
    });
    C.innerHTML='';C.appendChild(g)
  }).catch(function(){C.innerHTML='<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif;color:#DC3545;">Failed to load resources.</div>'})
})();
</script>`
  }

  const handleCopy = () => { navigator.clipboard.writeText(generateEmbedCode()); onCopy() }

  return (
    <ModalWrap title="Embed code" subtitle="Copy this code to embed resources on any website" onClose={onClose} wide>
      <label style={S.label}>What to embed</label>
      <select style={S.select} value={embedType} onChange={e => { setEmbedType(e.target.value); setEmbedCatId(''); setEmbedSubId('') }}>
        <option value="all">All resources</option>
        <option value="category">Specific collection</option>
        <option value="subcategory">Specific subcollection</option>
      </select>
      {embedType === 'category' && (
        <><label style={S.label}>Collection</label>
        <select style={S.select} value={embedCatId} onChange={e => setEmbedCatId(e.target.value)}>
          <option value="">Select...</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></>
      )}
      {embedType === 'subcategory' && (
        <><label style={S.label}>Collection</label>
        <select style={S.select} value={embedCatId} onChange={e => { setEmbedCatId(e.target.value); setEmbedSubId('') }}>
          <option value="">Select...</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {filteredSubs.length > 0 && <>
          <label style={S.label}>Subcollection</label>
          <select style={S.select} value={embedSubId} onChange={e => setEmbedSubId(e.target.value)}>
            <option value="">Select...</option>
            {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </>}</>
      )}
      <div style={{ background:BRAND.bgInput, border:`1px solid ${BRAND.border}`, borderRadius:BRAND.radiusLg, padding:16, marginBottom:16, maxHeight:180, overflow:'auto' }}>
        <pre style={{ margin:0, whiteSpace:'pre-wrap', wordBreak:'break-all', fontSize:11, color:BRAND.textSecondary, lineHeight:1.6, fontFamily:"'SF Mono','Fira Code',monospace" }}>{generateEmbedCode()}</pre>
      </div>
      <button onClick={handleCopy} style={S.primaryBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display:'inline', verticalAlign:'middle', marginRight:6 }}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy embed code
      </button>
    </ModalWrap>
  )
}

/* ═══════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════ */
const S = {
  label: { display:'block', fontSize:13, color:BRAND.textSecondary, marginBottom:5, fontWeight:500 },
  input: { width:'100%', padding:'10px 14px', background:BRAND.bgInput, border:`1px solid ${BRAND.border}`, borderRadius:BRAND.radius, color:BRAND.text, fontSize:14, marginBottom:16, boxSizing:'border-box', transition:'all 0.2s' },
  select: { width:'100%', padding:'10px 14px', background:BRAND.bgInput, border:`1px solid ${BRAND.border}`, borderRadius:BRAND.radius, color:BRAND.text, fontSize:14, marginBottom:16, boxSizing:'border-box', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6478' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' },
  primaryBtn: { width:'100%', padding:'11px', background:BRAND.primary, color:'white', border:'none', borderRadius:BRAND.radius, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  primaryBtnSm: { padding:'9px 18px', background:BRAND.primary, color:'white', border:'none', borderRadius:BRAND.radius, fontSize:13, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, textDecoration:'none' },
  secondaryBtn: { padding:'10px 20px', background:BRAND.bgWhite, color:BRAND.text, border:`1px solid ${BRAND.border}`, borderRadius:BRAND.radius, fontSize:14, fontWeight:500, cursor:'pointer' },
  secondaryBtnSm: { padding:'9px 16px', background:BRAND.bgWhite, color:BRAND.textSecondary, border:`1px solid ${BRAND.border}`, borderRadius:BRAND.radius, fontSize:13, fontWeight:500, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 },
  linkBtn: { background:'none', border:'none', color:BRAND.primary, fontSize:13, cursor:'pointer', fontWeight:500 },
  errorBox: { background:BRAND.dangerMuted, border:`1px solid rgba(220,53,69,0.15)`, borderRadius:BRAND.radius, padding:'10px 14px', marginBottom:16, fontSize:13, color:BRAND.danger },
  formCard: { background:BRAND.bgWhite, borderRadius:BRAND.radiusLg, border:`1px solid ${BRAND.border}`, padding:32, boxShadow:BRAND.shadow },
  overlay: { position:'fixed', inset:0, zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(13,27,42,0.5)', backdropFilter:'blur(4px)' },
  modal: { background:BRAND.bgWhite, borderRadius:BRAND.radiusXl, border:`1px solid ${BRAND.border}`, padding:28, maxWidth:'92vw', maxHeight:'88vh', overflowY:'auto', boxShadow:BRAND.shadowLg },
  closeBtn: { width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:BRAND.bgInput, border:'none', borderRadius:8, color:BRAND.textMuted, fontSize:16, cursor:'pointer', flexShrink:0 },
  iconBtnSm: { background:'none', border:'none', color:BRAND.textMuted, fontSize:14, padding:'4px 6px', lineHeight:1, cursor:'pointer', borderRadius:4 },
}
