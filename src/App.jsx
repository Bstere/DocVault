import { useState, useEffect } from 'react'
import { supabase } from './supabase'
 
/* ───────────────────── APP ───────────────────── */
export default function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('login') // login | signup | forgot | dashboard
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setPage('dashboard')
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setPage('dashboard')
      else setPage('login')
    })
    return () => subscription.unsubscribe()
  }, [])
 
  if (loading) return <div style={styles.loadingScreen}><div style={styles.spinner} /><p style={{ color: '#7A8599', marginTop: 16 }}>Loading...</p></div>
 
  if (page === 'signup') return <SignUpPage onBack={() => setPage('login')} />
  if (page === 'forgot') return <ForgotPasswordPage onBack={() => setPage('login')} />
  if (page === 'dashboard' && session) return <Dashboard session={session} onLogout={async () => { await supabase.auth.signOut(); setSession(null); setPage('login') }} />
  return <LoginPage onLogin={() => {}} onForgot={() => setPage('forgot')} onSignUp={() => setPage('signup')} />
}
 
/* ───────────────────── LOGIN ───────────────────── */
function LoginPage({ onLogin, onForgot, onSignUp }) {
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
    <div style={styles.authBg}>
      <div style={styles.authCard}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <h1 style={styles.authTitle}>DocVault</h1>
          <p style={styles.authSubtitle}>Sign in to manage your documents</p>
        </div>
        <div style={styles.formBox}>
          {error && <div style={styles.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button type="button" onClick={onForgot} style={styles.linkBtn}>Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} style={styles.primaryBtn}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <p style={styles.switchText}>Don't have an account? <button onClick={onSignUp} style={styles.linkBtn}>Create one</button></p>
        </div>
      </div>
    </div>
  )
}
 
/* ───────────────────── SIGN UP ───────────────────── */
function SignUpPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
 
  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) return setError('Please fill in all fields')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords don\'t match')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signUp({ email, password })
    if (err) setError(err.message)
    else setDone(true)
    setLoading(false)
  }
 
  if (done) return (
    <div style={styles.authBg}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 20 }}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={{ color: '#E8ECF1', fontSize: 20, marginBottom: 8 }}>Check your email</h2>
        <p style={{ color: '#7A8599', fontSize: 14, marginBottom: 24 }}>We sent a confirmation link to <strong style={{ color: '#E8ECF1' }}>{email}</strong></p>
        <button onClick={onBack} style={styles.secondaryBtn}>Back to sign in</button>
      </div>
    </div>
  )
 
  return (
    <div style={styles.authBg}>
      <div style={styles.authCard}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={styles.authTitle}>Create account</h1>
          <p style={styles.authSubtitle}>Get started with DocVault</p>
        </div>
        <div style={styles.formBox}>
          {error && <div style={styles.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            <label style={styles.label}>Confirm password</label>
            <input style={styles.input} type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
            <button type="submit" disabled={loading} style={styles.primaryBtn}>{loading ? 'Creating...' : 'Create account'}</button>
          </form>
          <p style={styles.switchText}>Already have an account? <button onClick={onBack} style={styles.linkBtn}>Sign in</button></p>
        </div>
      </div>
    </div>
  )
}
 
/* ───────────────────── FORGOT PASSWORD ───────────────────── */
function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
 
  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email) return setError('Please enter your email')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email)
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }
 
  return (
    <div style={styles.authBg}>
      <div style={styles.authCard}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={styles.authTitle}>Reset password</h1>
          <p style={styles.authSubtitle}>We'll send you a reset link</p>
        </div>
        <div style={styles.formBox}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={styles.successIcon}>✓</div>
              <p style={{ color: '#7A8599', fontSize: 14, marginBottom: 20 }}>Reset link sent to <strong style={{ color: '#E8ECF1' }}>{email}</strong></p>
              <button onClick={onBack} style={styles.secondaryBtn}>Back to sign in</button>
            </div>
          ) : (
            <>
              {error && <div style={styles.errorBox}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, marginBottom: 12 }}>{loading ? 'Sending...' : 'Send reset link'}</button>
              </form>
              <button onClick={onBack} style={{ ...styles.secondaryBtn, width: '100%' }}>Back to sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
 
/* ───────────────────── DASHBOARD ───────────────────── */
function Dashboard({ session, onLogout }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [documents, setDocuments] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null) // { type: 'category' | 'subcategory' | 'document' | 'embed', data?: any }
  const [loading, setLoading] = useState(true)
 
  const fetchAll = async () => {
    const [cats, subs, docs] = await Promise.all([
      supabase.from('categories').select('*').order('created_at'),
      supabase.from('subcategories').select('*').order('created_at'),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
    ])
    setCategories(cats.data || [])
    setSubcategories(subs.data || [])
    setDocuments(docs.data || [])
    setLoading(false)
  }
 
  useEffect(() => { fetchAll() }, [])
 
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
 
  const filteredDocs = documents.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !selectedCat || d.category_id === selectedCat
    const matchSub = !selectedSub || d.subcategory_id === selectedSub
    return matchSearch && matchCat && matchSub
  })
 
  const getCatName = (id) => categories.find(c => c.id === id)?.name || ''
  const getSubName = (id) => subcategories.find(s => s.id === id)?.name || ''
  const filteredSubs = selectedCat ? subcategories.filter(s => s.category_id === selectedCat) : []
 
  if (loading) return <div style={styles.loadingScreen}><div style={styles.spinner} /><p style={{ color: '#7A8599', marginTop: 16 }}>Loading documents...</p></div>
 
  return (
    <div style={styles.dashboardWrap}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={styles.logoSmall}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>DocVault</span>
          </div>
        </div>
 
        <div style={{ padding: '0 12px', marginBottom: 8 }}>
          <button onClick={() => setModal({ type: 'category' })} style={styles.sidebarAddBtn}>+ New category</button>
        </div>
 
        <div style={styles.sidebarNav}>
          <button onClick={() => { setSelectedCat(null); setSelectedSub(null) }} style={{ ...styles.sidebarItem, background: !selectedCat ? 'rgba(79,140,255,0.12)' : 'transparent', color: !selectedCat ? '#4F8CFF' : '#7A8599' }}>
            📁 All documents
          </button>
          {categories.map(cat => (
            <div key={cat.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => { setSelectedCat(cat.id); setSelectedSub(null) }} style={{ ...styles.sidebarItem, flex: 1, background: selectedCat === cat.id && !selectedSub ? 'rgba(79,140,255,0.12)' : 'transparent', color: selectedCat === cat.id && !selectedSub ? '#4F8CFF' : '#E8ECF1' }}>
                  📂 {cat.name}
                </button>
                <button onClick={() => setModal({ type: 'subcategory', data: { category_id: cat.id } })} style={styles.sidebarSmallBtn} title="Add subcategory">+</button>
                <button onClick={async () => {
                  if (confirm('Delete this category and all its subcategories?')) {
                    await supabase.from('categories').delete().eq('id', cat.id)
                    fetchAll(); showToast('Category deleted')
                    if (selectedCat === cat.id) { setSelectedCat(null); setSelectedSub(null) }
                  }
                }} style={styles.sidebarSmallBtn} title="Delete category">×</button>
              </div>
              {selectedCat === cat.id && subcategories.filter(s => s.category_id === cat.id).map(sub => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => setSelectedSub(sub.id)} style={{ ...styles.sidebarItem, flex: 1, paddingLeft: 36, fontSize: 13, background: selectedSub === sub.id ? 'rgba(79,140,255,0.12)' : 'transparent', color: selectedSub === sub.id ? '#4F8CFF' : '#7A8599' }}>
                    └ {sub.name}
                  </button>
                  <button onClick={async () => {
                    if (confirm('Delete this subcategory?')) {
                      await supabase.from('subcategories').delete().eq('id', sub.id)
                      fetchAll(); showToast('Subcategory deleted')
                      if (selectedSub === sub.id) setSelectedSub(null)
                    }
                  }} style={styles.sidebarSmallBtn} title="Delete subcategory">×</button>
                </div>
              ))}
            </div>
          ))}
        </div>
 
        <div style={styles.sidebarFooter}>
          <span style={{ fontSize: 13, color: '#7A8599' }}>{session.user.email}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </div>
 
      {/* Main content */}
      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <input style={styles.searchInput} placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setModal({ type: 'embed' })} style={styles.secondaryBtn}>⟨/⟩ Embed code</button>
            <button onClick={() => setModal({ type: 'document' })} style={styles.primaryBtnSm}>+ Upload document</button>
          </div>
        </div>
 
        <div style={styles.breadcrumb}>
          <span onClick={() => { setSelectedCat(null); setSelectedSub(null) }} style={styles.breadcrumbLink}>All documents</span>
          {selectedCat && <><span style={{ color: '#4A5568' }}> / </span><span onClick={() => setSelectedSub(null)} style={styles.breadcrumbLink}>{getCatName(selectedCat)}</span></>}
          {selectedSub && <><span style={{ color: '#4A5568' }}> / </span><span style={{ color: '#E8ECF1' }}>{getSubName(selectedSub)}</span></>}
          <span style={{ color: '#4A5568', marginLeft: 8 }}>({filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''})</span>
        </div>
 
        {filteredDocs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📄</div>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6, color: '#E8ECF1' }}>No documents yet</h3>
            <p style={{ color: '#7A8599', fontSize: 14, marginBottom: 20 }}>Upload your first document to get started</p>
            <button onClick={() => setModal({ type: 'document' })} style={styles.primaryBtnSm}>+ Upload document</button>
          </div>
        ) : (
          <div style={styles.docGrid}>
            {filteredDocs.map(doc => (
              <div key={doc.id} style={styles.docCard}>
                <div style={styles.docThumb}>
                  {doc.thumbnail_url ? (
                    <img src={doc.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px 10px 0 0' }} />
                  ) : (
                    <div style={styles.docThumbPlaceholder}>
                      {doc.file_type === 'pdf' ? '📕' : doc.file_type === 'image' ? '🖼️' : '📄'}
                    </div>
                  )}
                  <span style={styles.fileTypeBadge}>{doc.file_type || 'file'}</span>
                </div>
                <div style={styles.docInfo}>
                  <h4 style={styles.docName}>{doc.name}</h4>
                  {doc.description && <p style={styles.docDesc}>{doc.description}</p>}
                  <div style={styles.docMeta}>
                    {doc.category_id && <span style={styles.catBadge}>{getCatName(doc.category_id)}</span>}
                    {doc.subcategory_id && <span style={styles.subBadge}>{getSubName(doc.subcategory_id)}</span>}
                  </div>
                  <div style={styles.docActions}>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={styles.viewBtn}>View</a>
                    <button onClick={async () => {
                      if (confirm('Delete this document?')) {
                        await supabase.from('documents').delete().eq('id', doc.id)
                        fetchAll(); showToast('Document deleted')
                      }
                    }} style={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
 
      {/* Modals */}
      {modal?.type === 'category' && <CategoryModal onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); showToast('Category created') }} />}
      {modal?.type === 'subcategory' && <SubcategoryModal categoryId={modal.data.category_id} onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); showToast('Subcategory created') }} />}
      {modal?.type === 'document' && <DocumentModal categories={categories} subcategories={subcategories} onClose={() => setModal(null)} onSave={() => { fetchAll(); setModal(null); showToast('Document uploaded') }} />}
      {modal?.type === 'embed' && <EmbedModal categories={categories} subcategories={subcategories} supabaseUrl="https://oguvjvdoirfwexnhkqnf.supabase.co" supabaseKey="sb_publishable_vvvryO7vRZaml_870oaJyQ_n9pEmNAw" onClose={() => setModal(null)} onCopy={() => showToast('Embed code copied!')} />}
 
      {toast && <div style={{ ...styles.toast, borderLeftColor: toast.type === 'success' ? '#34D399' : '#FF5F5F' }}>{toast.message}</div>}
    </div>
  )
}
 
/* ───────────────────── CATEGORY MODAL ───────────────────── */
function CategoryModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
 
  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    await supabase.from('categories').insert({ name: name.trim(), description: desc.trim() || null })
    setLoading(false)
    onSave()
  }
 
  return (
    <ModalWrap title="New category" onClose={onClose}>
      <label style={styles.label}>Name</label>
      <input style={styles.input} placeholder="e.g. Contracts" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <label style={styles.label}>Description (optional)</label>
      <input style={styles.input} placeholder="Brief description" value={desc} onChange={e => setDesc(e.target.value)} />
      <button onClick={handleSave} disabled={loading || !name.trim()} style={styles.primaryBtn}>{loading ? 'Creating...' : 'Create category'}</button>
    </ModalWrap>
  )
}
 
/* ───────────────────── SUBCATEGORY MODAL ───────────────────── */
function SubcategoryModal({ categoryId, onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
 
  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    await supabase.from('subcategories').insert({ name: name.trim(), description: desc.trim() || null, category_id: categoryId })
    setLoading(false)
    onSave()
  }
 
  return (
    <ModalWrap title="New subcategory" onClose={onClose}>
      <label style={styles.label}>Name</label>
      <input style={styles.input} placeholder="e.g. Q1 Reports" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <label style={styles.label}>Description (optional)</label>
      <input style={styles.input} placeholder="Brief description" value={desc} onChange={e => setDesc(e.target.value)} />
      <button onClick={handleSave} disabled={loading || !name.trim()} style={styles.primaryBtn}>{loading ? 'Creating...' : 'Create subcategory'}</button>
    </ModalWrap>
  )
}
 
/* ───────────────────── DOCUMENT UPLOAD MODAL ───────────────────── */
function DocumentModal({ categories, subcategories, onClose, onSave }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [catId, setCatId] = useState('')
  const [subId, setSubId] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
 
  const filteredSubs = catId ? subcategories.filter(s => s.category_id === catId) : []
 
  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (['pdf'].includes(ext)) return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
    if (['doc', 'docx'].includes(ext)) return 'word'
    if (['xls', 'xlsx'].includes(ext)) return 'excel'
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint'
    return 'file'
  }
 
  const handleUpload = async () => {
    if (!name.trim() || !file) return setError('Name and file are required')
    setLoading(true); setError('')
 
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadErr } = await supabase.storage.from('documents').upload(fileName, file)
      if (uploadErr) throw uploadErr
 
      // Get public URL
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
 
      // Generate thumbnail for images
      let thumbnailUrl = null
      if (getFileType(file.name) === 'image') {
        thumbnailUrl = urlData.publicUrl
      }
 
      // Insert document record
      const { error: insertErr } = await supabase.from('documents').insert({
        name: name.trim(),
        description: desc.trim() || null,
        category_id: catId || null,
        subcategory_id: subId || null,
        file_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        file_type: getFileType(file.name),
      })
      if (insertErr) throw insertErr
 
      onSave()
    } catch (err) {
      setError(err.message || 'Upload failed')
    }
    setLoading(false)
  }
 
  return (
    <ModalWrap title="Upload document" onClose={onClose}>
      {error && <div style={styles.errorBox}>{error}</div>}
      <label style={styles.label}>Document name</label>
      <input style={styles.input} placeholder="e.g. Q1 Financial Report" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <label style={styles.label}>Description (optional)</label>
      <input style={styles.input} placeholder="Brief description" value={desc} onChange={e => setDesc(e.target.value)} />
      <label style={styles.label}>Category (optional)</label>
      <select style={styles.select} value={catId} onChange={e => { setCatId(e.target.value); setSubId('') }}>
        <option value="">No category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {filteredSubs.length > 0 && (
        <>
          <label style={styles.label}>Subcategory (optional)</label>
          <select style={styles.select} value={subId} onChange={e => setSubId(e.target.value)}>
            <option value="">No subcategory</option>
            {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </>
      )}
      <label style={styles.label}>File</label>
      <div style={styles.fileDropZone}>
        <input type="file" onChange={e => setFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.svg" />
        {file ? (
          <p style={{ color: '#E8ECF1', fontSize: 14 }}>📎 {file.name}</p>
        ) : (
          <>
            <p style={{ color: '#7A8599', fontSize: 14 }}>📁 Click to select a file</p>
            <p style={{ color: '#4A5568', fontSize: 12, marginTop: 4 }}>PDF, Word, Excel, PowerPoint, Images</p>
          </>
        )}
      </div>
      <button onClick={handleUpload} disabled={loading || !name.trim() || !file} style={styles.primaryBtn}>{loading ? 'Uploading...' : 'Upload document'}</button>
    </ModalWrap>
  )
}
 
/* ───────────────────── EMBED CODE MODAL ───────────────────── */
function EmbedModal({ categories, subcategories, supabaseUrl, supabaseKey, onClose, onCopy }) {
  const [embedType, setEmbedType] = useState('all') // all | category | subcategory
  const [embedCatId, setEmbedCatId] = useState('')
  const [embedSubId, setEmbedSubId] = useState('')
 
  const filteredSubs = embedCatId ? subcategories.filter(s => s.category_id === embedCatId) : []
 
  const generateEmbedCode = () => {
    let filter = ''
    if (embedType === 'category' && embedCatId) filter = `&category_id=${embedCatId}`
    if (embedType === 'subcategory' && embedSubId) filter = `&subcategory_id=${embedSubId}`
 
    return `<!-- DocVault Embed Widget -->
<div id="docvault-embed"></div>
<script>
(function() {
  var SUPABASE_URL = '${supabaseUrl}';
  var SUPABASE_KEY = '${supabaseKey}';
  var FILTER = '${filter}';
 
  var container = document.getElementById('docvault-embed');
  container.innerHTML = '<p style="text-align:center;color:#888;font-family:sans-serif;">Loading documents...</p>';
 
  var query = SUPABASE_URL + '/rest/v1/documents?select=*&order=created_at.desc' + FILTER;
 
  fetch(query, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
  })
  .then(function(r) { return r.json(); })
  .then(function(docs) {
    if (!docs.length) {
      container.innerHTML = '<p style="text-align:center;color:#888;font-family:sans-serif;">No documents available.</p>';
      return;
    }
 
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;font-family:-apple-system,sans-serif;';
 
    docs.forEach(function(doc) {
      var card = document.createElement('a');
      card.href = doc.file_url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style.cssText = 'display:block;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;text-decoration:none;color:#1a202c;transition:box-shadow 0.2s;background:#fff;';
      card.onmouseenter = function() { card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; };
      card.onmouseleave = function() { card.style.boxShadow = 'none'; };
 
      var thumb = document.createElement('div');
      thumb.style.cssText = 'height:140px;background:#f7fafc;display:flex;align-items:center;justify-content:center;overflow:hidden;';
      if (doc.thumbnail_url) {
        var img = document.createElement('img');
        img.src = doc.thumbnail_url;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        thumb.appendChild(img);
      } else {
        thumb.innerHTML = '<span style="font-size:40px;">' + (doc.file_type === 'pdf' ? '📕' : doc.file_type === 'image' ? '🖼️' : '📄') + '</span>';
      }
 
      var info = document.createElement('div');
      info.style.cssText = 'padding:12px;';
      info.innerHTML = '<h4 style="margin:0 0 4px;font-size:14px;font-weight:600;">' + doc.name + '</h4>' +
        (doc.description ? '<p style="margin:0;font-size:12px;color:#718096;">' + doc.description + '</p>' : '') +
        '<span style="display:inline-block;margin-top:8px;font-size:11px;background:#edf2f7;color:#4a5568;padding:2px 8px;border-radius:4px;">' + (doc.file_type || 'file') + '</span>';
 
      card.appendChild(thumb);
      card.appendChild(info);
      grid.appendChild(card);
    });
 
    container.innerHTML = '';
    container.appendChild(grid);
  })
  .catch(function() {
    container.innerHTML = '<p style="text-align:center;color:#e53e3e;font-family:sans-serif;">Failed to load documents.</p>';
  });
})();
</script>`
  }
 
  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    onCopy()
  }
 
  return (
    <ModalWrap title="Generate embed code" onClose={onClose} wide>
      <p style={{ color: '#7A8599', fontSize: 14, marginBottom: 16 }}>Copy this code and paste it into your website's HTML to display your documents.</p>
 
      <label style={styles.label}>What to embed</label>
      <select style={styles.select} value={embedType} onChange={e => { setEmbedType(e.target.value); setEmbedCatId(''); setEmbedSubId('') }}>
        <option value="all">All documents</option>
        <option value="category">Specific category</option>
        <option value="subcategory">Specific subcategory</option>
      </select>
 
      {embedType === 'category' && (
        <>
          <label style={styles.label}>Category</label>
          <select style={styles.select} value={embedCatId} onChange={e => setEmbedCatId(e.target.value)}>
            <option value="">Select a category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </>
      )}
 
      {embedType === 'subcategory' && (
        <>
          <label style={styles.label}>Category</label>
          <select style={styles.select} value={embedCatId} onChange={e => { setEmbedCatId(e.target.value); setEmbedSubId('') }}>
            <option value="">Select a category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {filteredSubs.length > 0 && (
            <>
              <label style={styles.label}>Subcategory</label>
              <select style={styles.select} value={embedSubId} onChange={e => setEmbedSubId(e.target.value)}>
                <option value="">Select a subcategory</option>
                {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </>
          )}
        </>
      )}
 
      <div style={styles.codeBlock}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12, color: '#A0AEC0', lineHeight: 1.5 }}>{generateEmbedCode()}</pre>
      </div>
 
      <button onClick={handleCopy} style={styles.primaryBtn}>📋 Copy embed code</button>
    </ModalWrap>
  )
}
 
/* ───────────────────── MODAL WRAPPER ───────────────────── */
function ModalWrap({ title, onClose, children, wide }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, width: wide ? 600 : 460 }} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ fontSize: 17, fontWeight: 500 }}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
 
/* ───────────────────── STYLES ───────────────────── */
const styles = {
  // Auth
  authBg: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 20%, rgba(79,140,255,0.06) 0%, transparent 60%), #0B0E11' },
  authCard: { width: 400, maxWidth: '90vw' },
  authTitle: { fontSize: 28, fontWeight: 400, color: '#E8ECF1', fontFamily: 'Georgia, serif', marginBottom: 4 },
  authSubtitle: { color: '#7A8599', fontSize: 14 },
  logo: { width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #4F8CFF, #7C5CFF)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoSmall: { width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4F8CFF, #7C5CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formBox: { background: '#12161C', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
  label: { display: 'block', fontSize: 13, color: '#7A8599', marginBottom: 6, fontWeight: 500 },
  input: { width: '100%', padding: '12px 14px', background: '#0F1318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#E8ECF1', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 14px', background: '#0F1318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#E8ECF1', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box', appearance: 'none' },
  primaryBtn: { width: '100%', padding: '12px', background: '#4F8CFF', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s' },
  primaryBtnSm: { padding: '10px 20px', background: '#4F8CFF', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' },
  secondaryBtn: { padding: '10px 20px', background: '#1A1F27', color: '#E8ECF1', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  linkBtn: { background: 'none', border: 'none', color: '#4F8CFF', fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#7A8599' },
  errorBox: { background: 'rgba(255,95,95,0.1)', border: '1px solid rgba(255,95,95,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#FF5F5F' },
  successIcon: { width: 48, height: 48, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#34D399', fontSize: 22 },
 
  // Dashboard
  dashboardWrap: { display: 'flex', height: '100vh', background: '#0B0E11', color: '#E8ECF1' },
  sidebar: { width: 260, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', background: '#0F1318', flexShrink: 0 },
  sidebarHeader: { padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  sidebarAddBtn: { width: '100%', padding: '8px', background: 'rgba(79,140,255,0.1)', color: '#4F8CFF', border: '1px solid rgba(79,140,255,0.2)', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginTop: 12 },
  sidebarNav: { flex: 1, overflow: 'auto', padding: '8px 0' },
  sidebarItem: { width: '100%', padding: '8px 16px', border: 'none', fontSize: 14, cursor: 'pointer', textAlign: 'left', borderRadius: 6, margin: '1px 8px', transition: 'background 0.15s', display: 'block', boxSizing: 'border-box' },
  sidebarSmallBtn: { background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 16, padding: '4px 8px', lineHeight: 1 },
  sidebarFooter: { padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { background: 'none', border: 'none', color: '#FF5F5F', fontSize: 13, cursor: 'pointer' },
  mainContent: { flex: 1, overflow: 'auto', padding: '24px 32px' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16 },
  searchInput: { width: '100%', maxWidth: 360, padding: '10px 14px', background: '#12161C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#E8ECF1', fontSize: 14, outline: 'none' },
  breadcrumb: { marginBottom: 24, fontSize: 13, color: '#7A8599' },
  breadcrumbLink: { cursor: 'pointer', color: '#7A8599', transition: 'color 0.15s' },
 
  // Document grid
  docGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  docCard: { background: '#12161C', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', transition: 'border-color 0.2s' },
  docThumb: { height: 140, background: '#1A1F27', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  docThumbPlaceholder: { fontSize: 40 },
  fileTypeBadge: { position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#E8ECF1', padding: '2px 8px', borderRadius: 4, fontSize: 11, textTransform: 'uppercase' },
  docInfo: { padding: 14 },
  docName: { fontSize: 14, fontWeight: 500, marginBottom: 4 },
  docDesc: { fontSize: 12, color: '#7A8599', marginBottom: 8 },
  docMeta: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  catBadge: { fontSize: 11, background: 'rgba(79,140,255,0.12)', color: '#4F8CFF', padding: '2px 8px', borderRadius: 4 },
  subBadge: { fontSize: 11, background: 'rgba(52,211,153,0.12)', color: '#34D399', padding: '2px 8px', borderRadius: 4 },
  docActions: { display: 'flex', gap: 8 },
  viewBtn: { fontSize: 12, color: '#4F8CFF', textDecoration: 'none', padding: '4px 10px', background: 'rgba(79,140,255,0.1)', borderRadius: 6 },
  deleteBtn: { fontSize: 12, color: '#FF5F5F', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px' },
 
  // Empty state
  emptyState: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
 
  // Modal
  overlay: { position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' },
  modal: { background: '#12161C', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 28, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn: { background: 'none', border: 'none', color: '#7A8599', cursor: 'pointer', fontSize: 18 },
 
  // File upload
  fileDropZone: { position: 'relative', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 10, padding: '24px', textAlign: 'center', marginBottom: 16, background: '#0F1318' },
 
  // Code block
  codeBlock: { background: '#0B0E11', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginBottom: 16, maxHeight: 200, overflow: 'auto' },
 
  // Toast
  toast: { position: 'fixed', bottom: 24, right: 24, zIndex: 2000, background: '#1A1F27', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #34D399', borderRadius: 10, padding: '14px 20px', fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', animation: 'slideIn 0.3s ease' },
 
  // Loading
  loadingScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0B0E11' },
  spinner: { width: 32, height: 32, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#4F8CFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
}
 
// Add keyframes via style tag
if (typeof document !== 'undefined' && !document.getElementById('docvault-styles')) {
  const styleTag = document.createElement('style')
  styleTag.id = 'docvault-styles'
  styleTag.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0B0E11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    ::selection { background: #4F8CFF; color: white; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #4A5568; border-radius: 3px; }
    input:focus, select:focus { border-color: #4F8CFF !important; }
    button:hover { opacity: 0.9; }
  `
  document.head.appendChild(styleTag)
}
