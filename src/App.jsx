import { useEffect, useMemo, useState } from 'react'
import { getCategoryKey, normalizeCategoryName, parseMenuItemName, splitDisplayName } from './menuFormat'

const API_URL = (import.meta.env.VITE_API_URL || 'https://canoe-backend.onrender.com/api').replace(/\/$/, '')

const readApiResponse = async (response) => {
  const body = await response.text()

  try {
    return body ? JSON.parse(body) : {}
  } catch {
    if (response.status === 404) {
      throw new Error('Credential changes are not available on the deployed backend yet. Deploy the latest Canoe-backend and try again.')
    }

    throw new Error(`The server returned an unexpected response (${response.status}).`)
  }
}

const CATEGORY_IMAGES = {
  'All dishes': { src: '/all dishes.jpg', alt: 'All dishes' },
  Breakfast: { src: '/breakfast.jpg', alt: 'Breakfast dishes' },
  'Fasting Foods': { src: '/fasting.jpg', alt: 'Fasting dishes' },
  'Non-Fasting Foods': { src: '/non fasting.jpg', alt: 'Non-fasting dishes' },
  Burger: { src: '/burger.jpg', alt: 'Freshly prepared burger' },
  Noodles: { src: '/noodels.jpg', alt: 'Noodle dishes' },
  Pizza: { src: '/pizza.jpg', alt: 'Freshly baked pizza' },
  Snack: { src: '/snack.jpg', alt: 'Snacks' },
  Fish: { src: '/fish.jpg', alt: 'Fish dishes' },
  Juice: { src: '/juice.png', alt: 'Fresh juice' },
  'Hot Drinks': { src: '/hot drinks.jpg', alt: 'Hot drinks' },
  'Soft Drinks': { src: '/soft drinks.jpg', alt: 'Soft drinks' },
  Extras: { src: '/extra.jpg', alt: 'Extra items' },
  Extra: { src: '/extra.jpg', alt: 'Extra items' },
  'Cold Drinks': { src: '/mohito.jpg', alt: 'Mojito drink' },
  Salad: { src: '/salad.jpg', alt: 'Fresh salad' },
  Soup: { src: '/soup.jpg', alt: 'Soup' },
  'Cream Cake': { src: '/cream cake.jpg', alt: 'Cream cake' },
  'Canoe Special Cake': { src: '/canoe special cake.jpg', alt: 'Canoe special cake' },
  'Canoe Special': { src: '/canoe special cake.jpg', alt: 'Canoe special cake' },
  'Canoe Special Torta Cake': { src: '/canoe special torta cake.jpg', alt: 'Canoe special torta cake' },
  'Torta Cake': { src: '/torta cake.jpg', alt: 'Torta cake' },
  Cookies: { src: '/cookies.jpg', alt: 'Cookies' },
}

function CommentsTable({ comments, removeComment }) {
  const safeComments = Array.isArray(comments) ? comments : []

  return (
    <section className="mx-auto mt-6 sm:mt-8 max-w-[1400px] rounded-none border border-[#d8cabb] bg-[#f9f3eb] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="mb-[6px] sm:mb-[10px] text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-[#b66b45]" style={{ fontFamily: '"DM Mono", monospace' }}>Guest feedback</p>
          <h3 className="m-0 text-[20px] sm:text-[26px] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>Customer comments</h3>
        </div>
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>{safeComments.length} comments</span>
      </div>

      {safeComments.length ? (
        <div className="space-y-3 sm:space-y-4">
          {safeComments.map((comment) => (
            <article key={comment.id} className="border border-[#d8cabb] bg-[#f7efe6] p-3 sm:p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(53,29,23,0.06)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <strong className="min-w-0 truncate text-[13px] sm:text-[14px] text-[#2e1b16]">{comment.name || 'Anonymous guest'}</strong>
                <span className="shrink-0 text-[9px] sm:text-[10px] uppercase tracking-[0.08em] text-[#907b6b]" style={{ fontFamily: '"DM Mono", monospace' }}>{comment.rating ? `${comment.rating}/5 stars` : 'No rating'}</span>
              </div>
              <p className="m-0 break-words text-[12px] sm:text-[13px] leading-[1.6] sm:leading-[1.7] text-[#5a433b]">{comment.text}</p>
              <div className="mt-3">
                <button type="button" onClick={() => removeComment(comment.id)} className="border border-[#a44935] bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#a44935] transition-colors hover:bg-[#a44935] hover:text-white">Delete comment</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="m-0 text-[12px] text-[#88766b]">Customer comments will appear here after guests submit a review.</p>
      )}
    </section>
  )
}

function App() {
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [comments, setComments] = useState([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All dishes')
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [view, setView] = useState('menu')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showCredentialForm, setShowCredentialForm] = useState(false)
  const [currentAdminEmail, setCurrentAdminEmail] = useState('')
  const [currentAdminPassword, setCurrentAdminPassword] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('')
  const [credentialMessage, setCredentialMessage] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showCategoryCreator, setShowCategoryCreator] = useState(false)
  const [showAddDishForm, setShowAddDishForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', amharicName: '', category: '', price: '' })
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingItemValue, setEditingItemValue] = useState(null)
  const [draggedCategory, setDraggedCategory] = useState(null)
  const [draggedMenuItemId, setDraggedMenuItemId] = useState(null)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentRating, setCommentRating] = useState(0)
  const [commentMessage, setCommentMessage] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [adminMessage, setAdminMessage] = useState('')
  const [adminSearch, setAdminSearch] = useState('')
  const [adminCategory, setAdminCategory] = useState('All categories')

  const categoryOptions = useMemo(() => (Array.isArray(categories) ? categories.filter((category) => category !== 'All dishes') : []), [categories])
  const activeCategoryImage = CATEGORY_IMAGES[getCategoryKey(activeCategory)]

  const formatCombinedName = (item = {}) => {
    const parsedName = splitDisplayName(item.name || item.amharicName || '')
    const amharicName = String(item.amharicName || parsedName.amharicName || '').trim()
    const englishName = String(item.name || parsedName.name || '').trim()

    if (amharicName && englishName) return `${amharicName} / ${englishName}`
    return amharicName || englishName
  }

const refreshData = async () => {
  try {
    const [menuRes, commentsRes] = await Promise.all([
      fetch(`${API_URL}/menu`),
      fetch(`${API_URL}/comments`),
    ])

    if (!menuRes.ok) throw new Error(`Menu request failed (${menuRes.status})`)
    const menuData = await menuRes.json()

    const rawMenu = Array.isArray(menuData) ? menuData : (menuData.menu || [])
    const rawCategories = Array.isArray(menuData) ? [] : (menuData.categories || [])

    setCategories(rawCategories.map((category) => normalizeCategoryName(typeof category === 'object' ? category.name : category)))

    setMenuItems(rawMenu.map((item) => ({
      ...item,
      category: normalizeCategoryName(item.category),
      name: splitDisplayName(item.name || item.amharicName || '').name || item.name || item.amharicName || '',
      amharicName: splitDisplayName(item.name || item.amharicName || '').amharicName || item.amharicName || '',
    })))

    // Comments are loaded separately so a failure here never blocks the menu
    try {
      const commentsData = await commentsRes.json()
      setComments(Array.isArray(commentsData) ? commentsData : (commentsData.comments || []))
    } catch (commentsError) {
      console.error('Failed to load comments', commentsError)
    }
  } catch (error) {
    console.error('Failed to load data', error)
  }
}

  useEffect(() => {
    refreshData()
  }, [])

  const orderedMenuItems = useMemo(() => {
    const categoryOrder = new Map(categoryOptions.map((category, index) => [getCategoryKey(category), index]))

    return [...menuItems].sort((first, second) => {
      const firstIndex = categoryOrder.get(getCategoryKey(first.category)) ?? Number.MAX_SAFE_INTEGER
      const secondIndex = categoryOrder.get(getCategoryKey(second.category)) ?? Number.MAX_SAFE_INTEGER

      if (firstIndex !== secondIndex) return firstIndex - secondIndex
      return String(first.name).localeCompare(String(second.name))
    })
  }, [categoryOptions, menuItems])

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return orderedMenuItems.filter((item) => {
      const matchesCategory = activeCategory === 'All dishes' || getCategoryKey(item.category) === getCategoryKey(activeCategory)
      const itemText = `${item.name || ''} ${item.amharicName || ''} ${item.category || ''}`.toLowerCase()
      const matchesQuery = !normalizedQuery || itemText.includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, orderedMenuItems, query])

  const adminFilteredMenu = useMemo(() => {
    const normalizedQuery = adminSearch.trim().toLowerCase()
    return orderedMenuItems.filter((item) => {
      const matchesCategory = adminCategory === 'All categories' || getCategoryKey(item.category) === getCategoryKey(adminCategory)
      const itemText = `${item.name || ''} ${item.amharicName || ''} ${item.category || ''}`.toLowerCase()
      const matchesQuery = !normalizedQuery || itemText.includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [adminCategory, adminSearch, orderedMenuItems])

  const adminCategoryIsEmpty = adminCategory !== 'All categories' && !orderedMenuItems.some((item) => getCategoryKey(item.category) === getCategoryKey(adminCategory))

  const handleAddCategory = async (event) => {
    event.preventDefault()
    const trimmedCategory = newCategory.trim()
    if (!trimmedCategory) return

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedCategory }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to add category.')
      setCategories(data.categories || [])
      setNewCategory('')
      setShowCategoryCreator(false)
      setNewItem((current) => ({ ...current, category: (data.categories || [])[data.categories.length - 1] || current.category }))
      setAdminCategory('All categories')
    } catch (error) {
      setAdminMessage(error.message || 'Unable to add category.')
    }
  }

  const handleAddDish = async (event) => {
    event.preventDefault()
    const parsedName = splitDisplayName(newItem.name || '')
    const englishName = parsedName.name.trim()
    const amharicName = parsedName.amharicName.trim()
    const combinedName = englishName || amharicName

    if (!combinedName) {
      setAdminMessage('Add a name in English, Amharic, or both using the format: Amharic / English.')
      return
    }

    if (!newItem.price.trim()) {
      setAdminMessage('Price is required.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: englishName || amharicName,
          amharicName,
          category: normalizeCategoryName(newItem.category),
          price: newItem.price.trim(),
          description: '',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to add menu item.')
      setMenuItems(data.menu || [])
      setCategories(data.categories || [])
      setNewItem({ name: '', amharicName: '', category: (data.categories || [])[0] || '', price: '' })
      setShowCategoryCreator(false)
      setShowAddDishForm(false)
      setNewCategory('')
    } catch (error) {
      setAdminMessage(error.message || 'Unable to add menu item.')
    }
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    const trimmedName = commentName.trim()
    const trimmedText = commentText.trim()

    if (!trimmedText) {
      setCommentMessage('Comment is required.')
      return
    }

    if (trimmedName && !/^[A-Za-z\s'-]+$/.test(trimmedName)) {
      setCommentMessage('Name can only contain letters, spaces, apostrophes, and hyphens.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, text: trimmedText, rating: commentRating }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to send comment.')
      setComments(data.comments || [])
      setReviewSubmitted(true)
      setCommentMessage(data.message || 'Sent successfully. Thank you dear customer.')
      setCommentName('')
      setCommentText('')
      setCommentRating(0)
    } catch (error) {
      setCommentMessage(error.message || 'Unable to send comment.')
    }
  }

  const handleAdminLogin = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Incorrect email or password.')
      setIsAdmin(true)
      setView('admin')
      setShowAdminLogin(false)
      setLoginError('')
      await refreshData()
    } catch (error) {
      setLoginError(error.message || 'Incorrect email or password.')
    }
  }

  const handleCredentialChange = async (event) => {
    event.preventDefault()
    setCredentialMessage('')

    if (newAdminPassword !== confirmAdminPassword) {
      setCredentialMessage('New passwords do not match.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/change-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: currentAdminEmail,
          currentPassword: currentAdminPassword,
          newEmail: newAdminEmail,
          newPassword: newAdminPassword,
        }),
      })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.message || 'Unable to update credentials.')

      setAdminEmail(newAdminEmail)
      setAdminPassword('')
      setShowCredentialForm(false)
      setCurrentAdminEmail('')
      setCurrentAdminPassword('')
      setNewAdminEmail('')
      setNewAdminPassword('')
      setConfirmAdminPassword('')
      setLoginError(data.message || 'Credentials updated successfully. Please log in.')
    } catch (error) {
      setCredentialMessage(error.message || 'Unable to update credentials.')
    }
  }

  const saveMenuEdit = async () => {
    if (!editingItemValue) return

    const parsedName = parseMenuItemName(formatCombinedName(editingItemValue))
    const payload = {
      ...editingItemValue,
      ...parsedName,
      name: parsedName.name,
      amharicName: parsedName.amharicName,
    }

    try {
      const response = await fetch(`${API_URL}/menu/${editingItemValue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to update item.')
      setMenuItems(data.menu || [])
      setCategories(data.categories || [])
      setEditingItemId(null)
      setEditingItemValue(null)
    } catch (error) {
      setAdminMessage(error.message || 'Unable to update item.')
    }
  }

  const deleteMenuItem = async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/menu/${itemId}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to delete item.')
      setMenuItems(data.menu || [])
    } catch (error) {
      setAdminMessage(error.message || 'Unable to delete item.')
    }
  }

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to delete comment.')
      setComments(data.comments || [])
    } catch (error) {
      setAdminMessage(error.message || 'Unable to delete comment.')
    }
  }

  const deleteCategory = async (categoryName) => {
    try {
      const response = await fetch(`${API_URL}/categories/${encodeURIComponent(categoryName)}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to delete category.')
      setCategories(data.categories || [])
      setMenuItems(data.menu || [])
      setActiveCategory('All dishes')
      setAdminCategory('All categories')
    } catch (error) {
      setAdminMessage(error.message || 'Unable to delete category.')
    }
  }

  const logoutAdmin = () => {
    setIsAdmin(false)
    setView('menu')
    setEditingItemId(null)
    setEditingItemValue(null)
    setShowAdminLogin(false)
    setAdminSearch('')
    setAdminCategory('All categories')
  }

  return (
    <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f2e6d4] text-[#2e1b16]">
      {view === 'menu' ? (
        <>
          <header className="flex h-14 items-center justify-between overflow-hidden bg-[#1d0e0a]/95 px-2.5 text-[#f5ecdf] sm:h-[78px] sm:px-[clamp(24px,6vw,92px)]">
            <a href="#top" aria-label="Canoe home" className="flex shrink-0 items-center text-inherit no-underline">
              <span className="flex items-center justify-center bg-transparent p-0 text-[clamp(26px,3vw,42px)] font-black tracking-[-0.08em] text-[#f0b06d] sm:text-[clamp(32px,4vw,54px)]" style={{ fontFamily: '"Playfair Display", serif' }}>
                canoe
              </span>
            </a>

            <button
              type="button"
              onClick={() => document.querySelector('[data-menu-grid]')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-0 bg-[#d98324] px-2.5 py-2 text-[9.5px] font-semibold text-[#1a1208] shadow-[0_4px_14px_rgba(217,131,36,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(217,131,36,0.5)] sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-[14px]"
            >
              View menu <span className="text-[12px] text-[#d29b71] sm:text-[18px]">↓</span>
            </button>
          </header>

          <section id="top" className="relative h-[230px] w-full overflow-hidden bg-[#351d17] text-[#f7f1e8] sm:h-auto">
            <video
              className="absolute inset-0 block h-full w-full min-h-full object-cover brightness-110 contrast-115 saturate-115"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Canoe interior ambience video"
            >
              <source src="/video_2026-09-25_21-46-29.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,12,9,0.68),rgba(22,12,9,0.42)_30%,rgba(22,12,9,0.5)),radial-gradient(circle_at_right,rgba(178,108,69,0.3),transparent_36%)] sm:bg-[linear-gradient(90deg,rgba(22,12,9,0.72),rgba(22,12,9,0.5)_30%,rgba(22,12,9,0.58)),radial-gradient(circle_at_right,rgba(178,108,69,0.35),transparent_36%)]" aria-hidden="true" />
            <div className="relative z-10 mx-auto flex h-full max-w-[1220px] flex-col items-start justify-center gap-3 px-4 py-6 sm:h-auto sm:min-h-[410px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-[clamp(24px,11vw,170px)] sm:py-[77px]">
              <div className="min-w-0 max-w-full">
                <p className="mb-1.5 text-[8.5px] uppercase tracking-[0.16em] text-[#e7b287] sm:mb-[22px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Bahirdar</p>
                <h1 className="m-0 max-w-full break-words text-[clamp(28px,10vw,88px)] leading-[0.98] tracking-[-0.05em] text-[#f7f1e8]" style={{ fontFamily: '"Playfair Display", serif' }}>
                  <span className="mb-1 block text-[0.5em] font-medium tracking-[-0.04em] sm:mb-[10px]">Welcome to</span>
                  <em className="not-italic text-[#f1c093]">Canoe</em>
                </h1>
                <p className="mt-2.5 max-w-[240px] text-[11px] leading-[1.6] text-white/85 sm:mt-[29px] sm:max-w-[290px] sm:text-[13px] sm:leading-[1.7]">
                  A warm table for bright mornings, long lunches, and evenings that take their time.
                </p>
              </div>

              <div className="relative mr-[7%] hidden h-[157px] w-[157px] -rotate-[9deg] flex-col items-center justify-center rounded-full border border-[#eac4a5]/70 bg-[#141209]/25 text-[#f0d0ad] shadow-[0_20px_55px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:flex">
                <div className="absolute inset-[8px] rounded-full border border-[#eac4a5]/70" />
                <span className="relative text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: '"DM Mono", monospace' }}>CAFE</span>
                <strong className="relative my-[3px] mb-[6px] text-[20px]" style={{ fontFamily: '"Playfair Display", serif' }}>CANOE</strong>
                <small className="relative text-[8px] uppercase tracking-[0.08em]">eat · drink · linger</small>
              </div>
            </div>
          </section>

          <section aria-label="Canoe menu" className="mx-auto max-w-[1220px] px-4 py-[44px] sm:px-[clamp(24px,6vw,92px)] sm:py-[87px]">
            <div className="mb-4 flex flex-col gap-2 sm:mb-[34px] sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <p className="mb-2 text-[9px] uppercase tracking-[0.16em] text-[#b66b45] sm:mb-[12px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>From our kitchen</p>
                <h2 className="m-0 text-[26px] leading-[1.02] tracking-[-0.03em] text-[#2e1b16] sm:text-[clamp(34px,4vw,52px)] sm:leading-none sm:tracking-[-0.04em]" style={{ fontFamily: '"Playfair Display", serif' }}>Find your favorite</h2>
              </div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.08em] text-[#907b6b] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>{filteredItems.length} dishes</p>
            </div>

            <div className="mb-5 sm:mb-[26px]">
              <label className="block text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Search dishes</label>
              <div className="mt-2 flex items-center gap-3 border border-[#d8cabb] bg-[#fffaf4] px-3 py-3 shadow-[0_6px_20px_rgba(53,29,23,0.03)]">
                <span aria-hidden="true" className="text-[18px] text-[#b66b45] sm:text-[20px]">⌕</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by dish or category" className="w-full border-0 bg-transparent text-[13px] text-[#2e1b16] outline-none placeholder:text-[#9d8a7c]" />
              </div>
            </div>

            {/* Mobile: custom dropdown, fully styleable, no side scroll */}
            <div className="relative mt-5 sm:hidden">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={categoryMenuOpen}
                className="flex w-full items-center justify-between rounded-none border border-[#d8cabb] bg-[#fffaf4] px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-[#351d17] outline-none focus:border-[#b66b45]"
                style={{ fontFamily: '"DM Mono", monospace' }}
              >
                <span className="truncate">{activeCategory}</span>
                <span aria-hidden="true" className={`ml-2 shrink-0 text-[10px] text-[#b66b45] transition-transform duration-200 ${categoryMenuOpen ? '-rotate-180' : ''}`}>▾</span>
              </button>

              {categoryMenuOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Close category menu"
                    onClick={() => setCategoryMenuOpen(false)}
                    className="fixed inset-0 z-20 cursor-default border-0 bg-transparent p-0"
                  />
                  <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[280px] overflow-y-auto border border-[#d8cabb] bg-[#fffaf4] shadow-[0_16px_36px_rgba(53,29,23,0.22)]"
                  >
                    {['All dishes', ...categoryOptions].map((category) => (
                      <li key={category}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeCategory === category}
                          onClick={() => { setActiveCategory(category); setCategoryMenuOpen(false) }}
                          className={[
                            'block w-full border-b border-[#eee1d3] px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em] transition-colors last:border-b-0',
                            activeCategory === category ? 'bg-[#351d17] text-[#f7f1e8]' : 'text-[#351d17] hover:bg-[#f0e4d5]',
                          ].join(' ')}
                          style={{ fontFamily: '"DM Mono", monospace' }}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

            {/* Desktop / tablet: tab bar */}
            <nav aria-label="Menu categories" className="mt-[30px] hidden w-full gap-[18px] overflow-x-auto border-b border-[#d8cabb] pb-[17px] pt-[30px] sm:flex md:gap-[27px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['All dishes', ...categoryOptions].map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={[
                    'relative shrink-0 whitespace-nowrap border-0 bg-transparent pb-[7px] text-[11px] uppercase tracking-[0.08em] transition',
                    activeCategory === category ? 'text-[#351d17] after:absolute after:-bottom-[18px] after:left-0 after:right-0 after:h-[2px] after:bg-[#b66b45]' : 'text-[#8d796c] hover:text-[#351d17]',
                  ].join(' ')}
                  style={{ fontFamily: '"DM Mono", monospace' }}
                >
                  {category}
                </button>
              ))}
            </nav>

            {activeCategoryImage ? (
              <section aria-label={`${activeCategory} category image`} className="relative mt-5 h-[138px] overflow-hidden sm:mt-[30px] sm:h-[190px]">
                <img src={encodeURI(activeCategoryImage.src)} alt={activeCategoryImage.alt} className="absolute right-0 top-0 h-full w-[62%] object-cover object-center sm:w-[43%]" style={{ clipPath: 'ellipse(100% 100% at 100% 50%)' }} />
              </section>
            ) : null}

            {filteredItems.length ? (
              <div data-menu-grid className="mt-5 grid grid-cols-1 gap-x-[16px] gap-y-0 sm:mt-[30px] sm:grid-cols-2 sm:gap-x-[22px] xl:grid-cols-3">
                {filteredItems.map((item, index) => (
                  <article
                    key={item.id || item.name}
                    className="relative min-h-[128px] w-full border-b border-[#d8cabb] pb-[16px] pr-[14px] pt-[16px] transition-colors hover:border-[#b66b45]/50 sm:min-h-[164px] sm:pb-[22px] sm:pr-[28px] sm:pt-[22px]"
                    style={{ animation: 'rise 0.5s both', animationDelay: `${index * 35}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[8.5px] uppercase tracking-[0.08em] text-[#b66b45] sm:text-[9px]" style={{ fontFamily: '"DM Mono", monospace' }}>{item.category}</span>
                      <span className="text-[12px] font-medium text-[#351d17] sm:text-[14px]" style={{ fontFamily: '"DM Mono", monospace' }}>{item.price}</span>
                    </div>
                    <div className="mt-2.5 mb-1.5 sm:mt-[14px] sm:mb-[7px]">
                      {item.amharicName ? (
                        <>
                          <h3 className="m-0 break-words text-[clamp(15px,4.5vw,22px)] leading-tight tracking-[-0.03em] text-[#2e1b16]" style={{ fontFamily: '"Noto Sans Ethiopic", "DM Mono", monospace' }}>{item.amharicName}</h3>
                          {item.name ? (
                            <p className="m-0 mt-1 text-[10.5px] uppercase tracking-[0.04em] text-[#6a5249] sm:text-[12px]" style={{ fontFamily: '"DM Mono", monospace' }}>{item.name}</p>
                          ) : null}
                        </>
                      ) : (
                        <h3 className="m-0 text-[clamp(17px,5vw,22px)] leading-tight tracking-[-0.03em] text-[#2e1b16]" style={{ fontFamily: '"Playfair Display", serif' }}>{item.name}</h3>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-[48px] text-center sm:py-[80px]">
                <span className="text-[36px] text-[#b66b45] sm:text-[45px]">⌕</span>
                <h3 className="mt-[10px] mb-0 text-[22px] text-[#2e1b16] sm:text-[28px]" style={{ fontFamily: '"Playfair Display", serif' }}>No dishes found</h3>
                <p className="mt-2 text-[12px] text-[#88766b]">Try another search or browse all dishes.</p>
                <button type="button" onClick={() => { setQuery(''); setActiveCategory('All dishes') }} className="mt-3 border-0 bg-[#351d17] px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-white transition hover:bg-[#241209]">Reset menu</button>
              </div>
            )}
          </section>

          <section aria-labelledby="review-heading" className="mx-4 grid gap-8 border-t border-[#d8cabb] py-9 sm:mx-[clamp(24px,6vw,92px)] sm:gap-[70px] sm:py-[72px] md:grid-cols-[minmax(220px,0.8fr)_minmax(300px,1.2fr)]">
            <div>
              <p className="mb-2 text-[9px] uppercase tracking-[0.16em] text-[#b66b45] sm:mb-[12px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>A word from you</p>
              <h2 id="review-heading" className="m-0 text-[24px] leading-[1.05] tracking-[-0.03em] text-[#2e1b16] sm:text-[clamp(32px,4vw,48px)] sm:leading-none sm:tracking-[-0.04em]" style={{ fontFamily: '"Playfair Display", serif' }}>How was your visit?</h2>
              <p className="mt-3 max-w-[230px] text-[11.5px] leading-[1.6] text-[#88766b] sm:mt-5 sm:max-w-[250px] sm:text-[12px] sm:leading-[1.7]">Tell us what you enjoyed, or what we can make even better.</p>
            </div>

            {reviewSubmitted ? (
              <div className="self-center border border-[#d8cabb] bg-[#f7f1e8] p-5 sm:p-[30px]" role="status">
                <span aria-hidden="true" className="text-[22px] text-[#b66b45] sm:text-[26px]">✓</span>
                <h3 className="mt-3 mb-1.5 text-[22px] text-[#2e1b16] sm:mt-[12px] sm:mb-[6px] sm:text-[26px]" style={{ fontFamily: '"Playfair Display", serif' }}>Sent successfully.</h3>
                <p className="m-0 mb-4 text-[12px] text-[#88766b] sm:mb-5">Thank you dear customer.</p>
                <button type="button" onClick={() => setReviewSubmitted(false)} className="inline-flex items-center justify-between border-0 bg-[#351d17] px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#241209] sm:py-[15px]">Write another review <span className="ml-2 text-[17px] text-[#d29b71]">↗</span></button>
              </div>
            ) : (
              <form className="grid max-w-[520px] gap-3.5 sm:gap-[18px]" onSubmit={handleCommentSubmit}>
                <fieldset className="m-0 border-0 p-0">
                  <legend className="mb-2 text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:mb-[10px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Rate your visit</legend>
                  <div className="flex gap-1 sm:gap-[5px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCommentRating(star)}
                        aria-label={`${star} star${star === 1 ? '' : 's'}`}
                        aria-pressed={star === commentRating}
                        className={[
                          'border-0 bg-transparent p-0 text-[24px] leading-none transition hover:-translate-y-0.5 sm:text-[29px]',
                          star <= commentRating ? 'text-[#b66b45]' : 'text-[#d8cabb]',
                        ].join(' ')}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="grid gap-1.5 sm:gap-2">
                  <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Name <small className="text-[#a18d7e] normal-case">(optional)</small></span>
                  <input value={commentName} onChange={(event) => setCommentName(event.target.value)} type="text" placeholder="Your name" className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3.5 py-3 text-[13px] text-[#2e1b16] outline-none placeholder:text-[#a18d7e] focus:border-[#b66b45] sm:px-[15px] sm:py-[14px]" />
                </label>

                <label className="grid gap-1.5 sm:gap-2">
                  <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Comment</span>
                  <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} required rows="4" placeholder="Share your experience" className="w-full resize-y border border-[#d8cabb] bg-[#f7f1e8] px-3.5 py-3 text-[13px] text-[#2e1b16] outline-none placeholder:text-[#a18d7e] focus:border-[#b66b45] sm:px-[15px] sm:py-[14px]" />
                </label>

                {commentMessage ? <p className="m-0 text-[11px] text-[#a44935]" role="alert">{commentMessage}</p> : null}

                <button type="submit" className="inline-flex w-[145px] items-center justify-between border-0 bg-[#351d17] px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#241209] sm:w-[155px] sm:px-[17px] sm:py-[15px]">
                  Submit review <span className="text-[17px] text-[#d29b71]">↗</span>
                </button>
              </form>
            )}
          </section>

          <footer className="mx-4 flex flex-col items-center gap-2 border-t border-[#d8cabb] py-5 text-[9px] uppercase tracking-[0.1em] text-[#907b6b] sm:mx-[clamp(24px,6vw,92px)] sm:flex-row sm:items-center sm:justify-between sm:py-[24px]" style={{ fontFamily: '"DM Mono", monospace' }}>
            <span>CANOE CAFE</span>
            <span>Made for lingering.</span>
            <button type="button" onClick={() => { setShowAdminLogin(true); setShowCredentialForm(false); setLoginError(''); setCredentialMessage('') }} className="border-0 bg-transparent p-0 text-[#cfc2b7] uppercase tracking-[inherit] transition-colors hover:text-[#9b897b]">Admin login</button>
          </footer>

          {showAdminLogin ? (
            <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#351d17]/60 p-5 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAdminLogin(false) }}>
              {showCredentialForm ? (
                <form onSubmit={handleCredentialChange} className="relative w-full max-w-[420px] bg-[#efe6d8] p-6 shadow-[0_20px_60px_rgba(42,22,17,0.24)] sm:p-[38px]">
                  <button type="button" onClick={() => setShowAdminLogin(false)} aria-label="Close change credentials" className="absolute right-[14px] top-[13px] border-0 bg-transparent text-[22px] leading-none text-[#907b6b] sm:right-[18px] sm:top-[17px] sm:text-[25px]">×</button>
                  <p className="mb-2.5 text-[9px] uppercase tracking-[0.16em] text-[#b66b45] sm:mb-[12px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Canoe management</p>
                  <h2 className="m-0 mb-5 text-[28px] text-[#2e1b16] sm:mb-[28px] sm:text-[36px]" style={{ fontFamily: '"Playfair Display", serif' }}>Change credentials</h2>

                  <label className="mb-4 grid gap-1.5 sm:mb-[17px] sm:gap-2">
                    <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Current email</span>
                    <input autoFocus type="email" value={currentAdminEmail} onChange={(event) => setCurrentAdminEmail(event.target.value)} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                  </label>

                  <label className="mb-4 grid gap-1.5 sm:mb-[17px] sm:gap-2">
                    <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Current password</span>
                    <input type="password" value={currentAdminPassword} onChange={(event) => setCurrentAdminPassword(event.target.value)} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                  </label>

                  <label className="mb-4 grid gap-1.5 sm:mb-[17px] sm:gap-2">
                    <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>New email</span>
                    <input type="email" value={newAdminEmail} onChange={(event) => setNewAdminEmail(event.target.value)} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                  </label>

                  <label className="mb-4 grid gap-1.5 sm:mb-[17px] sm:gap-2">
                    <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>New password</span>
                    <input type="password" value={newAdminPassword} onChange={(event) => setNewAdminPassword(event.target.value)} minLength={4} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                  </label>

                  <label className="mb-4 grid gap-1.5 sm:mb-[17px] sm:gap-2">
                    <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Confirm new password</span>
                    <input type="password" value={confirmAdminPassword} onChange={(event) => setConfirmAdminPassword(event.target.value)} minLength={4} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                  </label>

                  {credentialMessage ? <p className="-mt-1 mb-4 text-[11px] text-[#a44935]" role="alert">{credentialMessage}</p> : null}

                  <button type="submit" className="inline-flex w-full items-center justify-between border-0 bg-[#351d17] px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#241209] sm:px-[17px] sm:py-[15px]">
                    Save credentials <span className="text-[17px] text-[#d29b71]">↗</span>
                  </button>
                  <button type="button" onClick={() => { setShowCredentialForm(false); setCredentialMessage('') }} className="mt-3 w-full border-0 bg-transparent py-2 text-[10px] uppercase tracking-[0.08em] text-[#907b6b]">Back to login</button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="relative w-full max-w-[420px] bg-[#efe6d8] p-6 shadow-[0_20px_60px_rgba(42,22,17,0.24)] sm:p-[38px]">
                <button type="button" onClick={() => setShowAdminLogin(false)} aria-label="Close admin login" className="absolute right-[14px] top-[13px] border-0 bg-transparent text-[22px] leading-none text-[#907b6b] sm:right-[18px] sm:top-[17px] sm:text-[25px]">×</button>
                <p className="mb-2.5 text-[9px] uppercase tracking-[0.16em] text-[#b66b45] sm:mb-[12px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Canoe management</p>
                <h2 className="m-0 mb-5 text-[28px] text-[#2e1b16] sm:mb-[28px] sm:text-[36px]" style={{ fontFamily: '"Playfair Display", serif' }}>Admin login</h2>

                <label className="mb-4 grid gap-1.5 sm:mb-[17px] sm:gap-2">
                  <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Email</span>
                  <input autoFocus type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                </label>

                <label className="mb-4 grid gap-1.5 sm:mb-[17px] sm:gap-2">
                  <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Password</span>
                  <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} required className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                </label>

                {loginError ? <p className="-mt-1 mb-4 text-[11px] text-[#a44935]" role="alert">{loginError}</p> : null}

                <button type="submit" className="inline-flex w-full items-center justify-between border-0 bg-[#351d17] px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#241209] sm:px-[17px] sm:py-[15px]">
                  Login <span className="text-[17px] text-[#d29b71]">↗</span>
                </button>
                <button type="button" onClick={() => { setShowCredentialForm(true); setCredentialMessage('') }} className="mt-4 w-full border-0 bg-transparent py-2 text-[10px] uppercase tracking-[0.08em] text-[#907b6b]">Change email or password</button>
              </form>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <section aria-labelledby="admin-heading" className="min-h-screen bg-[#f7f1e8] px-4 py-5 sm:px-[clamp(24px,6vw,92px)] sm:py-[32px]">
          <header className="mx-auto flex max-w-[1400px] flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-8">
            <div>
              <p className="mb-1.5 text-[9px] uppercase tracking-[0.16em] text-[#b66b45] sm:mb-[8px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Signed in as admin</p>
              <h2 id="admin-heading" className="m-0 text-[24px] leading-[1.05] tracking-[-0.03em] text-[#2e1b16] sm:text-[clamp(30px,4vw,46px)] sm:leading-none sm:tracking-[-0.04em]" style={{ fontFamily: '"Playfair Display", serif' }}>Manage menu</h2>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button type="button" onClick={() => setView('menu')} className="flex-1 border border-[#d8cabb] bg-transparent px-3 py-2.5 text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:flex-none sm:px-[13px] sm:py-[11px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Back to menu</button>
              <button type="button" onClick={logoutAdmin} className="flex-1 border border-[#d8cabb] bg-transparent px-3 py-2.5 text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:flex-none sm:px-[13px] sm:py-[11px] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Log out</button>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] rounded-[14px] border border-[#d8cabb] bg-[#f5eadf] p-3 shadow-[0_10px_28px_rgba(53,29,23,0.04)] sm:p-4">
            <div className="mb-4 rounded-[10px] border border-[#d8cabb] bg-[#f4e9de] p-3 sm:mb-[26px]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="m-0 text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Categories</p>
                {showCategoryCreator ? null : (
                  <button type="button" onClick={() => setShowCategoryCreator(true)} className="border border-[#351d17] bg-[#351d17] px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#f7f1e8]" style={{ fontFamily: '"DM Mono", monospace' }}>+ New</button>
                )}
              </div>

              {showCategoryCreator ? (
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                  <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New category name" className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleAddCategory} className="border border-[#351d17] bg-[#351d17] px-4 py-3 text-[9px] uppercase tracking-[0.06em] text-[#f7f1e8]" style={{ fontFamily: '"DM Mono", monospace' }}>Create</button>
                    <button type="button" onClick={() => { setShowCategoryCreator(false); setNewCategory('') }} className="border border-[#d8cabb] bg-transparent px-4 py-3 text-[9px] uppercase tracking-[0.06em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Close</button>
                  </div>
                </div>
              ) : null}

              {categoryOptions.length ? (
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      type="button"
                      draggable
                      onClick={() => setAdminCategory(category)}
                      onDragStart={() => setDraggedCategory(category)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={async () => {
                        if (!draggedCategory || draggedCategory === category) return
                        const next = [...categoryOptions]
                        const from = next.indexOf(draggedCategory)
                        const to = next.indexOf(category)
                        if (from < 0 || to < 0) return
                        const [moved] = next.splice(from, 1)
                        next.splice(to, 0, moved)
                        setCategories(next)
                        try {
                          await fetch(`${API_URL}/categories/reorder`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ order: next }),
                          })
                        } catch (error) {
                          console.error(error)
                        }
                        setDraggedCategory(null)
                      }}
                      className={[
                        'cursor-move rounded-full border px-3 py-2 text-[9px] uppercase tracking-[0.08em]',
                        adminCategory === category ? 'border-[#351d17] bg-[#351d17] text-[#f7f1e8]' : 'border-[#d8cabb] bg-[#fffaf4] text-[#351d17]',
                      ].join(' ')}
                      style={{ fontFamily: '"DM Mono", monospace' }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span>{category}</span>
                        <span
                          aria-label={`Delete ${category}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteCategory(category)
                          }}
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[11px] leading-none"
                        >
                          ×
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mb-5 flex flex-col gap-4 sm:mb-[24px] lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <label className="block text-[9.5px] uppercase tracking-[0.08em] text-[#351d17] sm:text-[10px]" style={{ fontFamily: '"DM Mono", monospace' }}>Search menu</label>
                <div className="mt-2 flex items-center gap-3 border border-[#d8cabb] bg-[#f7efe6] px-3 py-3">
                  <span aria-hidden="true" className="text-[18px] text-[#b66b45] sm:text-[20px]">⌕</span>
                  <input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search dish or category" className="w-full border-0 bg-transparent text-[13px] text-[#2e1b16] outline-none placeholder:text-[#9d8a7c]" />
                </div>
              </div>
            </div>

            {showAddDishForm ? (
              <form onSubmit={handleAddDish} className="border-t border-[#d8cabb] pt-5 sm:pt-[24px]">
                <div className="grid gap-2.5 md:grid-cols-[1.6fr_1.2fr_0.7fr]">
                  <input aria-label="New dish name" placeholder="Name (English / Amharic)" value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value, amharicName: '' })} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                  <select aria-label="New dish category" value={newItem.category} onChange={(event) => {
                    const nextValue = event.target.value
                    if (nextValue === '__new__') {
                      setShowCategoryCreator(true)
                      return
                    }
                    setShowCategoryCreator(false)
                    setNewItem({ ...newItem, category: nextValue })
                  }} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]">
                    {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                    <option value="__new__">New category...</option>
                  </select>
                  <input aria-label="New dish price" placeholder="Price" value={newItem.price} onChange={(event) => setNewItem({ ...newItem, price: event.target.value })} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-3 py-3 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button type="submit" className="border border-[#351d17] bg-[#351d17] px-4 py-3 text-[9px] uppercase tracking-[0.06em] text-[#f7f1e8]" style={{ fontFamily: '"DM Mono", monospace' }}>Add</button>
                  <button type="button" onClick={() => {
                    setShowAddDishForm(false)
                    setNewItem({ name: '', amharicName: '', category: categoryOptions[0] || '', price: '' })
                  }} className="border border-[#d8cabb] bg-transparent px-4 py-3 text-[9px] uppercase tracking-[0.06em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>Close</button>
                </div>
              </form>
            ) : null}

            {/* Desktop / tablet: full table, no scroll needed at normal widths */}
            <div className="mt-6 hidden overflow-x-auto border-t border-[#d8cabb] pt-4 sm:mt-[28px] sm:block sm:pt-[20px]">
              <table className="w-full min-w-0 border-collapse">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.08em] text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>
                    <th className="border-b border-[#d8cabb] p-3">Dish</th>
                    <th className="border-b border-[#d8cabb] p-3">Category</th>
                    <th className="border-b border-[#d8cabb] p-3">Price</th>
                    <th className="border-b border-[#d8cabb] p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCategoryIsEmpty && !adminSearch.trim() ? (
                    <tr>
                      <td colSpan={4} className="border-b border-[#d8cabb] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[12px] text-[#88766b]">No dishes in this category yet.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddDishForm(true)
                              setNewItem({ name: '', amharicName: '', category: adminCategory, price: '' })
                            }}
                            className="border border-[#351d17] bg-[#351d17] px-2.5 py-2 text-[11px] leading-none text-[#f7f1e8]"
                            aria-label={`Add new dish in ${adminCategory}`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    adminFilteredMenu.map((item) => {
                      const isEditing = editingItemId === item.id

                      return (
                        <tr key={item.id} draggable onDragStart={() => setDraggedMenuItemId(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={async () => {
                          if (!draggedMenuItemId || draggedMenuItemId === item.id) return
                          const currentOrder = [...menuItems]
                          const sourceIndex = currentOrder.findIndex((entry) => entry.id === draggedMenuItemId)
                          const targetIndex = currentOrder.findIndex((entry) => entry.id === item.id)
                          if (sourceIndex < 0 || targetIndex < 0) return
                          const next = [...currentOrder]
                          const [moved] = next.splice(sourceIndex, 1)
                          next.splice(targetIndex, 0, moved)
                          setMenuItems(next)
                          try {
                            await fetch(`${API_URL}/menu/reorder`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ order: next.map((entry) => entry.id) }),
                            })
                          } catch (error) {
                            console.error(error)
                          }
                          setDraggedMenuItemId(null)
                        }} className="align-top">
                          {isEditing ? (
                            <>
                              <td className="border-b border-[#d8cabb] p-3">
                                <div className="space-y-2">
                                  <input value={formatCombinedName(editingItemValue)} onChange={(event) => {
                                    const parsed = parseMenuItemName(event.target.value)
                                    setEditingItemValue((current) => ({ ...current, ...parsed }))
                                  }} className="w-full border border-[#d8cabb] bg-[#f7efe6] px-2 py-2 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" placeholder="Name (English / Amharic)" />
                                </div>
                              </td>
                              <td className="border-b border-[#d8cabb] p-3">
                                <select value={editingItemValue?.category || ''} onChange={(event) => setEditingItemValue((current) => ({ ...current, category: event.target.value }))} className="w-full border border-[#d8cabb] bg-[#f7efe6] px-2 py-2 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]">
                                  {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                                </select>
                              </td>
                              <td className="border-b border-[#d8cabb] p-3"><input value={editingItemValue?.price || ''} onChange={(event) => setEditingItemValue((current) => ({ ...current, price: event.target.value }))} className="w-full border border-[#d8cabb] bg-[#f7efe6] px-2 py-2 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" /></td>
                              <td className="border-b border-[#d8cabb] p-3">
                                <div className="flex gap-2">
                                  <button type="button" onClick={saveMenuEdit} className="border border-[#351d17] bg-[#351d17] px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#f7f1e8]">Save</button>
                                  <button type="button" onClick={() => { setEditingItemId(null); setEditingItemValue(null) }} className="border border-[#d8cabb] bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#351d17]">Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="border-b border-[#d8cabb] p-3 text-[12px] text-[#2e1b16]">
                                <div className="space-y-1">
                                  {item.amharicName ? (
                                    <>
                                      <div style={{ fontFamily: '"Noto Sans Ethiopic", "DM Mono", monospace' }}>{item.amharicName}</div>
                                      {item.name ? <div className="text-[#6e574f]">{item.name}</div> : null}
                                    </>
                                  ) : (
                                    <div>{item.name}</div>
                                  )}
                                </div>
                              </td>
                              <td className="border-b border-[#d8cabb] p-3 text-[12px] text-[#2e1b16] break-words">{item.category}</td>
                              <td className="border-b border-[#d8cabb] p-3 text-[12px] text-[#2e1b16] break-words">{item.price}</td>
                              <td className="border-b border-[#d8cabb] p-3">
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => { setShowAddDishForm(true); setNewItem({ name: '', amharicName: '', category: item.category, price: '' }) }} className="border border-[#351d17] bg-[#351d17] px-2.5 py-2 text-[11px] leading-none text-[#f7f1e8]" aria-label={`Add new dish in ${item.category}`}>+</button>
                                  <button type="button" onClick={() => { setEditingItemId(item.id); setEditingItemValue({ ...item }) }} className="border border-[#d8cabb] bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#351d17]">Edit</button>
                                  <button type="button" onClick={() => deleteMenuItem(item.id)} className="border border-[#a44935] bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#a44935]">Delete</button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards, everything visible with no side scroll */}
            <div className="mt-6 space-y-3 border-t border-[#d8cabb] pt-4 sm:hidden">
              {adminCategoryIsEmpty && !adminSearch.trim() ? (
                <div className="border border-[#d8cabb] bg-[#f7efe6] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-[#88766b]">No dishes in this category yet.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddDishForm(true)
                        setNewItem({ name: '', amharicName: '', category: adminCategory, price: '' })
                      }}
                      className="border border-[#351d17] bg-[#351d17] px-2.5 py-2 text-[11px] leading-none text-[#f7f1e8]"
                      aria-label={`Add new dish in ${adminCategory}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                adminFilteredMenu.map((item) => {
                  const isEditing = editingItemId === item.id

                  return (
                    <div key={item.id} className="border border-[#d8cabb] bg-[#f7efe6] p-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input value={formatCombinedName(editingItemValue)} onChange={(event) => {
                            const parsed = parseMenuItemName(event.target.value)
                            setEditingItemValue((current) => ({ ...current, ...parsed }))
                          }} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-2 py-2 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" placeholder="Name (English / Amharic)" />
                          <select value={editingItemValue?.category || ''} onChange={(event) => setEditingItemValue((current) => ({ ...current, category: event.target.value }))} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-2 py-2 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]">
                            {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                          </select>
                          <input value={editingItemValue?.price || ''} onChange={(event) => setEditingItemValue((current) => ({ ...current, price: event.target.value }))} className="w-full border border-[#d8cabb] bg-[#f7f1e8] px-2 py-2 text-[12px] text-[#2e1b16] outline-none focus:border-[#b66b45]" placeholder="Price" />
                          <div className="flex gap-2 pt-1">
                            <button type="button" onClick={saveMenuEdit} className="flex-1 border border-[#351d17] bg-[#351d17] px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#f7f1e8]">Save</button>
                            <button type="button" onClick={() => { setEditingItemId(null); setEditingItemValue(null) }} className="flex-1 border border-[#d8cabb] bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#351d17]">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {item.amharicName ? (
                                <>
                                  <div className="truncate text-[14px] text-[#2e1b16]" style={{ fontFamily: '"Noto Sans Ethiopic", "DM Mono", monospace' }}>{item.amharicName}</div>
                                  {item.name ? <div className="truncate text-[11px] text-[#6e574f]">{item.name}</div> : null}
                                </>
                              ) : (
                                <div className="truncate text-[14px] text-[#2e1b16]">{item.name}</div>
                              )}
                              <div className="mt-1 text-[9px] uppercase tracking-[0.08em] text-[#b66b45]" style={{ fontFamily: '"DM Mono", monospace' }}>{item.category}</div>
                            </div>
                            <span className="shrink-0 text-[13px] font-medium text-[#351d17]" style={{ fontFamily: '"DM Mono", monospace' }}>{item.price}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => { setShowAddDishForm(true); setNewItem({ name: '', amharicName: '', category: item.category, price: '' }) }} className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#351d17] bg-[#351d17] text-[13px] leading-none text-[#f7f1e8]" aria-label={`Add new dish in ${item.category}`}>+</button>
                            <button type="button" onClick={() => { setEditingItemId(item.id); setEditingItemValue({ ...item }) }} className="flex-1 border border-[#d8cabb] bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#351d17]">Edit</button>
                            <button type="button" onClick={() => deleteMenuItem(item.id)} className="flex-1 border border-[#a44935] bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#a44935]">Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-6 sm:mt-[28px]">
              <CommentsTable comments={comments} removeComment={deleteComment} />
            </div>

            {adminMessage ? <p className="mt-4 text-[11px] text-[#a44935]">{adminMessage}</p> : null}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
