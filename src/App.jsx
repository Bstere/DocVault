import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

/* ═══════════════════════════════════════════════════════════
   HOLY FAMILY UNIVERSITY — AI TEACHING HUB
   Resource Directory Platform
   ═══════════════════════════════════════════════════════════ */

const B = {
  primary: '#1A6FB5',
  primaryLight: '#37A2E1',
  primaryDark: '#0D4F82',
  primaryMuted: 'rgba(55,162,225,0.08)',
  primaryBorder: 'rgba(55,162,225,0.2)',
  accent: '#E8A838',
  accentMuted: 'rgba(232,168,56,0.1)',
  bg: '#F8F9FC',
  white: '#FFFFFF',
  dark: '#0D1B2A',
  input: '#F3F5F9',
  text: '#1A1A2E',
  textSec: '#5A6478',
  textMut: '#8B95A8',
  border: '#E8EBF0',
  borderLt: '#F0F2F6',
  danger: '#DC3545',
  dangerMut: 'rgba(220,53,69,0.08)',
  success: '#28A745',
  successMut: 'rgba(40,167,69,0.08)',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
  shadowLg: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
  shadowHover: '0 8px 24px rgba(26,111,181,0.12)',
  r: '8px', rLg: '12px', rXl: '16px',
}

const SB_URL = 'https://oguvjvdoirfwexnhkqnf.supabase.co'
const SB_KEY = 'sb_publishable_vvvryO7vRZaml_870oaJyQ_n9pEmNAw'

/* ── GLOBAL STYLES ── */
if (typeof document !== 'undefined' && !document.getElementById('hfu-s')) {
  const s = document.createElement('style'); s.id = 'hfu-s'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}html,body,#root{height:100%}
    body{background:${B.bg};font-family:'DM Sans',Arial,sans-serif;color:${B.text};-webkit-font-smoothing:antialiased}
    ::selection{background:${B.primaryLight};color:#fff}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px}
    input:focus,select:focus,textarea:focus{outline:none;border-color:${B.primaryLight}!important;box-shadow:0 0 0 3px ${B.primaryMuted}!important}
    button{cursor:pointer;transition:all .2s ease}button:active{transform:scale(.98)}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideR{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fu{animation:fadeUp .4s ease both}.fi{animation:fadeIn .3s ease both}
    .sr{animation:slideR .3s ease both}.si{animation:scaleIn .25s ease both}
  `; document.head.appendChild(s)
}

/* ═══════ APP ═══════ */
export default function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); if (s) setPage('dashboard'); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((ev, s) => {
      setSession(s)
      if (ev === 'PASSWORD_RECOVERY') { setPage('reset'); return }
      if (s) setPage('dashboard'); else setPage('login')
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <Loader msg="Loading AI Teaching Hub..." />
  if (page === 'forgot') return <ForgotPage onBack={() => setPage('login')} />
  if (page === 'reset') return <ResetPage onDone={() => setPage('login')} />
  if (page === 'dashboard' && session) return <Dashboard session={session} onLogout={async () => { await supabase.auth.signOut(); setSession(null); setPage('login') }} />
  return <LoginPage onForgot={() => setPage('forgot')} />
}

function Loader({ msg }) {
  return <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:B.bg }}>
    <div style={{ width:40, height:40, border:`3px solid ${B.border}`, borderTopColor:B.primaryLight, borderRadius:'50%', animation:'spin .7s linear infinite' }} />
    {msg && <p style={{ color:B.textMut, marginTop:16, fontSize:14 }}>{msg}</p>}
  </div>
}

function Crest({ size = 48 }) {
  return <div style={{ width:size, height:size, borderRadius:size/4, background:`linear-gradient(135deg,${B.primaryDark},${B.primaryLight})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 16px rgba(26,111,181,.3)` }}>
    <svg width={size*.55} height={size*.55} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
  </div>
}

/* ═══════ LOGIN ═══════ */
function LoginPage({ onForgot }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [ld, setLd] = useState(false)
  const [err, setErr] = useState('')

  const go = async (e) => {
    e?.preventDefault()
    if (!email || !pw) return setErr('Please fill in all fields')
    setLd(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr(error.message)
    setLd(false)
  }

  return <div style={{ minHeight:'100vh', display:'flex' }}>
    <div style={{ flex:1, background:`linear-gradient(160deg,${B.dark} 0%,${B.primaryDark} 100%)`, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:60, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px),radial-gradient(circle at 80% 20%,#fff 1px,transparent 1px)', backgroundSize:'60px 60px,40px 40px' }} />
      <div className="fu" style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:420 }}>
        <Crest size={72} />
        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:36, fontWeight:600, color:'#fff', marginTop:28, lineHeight:1.2 }}>Holy Family<br/>University</h1>
        <div style={{ width:48, height:2, background:B.accent, margin:'20px auto', borderRadius:1 }} />
        <p style={{ fontSize:18, color:'rgba(255,255,255,.7)', fontWeight:300 }}>AI Teaching Hub</p>
        <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginTop:12, lineHeight:1.6 }}>Resource directory platform for managing and embedding AI teaching tools and resources.</p>
      </div>
    </div>
    <div style={{ width:480, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 56px', background:B.white }}>
      <div className="fu">
        <h2 style={{ fontSize:24, fontWeight:600, marginBottom:6 }}>Welcome back</h2>
        <p style={{ color:B.textSec, fontSize:14, marginBottom:32 }}>Sign in to manage resources</p>
        {err && <ErrBox msg={err} />}
        <form onSubmit={go}>
          <Label>Email address</Label>
          <Input type="email" placeholder="you@holyfamily.edu" value={email} onChange={e => setEmail(e.target.value)} />
          <Label>Password</Label>
          <Input type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} />
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
            <button type="button" onClick={onForgot} style={S.link}>Forgot password?</button>
          </div>
          <Btn disabled={ld}>{ld ? 'Signing in...' : 'Sign in'}</Btn>
        </form>
      </div>
    </div>
  </div>
}

/* ═══════ FORGOT / RESET ═══════ */
function ForgotPage({ onBack }) {
  const [email, setEmail] = useState(''); const [ld, setLd] = useState(false)
  const [sent, setSent] = useState(false); const [err, setErr] = useState('')
  const go = async (e) => { e?.preventDefault(); if(!email) return setErr('Enter your email'); setLd(true); setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    if(error) setErr(error.message); else setSent(true); setLd(false) }
  return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:B.bg }}>
    <div className="fu" style={{ width:420, maxWidth:'90vw' }}>
      <div style={{ textAlign:'center', marginBottom:32 }}><Crest size={56} /><h2 style={{ fontSize:22, fontWeight:600, marginTop:16 }}>Reset password</h2></div>
      <div style={S.card}>{sent ? <div style={{ textAlign:'center' }}><SuccessIcon /><p style={{ color:B.textSec, fontSize:14, marginBottom:20 }}>Link sent to <strong style={{ color:B.text }}>{email}</strong></p><BtnSec onClick={onBack}>Back to sign in</BtnSec></div> : <>
        {err && <ErrBox msg={err} />}
        <form onSubmit={go}><Label>Email</Label><Input type="email" placeholder="you@holyfamily.edu" value={email} onChange={e=>setEmail(e.target.value)} />
        <Btn disabled={ld}>{ld?'Sending...':'Send reset link'}</Btn></form>
        <BtnSec onClick={onBack} style={{ width:'100%', marginTop:12 }}>Back to sign in</BtnSec></>}</div>
    </div>
  </div>
}

function ResetPage({ onDone }) {
  const [pw, setPw] = useState(''); const [c, setC] = useState('')
  const [ld, setLd] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(false)
  const go = async (e) => { e?.preventDefault(); if(!pw) return setErr('Enter a password'); if(pw.length<6) return setErr('Min 6 chars')
    if(pw!==c) return setErr("Passwords don't match"); setLd(true); setErr('')
    const { error } = await supabase.auth.updateUser({ password:pw }); if(error) setErr(error.message); else setDone(true); setLd(false) }
  if(done) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:B.bg }}><div className="fu" style={{ textAlign:'center' }}><SuccessIcon /><h2 style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>Password updated</h2><BtnSec onClick={onDone}>Back to sign in</BtnSec></div></div>
  return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:B.bg }}>
    <div className="fu" style={{ width:420 }}><div style={{ textAlign:'center', marginBottom:32 }}><Crest size={56} /><h2 style={{ fontSize:22, fontWeight:600, marginTop:16 }}>Set new password</h2></div>
    <div style={S.card}>{err && <ErrBox msg={err} />}<form onSubmit={go}><Label>New password</Label><Input type="password" placeholder="Min. 6 characters" value={pw} onChange={e=>setPw(e.target.value)} />
    <Label>Confirm</Label><Input type="password" placeholder="••••••••" value={c} onChange={e=>setC(e.target.value)} />
    <Btn disabled={ld}>{ld?'Updating...':'Update password'}</Btn></form></div></div></div>
}

/* ═══════ DASHBOARD ═══════ */
function Dashboard({ session, onLogout }) {
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [resources, setResources] = useState([])
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('overview') // overview | category
  const [activeCat, setActiveCat] = useState(null)
  const [search, setSearch] = useState('')

  const fetchAll = useCallback(async () => {
    const [co, ca, re] = await Promise.all([
      supabase.from('collections').select('*').order('sort_order').order('created_at'),
      supabase.from('categories').select('*').order('sort_order').order('created_at'),
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
    ])
    setCollections(co.data || []); setCategories(ca.data || []); setResources(re.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const openCategory = (cat) => { setActiveCat(cat); setView('category'); setSearch('') }
  const goBack = () => { setView('overview'); setActiveCat(null); setSearch('') }

  const catResources = activeCat ? resources.filter(r => r.category_id === activeCat.id) : []
  const filteredRes = catResources.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q)
  })

  if (loading) return <Loader />

  return <div style={{ display:'flex', height:'100vh', background:B.bg }}>
    {/* ── SIDEBAR ── */}
    <div style={{ width:272, background:B.white, borderRight:`1px solid ${B.border}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'20px 20px 16px', borderBottom:`1px solid ${B.borderLt}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Crest size={36} />
          <div><div style={{ fontWeight:600, fontSize:14 }}>AI Teaching Hub</div><div style={{ fontSize:11, color:B.textMut, marginTop:2 }}>Holy Family University</div></div>
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'12px 10px' }}>
        {/* Quick actions */}
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:600, color:B.textMut, padding:'4px 12px', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>Manage</p>
          <SideBtn icon="📦" label="Collections" onClick={() => setModal({ type:'manage-collections' })} />
          <SideBtn icon="📂" label="Categories" onClick={() => setModal({ type:'manage-categories' })} />
          <SideBtn icon="🔗" label="Resources" active={view==='overview'} onClick={goBack} />
        </div>

        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:600, color:B.textMut, padding:'4px 12px', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>Quick Add</p>
          <SideBtn icon="+" label="New collection" accent onClick={() => setModal({ type:'add-collection' })} />
          <SideBtn icon="+" label="New category" accent onClick={() => setModal({ type:'add-category' })} />
          <SideBtn icon="+" label="New resource" accent onClick={() => setModal({ type:'add-resource' })} />
        </div>

        <div>
          <p style={{ fontSize:11, fontWeight:600, color:B.textMut, padding:'4px 12px', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>Tools</p>
          <SideBtn icon="⟨/⟩" label="Embed code" onClick={() => setModal({ type:'embed' })} />
        </div>
      </div>

      <div style={{ padding:'14px 16px', borderTop:`1px solid ${B.borderLt}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:12, color:B.textMut, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{session.user.email}</div>
        <button onClick={onLogout} style={{ background:'none', border:'none', color:B.danger, fontSize:12, fontWeight:500 }}>Sign out</button>
      </div>
    </div>

    {/* ── MAIN ── */}
    <div style={{ flex:1, overflow:'auto' }}>
      {view === 'overview' ? (
        <OverviewView collections={collections} categories={categories} resources={resources}
          onOpenCat={openCategory} onAddResource={() => setModal({ type:'add-resource' })} />
      ) : (
        <CategoryView category={activeCat} resources={filteredRes} search={search}
          setSearch={setSearch} onBack={goBack}
          onAddResource={() => setModal({ type:'add-resource', data:{ category_id: activeCat.id } })}
          onDeleteResource={async (id) => { if(confirm('Delete this resource?')){await supabase.from('resources').delete().eq('id',id); fetchAll(); notify('Resource deleted')} }}
          onEditResource={(r) => setModal({ type:'edit-resource', data: r })} />
      )}
    </div>

    {/* ── MODALS ── */}
    {modal?.type === 'add-collection' && <CollectionModal onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); notify('Collection created') }} />}
    {modal?.type === 'add-category' && <CategoryModal collections={collections} onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); notify('Category created') }} />}
    {modal?.type === 'add-resource' && <ResourceModal categories={categories} prefillCatId={modal.data?.category_id} onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); notify('Resource added') }} />}
    {modal?.type === 'edit-resource' && <ResourceModal categories={categories} existing={modal.data} onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); notify('Resource updated') }} />}
    {modal?.type === 'manage-collections' && <ManageCollections collections={collections} onClose={() => setModal(null)} onRefresh={fetchAll} notify={notify} />}
    {modal?.type === 'manage-categories' && <ManageCategories collections={collections} categories={categories} resources={resources} onClose={() => setModal(null)} onRefresh={fetchAll} notify={notify} />}
    {modal?.type === 'embed' && <EmbedModal collections={collections} categories={categories} onClose={() => setModal(null)} onCopy={() => notify('Embed code copied!')} />}

    {toast && <div className="sr" style={{ position:'fixed', bottom:24, right:24, zIndex:9000, background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${toast.type==='success'?B.success:B.danger}`, borderRadius:B.r, padding:'12px 20px', fontSize:14, boxShadow:B.shadowLg, display:'flex', alignItems:'center', gap:8 }}>
      <span>{toast.type==='success'?'✓':'✕'}</span>{toast.msg}</div>}
  </div>
}

/* ── SIDEBAR BUTTON ── */
function SideBtn({ icon, label, active, accent, onClick }) {
  const [h, setH] = useState(false)
  return <button onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}
    style={{ width:'100%', padding:'7px 12px', background: active ? B.primaryMuted : accent && h ? B.primaryMuted : h ? B.input : 'transparent',
      color: active ? B.primary : accent ? B.primary : B.text,
      border: accent ? `1px dashed ${B.primaryBorder}` : 'none', borderRadius:6, fontSize:13, fontWeight: active||accent ? 500 : 400,
      textAlign:'left', display:'flex', alignItems:'center', gap:8, margin:'2px 0' }}>
    <span style={{ fontSize:14, width:20, textAlign:'center' }}>{icon}</span>{label}
  </button>
}

/* ═══════ OVERVIEW VIEW ═══════ */
function OverviewView({ collections, categories, resources, onOpenCat, onAddResource }) {
  const ungrouped = categories.filter(c => !c.collection_id)

  return <div style={{ padding:'32px 40px', maxWidth:1100 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
      <div>
        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:28, fontWeight:600 }}>Resource Directory</h1>
        <p style={{ color:B.textSec, fontSize:14, marginTop:4 }}>{resources.length} resource{resources.length!==1?'s':''} across {categories.length} categor{categories.length!==1?'ies':'y'}</p>
      </div>
      <button onClick={onAddResource} style={S.primarySm}><span style={{ fontSize:16 }}>+</span> Add resource</button>
    </div>

    {collections.map(col => {
      const colCats = categories.filter(c => c.collection_id === col.id)
      if (!colCats.length) return null
      return <div key={col.id} className="fu" style={{ marginBottom:40 }}>
        <h2 style={{ fontSize:22, fontWeight:600, marginBottom:4 }}>{col.name}</h2>
        {col.description && <p style={{ color:B.textSec, fontSize:14, marginBottom:16 }}>{col.description}</p>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
          {colCats.map(cat => <EmojiCard key={cat.id} cat={cat} count={resources.filter(r=>r.category_id===cat.id).length} onClick={() => onOpenCat(cat)} />)}
        </div>
      </div>
    })}

    {ungrouped.length > 0 && <div className="fu" style={{ marginBottom:40 }}>
      <h2 style={{ fontSize:22, fontWeight:600, marginBottom:4 }}>Other Categories</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
        {ungrouped.map(cat => <EmojiCard key={cat.id} cat={cat} count={resources.filter(r=>r.category_id===cat.id).length} onClick={() => onOpenCat(cat)} />)}
      </div>
    </div>}

    {categories.length === 0 && <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📂</div>
      <h3 style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>No categories yet</h3>
      <p style={{ color:B.textSec, fontSize:14, marginBottom:24 }}>Create a collection and add categories to get started</p>
    </div>}
  </div>
}

/* ── EMOJI CARD ── */
function EmojiCard({ cat, count, onClick }) {
  const [h, setH] = useState(false)
  return <button onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}
    style={{ background:B.white, border:`1px solid ${h ? B.primaryBorder : B.border}`, borderRadius:B.rLg, padding:'24px 16px', textAlign:'center',
      boxShadow: h ? B.shadowHover : B.shadow, transition:'all .25s', transform: h ? 'translateY(-2px)' : 'none', cursor:'pointer' }}>
    <div style={{ fontSize:36, marginBottom:10, lineHeight:1 }}>{cat.emoji || '📁'}</div>
    <div style={{ fontSize:14, fontWeight:600, lineHeight:1.3 }}>{cat.name}</div>
    {count > 0 && <div style={{ fontSize:12, color:B.textMut, marginTop:4 }}>{count} resource{count!==1?'s':''}</div>}
  </button>
}

/* ═══════ CATEGORY VIEW ═══════ */
function CategoryView({ category, resources, search, setSearch, onBack, onAddResource, onDeleteResource, onEditResource }) {
  return <div style={{ padding:'32px 40px', maxWidth:900 }}>
    <button onClick={onBack} style={{ background:'none', border:'none', color:B.primary, fontSize:13, fontWeight:500, marginBottom:20, display:'flex', alignItems:'center', gap:4 }}>
      ← Back to all categories
    </button>

    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
          <span style={{ fontSize:32 }}>{category.emoji || '📁'}</span>
          <h1 style={{ fontSize:26, fontWeight:600 }}>{category.name}</h1>
        </div>
        {category.description && <p style={{ color:B.textSec, fontSize:14 }}>{category.description}</p>}
      </div>
      <button onClick={onAddResource} style={S.primarySm}><span style={{ fontSize:16 }}>+</span> Add resource</button>
    </div>

    {/* Search */}
    <div style={{ display:'flex', gap:12, marginBottom:20 }}>
      <div style={{ position:'relative', flex:1 }}>
        <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:B.textMut }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input style={{ ...S.inp, paddingLeft:38, marginBottom:0 }} placeholder="Search resources..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
    </div>

    <p style={{ fontSize:14, color:B.primary, fontWeight:600, marginBottom:16 }}>{resources.length} result{resources.length!==1?'s':''} found</p>

    {resources.length === 0 ? (
      <div style={{ textAlign:'center', padding:'60px 20px', background:B.white, borderRadius:B.rLg, border:`1px solid ${B.border}` }}>
        <p style={{ fontSize:36, marginBottom:12 }}>📭</p>
        <p style={{ color:B.textSec, fontSize:14 }}>No resources in this category yet</p>
      </div>
    ) : (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {resources.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} onDelete={() => onDeleteResource(r.id)} onEdit={() => onEditResource(r)} />)}
      </div>
    )}
  </div>
}

/* ── RESOURCE CARD ── */
function ResourceCard({ resource: r, index, onDelete, onEdit }) {
  const [h, setH] = useState(false)
  const [expanded, setExpanded] = useState(false)

  return <div className="fu" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ background:B.white, border:`1px solid ${h ? B.primaryBorder : B.border}`, borderRadius:B.rLg, padding:'20px 24px',
      boxShadow: h ? B.shadowHover : B.shadow, transition:'all .25s', animationDelay:`${index*30}ms` }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div style={{ flex:1 }}>
        <h3 style={{ fontSize:17, fontWeight:600, marginBottom:6 }}>{r.name}</h3>
        {r.description && (
          <div>
            <p style={{ fontSize:14, color:B.textSec, lineHeight:1.6, marginBottom:4 }}>
              {expanded ? r.description : r.description.length > 150 ? r.description.slice(0,150)+'...' : r.description}
            </p>
            {r.description.length > 150 && <button onClick={()=>setExpanded(!expanded)} style={{ ...S.link, fontSize:13 }}>{expanded ? 'Show less' : 'Read more'}</button>}
          </div>
        )}
        {r.tags && r.tags.length > 0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>
          {r.tags.map((t,i) => <span key={i} style={{ fontSize:11, background:B.primaryMuted, color:B.primary, padding:'2px 10px', borderRadius:20, fontWeight:500 }}>{t}</span>)}
        </div>}
      </div>
      {h && <div style={{ display:'flex', gap:4, marginLeft:12, flexShrink:0 }}>
        <button onClick={onEdit} style={S.iconBtn} title="Edit">✎</button>
        <button onClick={onDelete} style={{ ...S.iconBtn, color:B.danger }} title="Delete">✕</button>
      </div>}
    </div>
    <div style={{ display:'flex', gap:8, marginTop:14 }}>
      {r.website_url && <a href={r.website_url} target="_blank" rel="noopener noreferrer"
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 20px', background:B.primary, color:'#fff', borderRadius:6, fontSize:13, fontWeight:600, textDecoration:'none' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Website
      </a>}
      {r.contact_email && <a href={`mailto:${r.contact_email}`}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 20px', background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:6, fontSize:13, fontWeight:500, textDecoration:'none' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 4-10 9L2 4"/></svg>
        Contact
      </a>}
    </div>
  </div>
}

/* ═══════ MODALS ═══════ */
function Modal({ title, sub, onClose, children, wide }) {
  return <div style={S.overlay} onClick={onClose}><div className="si" onClick={e=>e.stopPropagation()} style={{ ...S.modal, width: wide?640:480 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
      <div><h3 style={{ fontSize:17, fontWeight:600 }}>{title}</h3>{sub && <p style={{ fontSize:13, color:B.textSec, marginTop:2 }}>{sub}</p>}</div>
      <button onClick={onClose} style={S.closeBtn}>✕</button>
    </div>{children}</div></div>
}

function CollectionModal({ onClose, onSave }) {
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [ld, setLd] = useState(false)
  const go = async () => { if(!name.trim()) return; setLd(true)
    await supabase.from('collections').insert({ name:name.trim(), description:desc.trim()||null }); setLd(false); onSave() }
  return <Modal title="New collection" sub="Collections group categories into sections (e.g. 'AI Tools By Technology')" onClose={onClose}>
    <Label>Collection name</Label><Input placeholder="e.g. AI Tools By Technology" value={name} onChange={e=>setName(e.target.value)} autoFocus />
    <Label>Description (optional)</Label><Input placeholder="Brief description" value={desc} onChange={e=>setDesc(e.target.value)} />
    <Btn onClick={go} disabled={ld||!name.trim()}>{ld?'Creating...':'Create collection'}</Btn>
  </Modal>
}

function CategoryModal({ collections, onClose, onSave }) {
  const [name, setName] = useState(''); const [emoji, setEmoji] = useState('📁')
  const [desc, setDesc] = useState(''); const [colId, setColId] = useState(''); const [ld, setLd] = useState(false)
  const go = async () => { if(!name.trim()) return; setLd(true)
    await supabase.from('categories').insert({ name:name.trim(), emoji, description:desc.trim()||null, collection_id:colId||null }); setLd(false); onSave() }
  return <Modal title="New category" sub="Categories appear as emoji cards on the directory" onClose={onClose}>
    <div style={{ display:'flex', gap:12 }}>
      <div style={{ width:80 }}><Label>Emoji</Label><Input placeholder="📁" value={emoji} onChange={e=>setEmoji(e.target.value)} style={{ textAlign:'center', fontSize:24, padding:'8px' }} /></div>
      <div style={{ flex:1 }}><Label>Category name</Label><Input placeholder="e.g. Generative AI & LLMs" value={name} onChange={e=>setName(e.target.value)} autoFocus /></div>
    </div>
    <Label>Collection (optional)</Label>
    <Select value={colId} onChange={e=>setColId(e.target.value)}><option value="">No collection</option>{collections.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select>
    <Label>Description (optional)</Label><Input placeholder="Brief description" value={desc} onChange={e=>setDesc(e.target.value)} />
    <Btn onClick={go} disabled={ld||!name.trim()}>{ld?'Creating...':'Create category'}</Btn>
  </Modal>
}

function ResourceModal({ categories, prefillCatId, existing, onClose, onSave }) {
  const [name, setName] = useState(existing?.name || '')
  const [desc, setDesc] = useState(existing?.description || '')
  const [url, setUrl] = useState(existing?.website_url || '')
  const [email, setEmail] = useState(existing?.contact_email || '')
  const [catId, setCatId] = useState(existing?.category_id || prefillCatId || '')
  const [tags, setTags] = useState(existing?.tags?.join(', ') || '')
  const [ld, setLd] = useState(false); const [err, setErr] = useState('')

  const go = async () => {
    if (!name.trim()) return setErr('Name is required'); setLd(true); setErr('')
    const data = { name:name.trim(), description:desc.trim()||null, website_url:url.trim()||null, contact_email:email.trim()||null,
      category_id:catId||null, tags: tags ? tags.split(',').map(t=>t.trim()).filter(Boolean) : [] }
    if (existing) { const { error } = await supabase.from('resources').update(data).eq('id', existing.id); if(error){ setErr(error.message); setLd(false); return } }
    else { const { error } = await supabase.from('resources').insert(data); if(error){ setErr(error.message); setLd(false); return } }
    setLd(false); onSave()
  }

  return <Modal title={existing ? 'Edit resource' : 'Add resource'} sub="Add a tool, link, or resource to the directory" onClose={onClose}>
    {err && <ErrBox msg={err} />}
    <Label>Resource name *</Label><Input placeholder="e.g. ChatGPT" value={name} onChange={e=>setName(e.target.value)} autoFocus />
    <Label>Description</Label><textarea style={{ ...S.inp, height:80, resize:'vertical', fontFamily:'inherit' }} placeholder="What is this tool? Best applications and limitations..." value={desc} onChange={e=>setDesc(e.target.value)} />
    <Label>Website URL</Label><Input placeholder="https://..." value={url} onChange={e=>setUrl(e.target.value)} />
    <div style={{ display:'flex', gap:12 }}>
      <div style={{ flex:1 }}><Label>Contact email</Label><Input placeholder="contact@example.com" value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div style={{ flex:1 }}><Label>Category</Label><Select value={catId} onChange={e=>setCatId(e.target.value)}><option value="">None</option>{categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</Select></div>
    </div>
    <Label>Tags (comma separated)</Label><Input placeholder="e.g. GPT, Text Generation, Free" value={tags} onChange={e=>setTags(e.target.value)} />
    <Btn onClick={go} disabled={ld||!name.trim()}>{ld ? (existing?'Saving...':'Adding...') : (existing?'Save changes':'Add resource')}</Btn>
  </Modal>
}

/* ── MANAGE COLLECTIONS ── */
function ManageCollections({ collections, onClose, onRefresh, notify }) {
  return <Modal title="Manage collections" sub={`${collections.length} collection${collections.length!==1?'s':''}`} onClose={onClose} wide>
    {collections.length === 0 ? <p style={{ color:B.textMut, fontSize:14, padding:'20px 0', textAlign:'center' }}>No collections yet</p> :
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{collections.map(c => (
        <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:B.input, borderRadius:B.r }}>
          <div><div style={{ fontWeight:600, fontSize:14 }}>{c.name}</div>{c.description && <div style={{ fontSize:12, color:B.textMut }}>{c.description}</div>}</div>
          <button onClick={async()=>{if(confirm('Delete this collection?')){await supabase.from('collections').delete().eq('id',c.id);onRefresh();notify('Collection deleted')}}} style={{ ...S.iconBtn, color:B.danger }}>✕</button>
        </div>
      ))}</div>}
  </Modal>
}

/* ── MANAGE CATEGORIES ── */
function ManageCategories({ collections, categories, resources, onClose, onRefresh, notify }) {
  return <Modal title="Manage categories" sub={`${categories.length} categor${categories.length!==1?'ies':'y'}`} onClose={onClose} wide>
    {categories.length === 0 ? <p style={{ color:B.textMut, fontSize:14, padding:'20px 0', textAlign:'center' }}>No categories yet</p> :
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{categories.map(c => {
        const col = collections.find(co=>co.id===c.collection_id)
        const count = resources.filter(r=>r.category_id===c.id).length
        return <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:B.input, borderRadius:B.r }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:24 }}>{c.emoji||'📁'}</span>
            <div><div style={{ fontWeight:600, fontSize:14 }}>{c.name}</div><div style={{ fontSize:12, color:B.textMut }}>{col?col.name:'Ungrouped'} · {count} resource{count!==1?'s':''}</div></div>
          </div>
          <button onClick={async()=>{if(confirm('Delete this category?')){await supabase.from('categories').delete().eq('id',c.id);onRefresh();notify('Category deleted')}}} style={{ ...S.iconBtn, color:B.danger }}>✕</button>
        </div>
      })}</div>}
  </Modal>
}

/* ═══════ EMBED CODE ═══════ */
function EmbedModal({ collections, categories, onClose, onCopy }) {
  const [type, setType] = useState('all')
  const [catId, setCatId] = useState('')

  const code = (() => {
    let filter = ''
    if (type==='category' && catId) filter = `&category_id=eq.${catId}`

    return `<!-- AI Teaching Hub — Resource Directory Embed -->
<div id="hfu-directory"></div>
<script>
(function(){
  var D=document.getElementById('hfu-directory');
  var URL='${SB_URL}';var KEY='${SB_KEY}';
  D.innerHTML='<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif;color:#5A6478">Loading resources...</div>';
  fetch(URL+'/rest/v1/resources?select=*&order=created_at.desc${filter}',{headers:{apikey:KEY,Authorization:'Bearer '+KEY}})
  .then(function(r){return r.json()}).then(function(res){
    if(!res.length){D.innerHTML='<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif;color:#5A6478">No resources available.</div>';return}
    var w=document.createElement('div');w.style.cssText='font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
    var s=document.createElement('div');s.style.cssText='margin-bottom:16px;display:flex;gap:8px;';
    var si=document.createElement('input');si.placeholder='Search resources...';si.style.cssText='flex:1;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;';
    var sc=document.createElement('button');sc.textContent='Search';sc.style.cssText='padding:10px 20px;background:#1A6FB5;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;';
    s.appendChild(si);s.appendChild(sc);w.appendChild(s);
    var ct=document.createElement('div');ct.style.cssText='color:#1A6FB5;font-weight:600;font-size:14px;margin-bottom:16px;';
    ct.textContent=res.length+' result'+(res.length!==1?'s':'')+' found';w.appendChild(ct);
    var list=document.createElement('div');
    function render(items){list.innerHTML='';ct.textContent=items.length+' result'+(items.length!==1?'s':'')+' found';
      items.forEach(function(r){
        var c=document.createElement('div');c.style.cssText='background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:12px;transition:all .25s;';
        c.onmouseenter=function(){c.style.boxShadow='0 8px 24px rgba(26,111,181,.12)';c.style.borderColor='rgba(55,162,225,.3)'};
        c.onmouseleave=function(){c.style.boxShadow='none';c.style.borderColor='#e2e8f0'};
        var h='<h3 style="font-size:17px;font-weight:600;margin:0 0 6px">'+r.name+'</h3>';
        if(r.description)h+='<p style="font-size:14px;color:#5A6478;line-height:1.6;margin:0 0 12px">'+r.description+'</p>';
        var btns='<div style="display:flex;gap:8px;margin-top:14px">';
        if(r.website_url)btns+='<a href="'+r.website_url+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:#1A6FB5;color:#fff;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none">&#x2197; Website</a>';
        if(r.contact_email)btns+='<a href="mailto:'+r.contact_email+'" style="display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:#fff;color:#1A1A2E;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;font-weight:500;text-decoration:none">&#x2709; Contact</a>';
        btns+='</div>';c.innerHTML=h+btns;list.appendChild(c)
      })}
    render(res);w.appendChild(list);
    function doSearch(){var q=si.value.toLowerCase();render(res.filter(function(r){return r.name.toLowerCase().indexOf(q)!==-1||(r.description||'').toLowerCase().indexOf(q)!==-1}))}
    sc.onclick=doSearch;si.onkeyup=function(e){if(e.key==='Enter')doSearch()};
    D.innerHTML='';D.appendChild(w)
  }).catch(function(){D.innerHTML='<div style="text-align:center;padding:40px;color:#DC3545">Failed to load.</div>'})
})();
</script>`
  })()

  const copy = () => { navigator.clipboard.writeText(code); onCopy() }

  return <Modal title="Embed code" sub="Paste this code into any website to embed your resource directory" onClose={onClose} wide>
    <Label>What to embed</Label>
    <Select value={type} onChange={e=>{setType(e.target.value);setCatId('')}}>
      <option value="all">All resources</option><option value="category">Specific category</option>
    </Select>
    {type==='category' && <><Label>Category</Label><Select value={catId} onChange={e=>setCatId(e.target.value)}>
      <option value="">Select...</option>{categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
    </Select></>}
    <div style={{ background:B.input, border:`1px solid ${B.border}`, borderRadius:B.rLg, padding:16, marginBottom:16, maxHeight:180, overflow:'auto' }}>
      <pre style={{ margin:0, whiteSpace:'pre-wrap', wordBreak:'break-all', fontSize:11, color:B.textSec, lineHeight:1.6, fontFamily:"'SF Mono','Fira Code',monospace" }}>{code}</pre>
    </div>
    <Btn onClick={copy}>📋 Copy embed code</Btn>
  </Modal>
}

/* ═══════ UI PRIMITIVES ═══════ */
function Label({ children }) { return <label style={{ display:'block', fontSize:13, color:B.textSec, marginBottom:5, fontWeight:500 }}>{children}</label> }
function Input(props) { return <input {...props} style={{ ...S.inp, ...props.style }} /> }
function Select({ children, ...props }) { return <select {...props} style={S.sel}>{children}</select> }
function Btn({ children, ...props }) { return <button type="submit" {...props} style={{ ...S.primary, opacity:props.disabled?.5:1 }}>{children}</button> }
function BtnSec({ children, ...props }) { return <button {...props} style={{ ...S.secondary, ...props.style }}>{children}</button> }
function ErrBox({ msg }) { return <div style={{ background:B.dangerMut, border:'1px solid rgba(220,53,69,.15)', borderRadius:B.r, padding:'10px 14px', marginBottom:16, fontSize:13, color:B.danger }}>{msg}</div> }
function SuccessIcon() { return <div style={{ width:48, height:48, borderRadius:'50%', background:B.successMut, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:22, color:B.success }}>✓</div> }

const S = {
  inp: { width:'100%', padding:'10px 14px', background:B.input, border:`1px solid ${B.border}`, borderRadius:B.r, color:B.text, fontSize:14, marginBottom:16, boxSizing:'border-box', transition:'all .2s' },
  sel: { width:'100%', padding:'10px 14px', background:B.input, border:`1px solid ${B.border}`, borderRadius:B.r, color:B.text, fontSize:14, marginBottom:16, boxSizing:'border-box', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6478' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' },
  primary: { width:'100%', padding:'11px', background:B.primary, color:'#fff', border:'none', borderRadius:B.r, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  primarySm: { padding:'9px 18px', background:B.primary, color:'#fff', border:'none', borderRadius:B.r, fontSize:13, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, textDecoration:'none' },
  secondary: { padding:'10px 20px', background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:B.r, fontSize:14, fontWeight:500, cursor:'pointer' },
  link: { background:'none', border:'none', color:B.primary, fontSize:13, cursor:'pointer', fontWeight:500 },
  overlay: { position:'fixed', inset:0, zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(13,27,42,.5)', backdropFilter:'blur(4px)' },
  modal: { background:B.white, borderRadius:B.rXl, border:`1px solid ${B.border}`, padding:28, maxWidth:'92vw', maxHeight:'88vh', overflowY:'auto', boxShadow:B.shadowLg },
  closeBtn: { width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:B.input, border:'none', borderRadius:8, color:B.textMut, fontSize:16, flexShrink:0 },
  card: { background:B.white, borderRadius:B.rLg, border:`1px solid ${B.border}`, padding:32, boxShadow:B.shadow },
  iconBtn: { width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:B.input, border:'none', borderRadius:6, color:B.textMut, fontSize:13 },
}
