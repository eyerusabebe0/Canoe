import { useMemo, useState } from 'react'
import './App.css'

const categories = ['All dishes', 'Breakfast', 'Fasting foods', 'Non fasting foods', 'Burger', 'Noodles', 'Pizza', 'Snack', 'Fish', 'Juice', 'Salad', 'Soup', 'Cold drinks', 'Hot drinks', 'Cream cake', 'Canoe special cake', 'Canoe special torta cake', 'Torta cake', 'Cookies']

const normalizeMenuItems = (items = []) => {
  if (!Array.isArray(items)) return []

  return items
    .filter(Boolean)
    .map((item) => {
      if (Array.isArray(item)) {
        const [name = '', category = 'Breakfast', price = '', description = ''] = item
        return { name, category, price, description }
      }

      return {
        name: item.name ?? '',
        category: item.category ?? 'Breakfast',
        price: item.price ?? '',
        description: item.description ?? ''
      }
    })
}

const initialMenuItems = normalizeMenuItems([
   ['እንቁላል ሳንዱች / Egg Sandwich', 'Breakfast', '260', 'Soft egg and fresh fillings in toasted bread.'],
  ['ስፔሻል እንቁላል ሳንዱች / Special Egg Sandwich', 'Breakfast', '360', 'Our fuller, richer take on a morning classic.'],
  ['እንቁላል ፍርፍር / Egg Firfir', 'Breakfast', '270', 'Torn injera folded through warm seasoned egg.'],
  ['እንቁላል ስልስ / Egg Silis', 'Breakfast', '275', 'Eggs cooked in a flavorful spiced tomato sauce.'],
  ['እንቁላል በስጋ / Egg with Meat', 'Breakfast', '345', 'Scrambled eggs cooked with seasoned minced meat.'],
  ['ፓንኬክ / Pancake', 'Breakfast', '220', 'Golden, tender and made for a slow morning.'],
  ['ኦምሌት / Omlet', 'Breakfast', '225', 'Classic lightly seasoned fried folded egg.'],
  ['ስፔሻል ኦምሌት / Special Omlet', 'Breakfast', '290', 'A fluffy omelet with all the works.'],
  ['ፈጢራ / Fetira', 'Breakfast', '220', 'Flaky, buttery pastry freshly prepared.'],
  ['ስፔሻል ፈጢራ / Special Fetira', 'Breakfast', '330', 'Flaky pastry layered with egg and honey.'],
  ['ጨጨብሳ / Chechebsa', 'Breakfast', '220', 'Shredded flatbread tossed in spiced butter and berbere.'],
  ['ስፔሻል ጨጨብሳ / Special Chechebsa', 'Breakfast', '290', 'Chechebsa served with egg and honey or yogurt.'],
  ['የጤፍ ጨጨብሳ / Teff Chechebsa', 'Breakfast', '230', 'Traditional Chechebsa made with wholesome teff bread.'],
  ['ስፔሻል የጤፍ ጨጨብሳ / S.Teff Chechebsa', 'Breakfast', '300', 'Teff Chechebsa rich with egg, spiced butter, and honey.'],
  ['ፉል / Ful', 'Breakfast', '200', 'Warm mashed fava beans with spices and herbs.'],
  ['ስፔሻል ፉል / Special Ful', 'Breakfast', '260', 'Fava beans topped with chopped egg, yogurt, and fresh veggies.'],
  ['አቮካዶ ፉል / Avocado Ful', 'Breakfast', '210', 'Warm fava beans topped with fresh creamy avocado slices.'],
  ['ፓስታ በእንቁላል / Pasta with Egg', 'Breakfast', '300', 'Warm pasta sautéed with scrambled egg.'],
  ['ሩዝ በእንቁላል / Rice With Egg', 'Breakfast', '300', 'Steamed rice tossed with lightly seasoned egg.'],
  ['አትክልት በዳቦ / Vegitable With Bread', 'Breakfast', '200', 'Sautéed fresh vegetables served with warm bread.'],
  ['ፍሬንች ቶስት / Frinch Tost', 'Breakfast', '210', 'Golden toasted bread soaked in egg batter.'],
  ['ስፔሻል ናሽፍ / Special Nashf', 'Breakfast', '300', 'Dry-sautéed spiced meat and vegetable mix.'],
  ['ኖርማል ናሽፍ/ Normal Nashf', 'Breakfast', '230', 'Standard portion of the day\'s breakfast.'],
  // Non fasting foods
  ['ስፔሻል ካኑ / Canoe Special', 'Non fasting foods', '1950', 'የቤታችን ልዩ ምግብ ከተለያዩ አጃቢ ምግቦች ጋር።'],
  ['መንችት / Menchet', 'Non fasting foods', '400', 'በቅመም የተሰራ የተፈጨ የስጋ ወጥ።'],
  ['የበግ ጥብስ / Sheep Tibs', 'Non fasting foods', '550', 'በቅመም እና በቃሪያ የተጠበሰ የለስላሳ የበግ ስጋ ጥብስ።'],
  ['ስፔሻል ጥብስ / Special Tibs', 'Non fasting foods', '600', 'በቃሪያ እና ሽንኩርት አጅቦ የሚቀርብ ስፔሻል የስጋ ጥብስ።'],
  ['ጥብስ ፍርፍር / Tibs Firfir', 'Non fasting foods', '490', 'ከየስጋ ጥብስ ጋር የተሰራ ለስላሳ ፍርፍር።'],
  ['ስፔሻል ጥብስ ፍርፍር / Special Tibs Firfir', 'Non fasting foods', '530', 'በተጨማሪ የስጋ ጥብስ እና ግብዓቶች የበለጸገ ፍርፍር።'],
  ['ዱሌት / Dulet', 'Non fasting foods', '390', 'በቅመም እና በንጥር ቅቤ የተሰራ ባህላዊ ዱሌት።'],
  ['ክትፎ / Kitfo', 'Non fasting foods', '650', 'በሚጥሚጣ እና በንጥር ቅቤ የታሸ ለስላሳ የሬድ ስጋ ክትፎ።'],
  ['ስፔሻል ክትፎ / Special Kitfo', 'Non fasting foods', '750', 'አይብ እና ጎመን አጅቦ የሚቀርብ ስፔሻል ክትፎ።'],
  ['የስጋ ፍርፍር / Meat Firfir', 'Non fasting foods', '350', 'በቅመም ከተጠበሰ ስጋ ጋር የተሰራ ፍርፍር።'],
  ['ስፔሻል የስጋ ፍርፍር / Special Meat Firfir', 'Non fasting foods', '390', 'በተጨማሪ ስጋ እና እንቁላል ያጌጠ ስፔሻል ፍርፍር።'],
  ['ድርቆሽ ፍርፍር / Dirkosh Firfir', 'Non fasting foods', '310', 'ከስጋ ጥብስ ጋር የተሰራ ድርቆሽ ፍርፍር።'],
  ['ድርቆሽ ፍርፍር በቋንጣ / Dirkosh firfir with Kwanta', 'Non fasting foods', '370', 'በደረቀ የቋንጣ ስጋ የተሰራ ድርቆሽ ፍርፍር።'],
  ['ስፓጌቲ በስጋ / Spageti With Meat', 'Non fasting foods', '320', 'በተፈጨ የስጋ ሶስ የተሰራ ፓስታ።'],
  ['ሩዝ በስጋ / Rice With Meat', 'Non fasting foods', '320', 'ከተጠበሰ የስጋ ክፋዮች ጋር የሚቀርብ ሩዝ።'],
  ['ሽሮ ቦዘና / Shiro Bozena', 'Non fasting foods', '290', 'ከስጋ ክፋዮች ጋር የተቀቀለ ጣፋጭ ሽሮ።'],
  ['ጎመን በስጋ / Gomen With Meat', 'Non fasting foods', '320', 'ከቀይ ስጋ ጋር የተጠበሰ ለስላሳ ጎመን።'],
  ['ቋንጣ ፍርፍር / Kwanta Firfir', 'Non fasting foods', '370', 'በደረቀ እና በታሸ የቋንጣ ስጋ የተሰራ ፍርፍር።'],
  ['ስፔሻል ቋንጣ ፍርፍር / S. Kwanta firfir', 'Non fasting foods', '450', 'በተጨማሪ እንቁላል እና ቅቤ ያጌጠ ስፔሻል ቋንጣ ፍርፍር።'],
  ['ግርል ጥብስ / Grill Tibs', 'Non fasting foods', '550', 'በፍህም ላይ በጥንቃቄ የተጠበሰ የስጋ ጥብስ።'],
  ['ስፓጌቲ በካርቦናራ / Spageti With Karbonara', 'Non fasting foods', '395', 'በክሬም እና በስጋ ሶስ የተሰራ ልዩ ፓስታ።']
  // Noodles
  ['ስፓጌቲ በስጋ / Spageti With Meat', 'Noodles', '320', 'Comforting pasta finished with our rich meat sauce.'],
  ['ፓስታ በስልስ / Spageti With Silis', 'Noodles', '260', 'Creamy noodles topped with sauce and herbs.'],

  // Burger
  ['ስፔሻል ክለብ ሳንዱች / Special Club Sandwich', 'Burger', '620', 'Stacked with fresh greens, cheese and our house filling.'],
  ['ስፔሻል ዳብል በርገር / Special Duble burger', 'Burger', '695', 'Two juicy patties, cheese, lettuce and tomato.'],
  ['ቺከን በርገር / Chicken Burger', 'Burger', '520', 'Crisp chicken, fresh salad and a toasted bun.'],
  ['ቺዝ በርገር / Cheese Burger', 'Burger', '490', 'Grilled patty with melted cheese and house sauce.'],

  // Pizza
  ['ስፔሻል ፒዛ / Special Pizza', 'Pizza', '530', 'A generous, cheesy house favorite.'],
  ['አትክልት ፒዛ / Vegitable Pizza', 'Pizza', '420', 'Fresh vegetables, herbs and melted cheese.'],
  ['ቺከን ፒዛ / Chicken Pizza', 'Pizza', '560', 'Loaded with savory chicken and mozzarella.'],

  // Soup & Fish
  ['ዶሮ ሾርባ / Chicken Soup', 'Soup', '370', 'Warm, deeply savory and made for slow lunches.'],
  ['አትክልት ሾርባ / Vegitable Soup', 'Soup', '220', 'A bright, comforting bowl of seasonal vegetables.'],
  ['አሳ ሾርባ / Fish Soup', 'Fish', '355', 'Lightly spiced and full of delicate flavor.'],
  ['ግርል አሳ / Grill Fish', 'Fish', '450', 'Delicately grilled, served with fresh sides.'],

  // Cold drinks
  ['ስፔሻል ሞሂቶ / Special Mojito', 'Cold drinks', '185', 'A sparkling, minty cooler with fresh citrus.'],
  ['ስትሮበሪ ሞሂቶ / Strawberry Mojito', 'Cold drinks', '160', 'Fresh strawberry, mint and a lively finish.'],
  ['ኦሬንጅ ሞሂቶ / Orange Mojito', 'Cold drinks', '160', 'Bright orange with a cooling mint lift.'],

  // Juice
  ['አቮካዶ ጁስ / Avocado Juice', 'Juice', '185', 'Creamy, cool and blended to order.'],
  ['አናናስ ጁስ / Pineapple Juice', 'Juice', '220', 'Fresh tropical sweetness in every glass.'],
  ['ህብር ጁስ / Mixed Juice', 'Juice', '210', 'A colorful blend of the day’s freshest fruit.'],

  // Salad
  ['ፍሩት ሳላድ / Fruit Salad', 'Salad', '370', 'Freshly cut fruit, bright and naturally sweet.'],
  ['ሚክስድ ሳላድ / Mixed Salad', 'Salad', '300', 'Crisp greens and colorful garden vegetables.'],
  ['አቮካዶ ሳላድ / Avocado Salad', 'Salad', '290', 'Creamy avocado over fresh, crunchy greens.'],
  ['ራሺያን ሳላድ / Russian Salad', 'Salad', '400', 'A generous, creamy classic.'],

  // Hot drinks
  ['ካፑቺኖ / Cappuccino', 'Hot drinks', '120', 'Velvety espresso, steamed milk and a soft crown.'],
  ['ማኪያቶ / Macchiato', 'Hot drinks', '75', 'A short espresso touched with silky milk.'],
  ['ስፔሻል ሻይ / Special Tea', 'Hot drinks', '95', 'Fragrant tea blended with a Canoe touch.'],
  ['ጅንጅብል ሻይ / Ginger Tea', 'Hot drinks', '65', 'Bright ginger warmth, served hot.'],
  ['ሎሚ ሻይ / Tea Lemon', 'Hot drinks', '55', 'A clean, citrusy cup.'],

  // Cakes & Cookies
  ['ክሬም ኬክ / Cream Cake', 'Cream cake', '180', 'Soft, creamy and finished with a light frosting.'],
  ['ካኑ ስፔሻል ኬክ / Canoe Special Cake', 'Canoe special cake', '260', 'A signature cake with a rich Canoe-style finish.'],
  ['ስፔሻል ቶርታ / Special Torta 1kg', 'Canoe special torta cake', '950', 'Our house torta layered with rich flavor and texture.'],
  ['ቶርታ ኬክ / Torta Cake 1kg', 'Torta cake', '800', 'Classic torta cake with a delicate crumb.'],

  // Snacks
  ['ቺፕስ / French Fries', 'Snack', '230', 'Golden, crisp and perfectly salted.'],

  // Fasting foods
  ['ስፔሻል የፆም ፍርፍር / Special Fasting Firfir', 'Fasting foods', '260', 'በተለያዩ አትክልቶች እና ቅመሞች ያጌጠ ስፔሻል የፆም ፍርፍር።'],
  ['ድርቆሽ ፍርፍር / Dirkosh Firfir', 'Fasting foods', '240', 'በቅመም እና በቲማቲም ሶስ የተሰራ ጥብስ ድርቆሽ ፍርፍር።'],
  ['ጎመን ክትፎ / Gomen Kitifo', 'Fasting foods', '270', 'በቅመም የታሸ የጎመን ክትፎ።'],
  ['ፓስታ በስልስ / Spageti With Silis', 'Fasting foods', '260', 'በጣፋጭ የቲማቲም ሶስ የተሰራ ፓስታ።'],
    ['ፓስታ በአትክልት / Spageti With Vegetable', 'Fasting foods', '250', 'በጣፋጭ የቲማቲም ሶስ የተሰራ ፓስታ።'],
  ['ሩዝ በአትክልት / Rice With Vegetable', 'Fasting foods', '250', 'ከተለያዩ አትክልቶች ጋር የተጠበሰ ለስላሳ ሩዝ።'],
  ['ድንች ፍርፍር / Potato Firfir', 'Fasting foods', '250', 'ከተጠበሰ ድንች ጋር የተሰራ የፆም ፍርፍር።'],
    ['ስፔሻል ድንች ፍርፍር / Special Potato Firfir', 'Fasting foods', '290', 'በተለያዩ አትክልቶች እና ቅመሞች ያጌጠ ስፔሻል የፆም ፍርፍር።'],
  ['የፆም ፍርፍር / Fasting Firfir', 'Fasting foods', '210', 'በቀለል ያለ ቅመም የተሰራ የፆም ፍርፍር።'],
  ['የፆም ጥብስ / Fasting Tibs', 'Fasting foods', '260', 'በአትክልቶች እና በቅመማ ቅመም የተጠበሰ የፆም ጥብስ።'],
  ['ሽሮ / Shiro', 'Fasting foods', '180', 'በተለየ ሙያ የተሰራ ባህላዊ የሽሮ ወጥ።'],
  ['ሽሮ ላላ / Shiro Lala', 'Fasting foods', '220', 'ቀለል ያለ የቀጠና ሽሮ ወጥ።'],
  ['ተጋቢኖ / Tegabino', 'Fasting foods', '230', 'በትኩስ ድስት የሚቀርብ ፍልፍል ያለ ተጋቢኖ ሽሮ።'],
  ['ስፔሻል ሽሮ / Special Shiro', 'Fasting foods', '260', 'በቅቤና በተለያዩ ግብዓቶች ያጌጠ ስፔሻል ሽሮ።'],
  ['ሱፍ ፍትፍት / Suf Fitfit', 'Fasting foods', '185', 'በቀዝቃዛ የሱፍ ጭማቂ የተሰራ ባህላዊ ፍትፍት።'],
  ['ካሮት ፍርፍር / Carrot Firfir', 'Fasting foods', '185', 'በካሮት እና በአትክልቶች የተሰራ የፆም ፍርፍር።'],
  ['ስፔሻል ድርቆሽ ፍርፍር / Spe. Dirkosh Firfir', 'Fasting foods', '290', 'በተለያዩ አትክልቶች ያጌጠ ስፔሻል ድርቆሽ ፍርፍር።'],
  ['ተልባ ፍትፍት / Telba Fitfit', 'Fasting foods', '200', 'በቅመም የተጠበሰ የዓሳ ጥብስ።'],
  ['ጎመን ጥብስ / Gomen Tibs', 'Fasting foods', '220', 'ከዓሳ ጥብስ ጋር የተሰራ ጣፋጭ ፍርፍር።'],
    ['ሽሮ በጎመን/ Shiro with Gomen', 'Fasting foods', '290', 'ከዓሳ ጥብስ ጋር የተሰራ ጣፋጭ ፍርፍር።'],
  ['ሩዝ በአቮካዶ / Rice With Avocado', 'Fasting foods', '260', 'በትኩስ የአቮካዶ ክፋዮች የታጀበ ለስላሳ ሩዝ።'],
  ['ቡፌ / Baffe', 'Fasting foods', '390', 'የተለያዩ የፆም ምግቦች ስብስብ (ቡፌ)።'],
  ['ቲማቲም ለብለብ / Tomato Lebleb', 'Fasting foods', '230', 'በትኩስ ቲማቲም እና ቃሪያ የተሰራ ሰላጣ።'],
])

function AdminTable({ items, editingItem, setEditingItem, updateItem, removeItem }) {
  const safeItems = Array.isArray(items) ? items : []

  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Description</th><th>Actions</th></tr></thead><tbody>{safeItems.map((item) => {
    if (editingItem === item.name) {
          return <tr key={item.name}><td><input aria-label={`Edit ${item.name} name`} value={item.name} onChange={(event) => { updateItem(item.name, 'name', event.target.value); setEditingItem(event.target.value) }} /></td><td><select aria-label={`Edit ${item.name} category`} value={item.category} onChange={(event) => updateItem(item.name, 'category', event.target.value)}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></td><td><input aria-label={`Edit ${item.name} price`} value={item.price} onChange={(event) => updateItem(item.name, 'price', event.target.value)} /></td><td><input aria-label={`Edit ${item.name} description`} value={item.description} onChange={(event) => updateItem(item.name, 'description', event.target.value)} /></td><td><button className="admin-action primary" type="button" onClick={() => setEditingItem(null)}>Save</button></td></tr>
    }
    return <tr key={item.name}><td>{item.name}</td><td>{item.category}</td><td>{item.price}</td><td>{item.description}</td><td><button className="admin-action" type="button" onClick={() => setEditingItem(item.name)}>Edit</button><button className="admin-action danger" type="button" onClick={() => removeItem(item.name)}>Delete</button></td></tr>
  })}</tbody></table></div>
}

function CommentsTable({ comments, removeComment }) {
  const safeComments = Array.isArray(comments) ? comments : []

  return <section className="comments-admin" aria-labelledby="comments-heading"><div className="comments-heading"><div><p className="eyebrow">Guest feedback</p><h3 id="comments-heading">Customer comments</h3></div><span>{safeComments.length} {safeComments.length === 1 ? 'comment' : 'comments'}</span></div>{safeComments.length ? <div className="comments-list">{safeComments.map((comment) => <article className="comment-item" key={comment.id}><div className="comment-meta"><strong>{comment.name || 'Anonymous guest'}</strong><span>{comment.rating ? `${comment.rating}/5 stars` : 'No rating'}</span></div><p>{comment.text}</p><button className="admin-action danger" type="button" onClick={() => removeComment(comment.id)}>Delete comment</button></article>)}</div> : <p className="comments-empty">Customer comments will appear here after guests submit a review.</p>}</section>
}

function App() {
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [activeCategory, setActiveCategory] = useState('All dishes')
  const [query, setQuery] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [comments, setComments] = useState([])
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', category: 'Breakfast', price: '', description: '' })

  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All dishes' || item.category === activeCategory
    return matchesCategory && `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())
  }), [activeCategory, menuItems, query])
  const updateItem = (itemName, field, value) => setMenuItems((items) => items.map((item) => item.name === itemName ? { ...item, [field]: value } : item))
  const removeItem = (itemName) => setMenuItems((items) => items.filter((item) => item.name !== itemName))
  const removeComment = (commentId) => setComments((items) => items.filter((item) => item.id !== commentId))
  const addItem = (event) => {
    event.preventDefault()
    if (!newItem.name.trim() || !newItem.price.trim() || !newItem.description.trim()) return
    setMenuItems((items) => [...items, { ...newItem, name: newItem.name.trim(), price: newItem.price.trim(), description: newItem.description.trim() }])
    setNewItem({ name: '', category: 'Breakfast', price: '', description: '' })
  }
  const handleAdminLogin = (event) => {
    event.preventDefault()
    if (adminEmail === 'a@gmail.com' && adminPassword === '1111') { setIsAdmin(true); setShowAdminLogin(false); setLoginError('') } else setLoginError('Incorrect email or password.')
  }

  return <main className="menu-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="Canoe home"><span className="brand-mark">c</span><span>canoe</span></a><div className="topbar-note"><span className="status-dot" /> Open today <strong>8:00 — 22:00</strong></div><button className="order-button" type="button" onClick={() => document.querySelector('.menu-grid')?.scrollIntoView({ behavior: 'smooth' })}>View menu <span>↓</span></button></header>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">Addis Ababa · Est. 2014</p><h1>Good food,<br /><em>good company.</em></h1><p className="hero-intro">A warm table for bright mornings, long lunches, and evenings that take their time.</p></div><div className="hero-stamp"><span>CAFE</span><strong>CANOE</strong><small>eat · drink · linger</small></div></section>
    <section className="menu-section" aria-label="Canoe menu"><div className="section-heading"><div><p className="eyebrow">From our kitchen</p><h2>Find your favorite</h2></div><p className="item-count">{filteredItems.length} dishes</p></div><div className="search-wrap"><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes, drinks, or ingredients" aria-label="Search menu" />{query && <button className="clear-search" type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}<kbd>⌘ K</kbd></div><nav className="category-nav" aria-label="Menu categories">{categories.map((category) => <button className={activeCategory === category ? 'active' : ''} key={category} onClick={() => setActiveCategory(category)} type="button">{category}</button>)}</nav>{filteredItems.length ? <div className="menu-grid">{filteredItems.map((item, index) => <article className="menu-item" key={item.name} style={{ '--delay': `${index * 35}ms` }}><div className="item-top"><span className="item-category">{item.category}</span><span className="item-price">{item.price}</span></div><h3>{item.name}</h3><p>{item.description}</p><button className="add-button" type="button" aria-label={`Add ${item.name}`}>+</button></article>)}</div> : <div className="empty-state"><span>⌕</span><h3>No dishes found</h3><p>Try another search or browse all dishes.</p><button type="button" onClick={() => { setQuery(''); setActiveCategory('All dishes') }}>Reset menu</button></div>}</section>
    <section className="review-section" aria-labelledby="review-heading"><div className="review-copy"><p className="eyebrow">A word from you</p><h2 id="review-heading">How was your visit?</h2><p>Tell us what you enjoyed, or what we can make even better.</p></div>{reviewSubmitted ? <div className="review-success" role="status"><span aria-hidden="true">✓</span><h3>Thank you for sharing.</h3><p>Your review means a lot to the Canoe team.</p><button type="button" onClick={() => setReviewSubmitted(false)}>Write another review</button></div> : <form className="review-form" onSubmit={(event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); setComments((items) => [...items, { id: Date.now(), name: formData.get('name').trim(), text: formData.get('comment').trim(), rating }]); setReviewSubmitted(true); setRating(0); event.currentTarget.reset() }}><fieldset><legend>Rate your visit</legend><div className="star-rating">{[1, 2, 3, 4, 5].map((star) => <button className={star <= rating ? 'selected' : ''} key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} star${star === 1 ? '' : 's'}`} aria-pressed={star === rating}>★</button>)}</div></fieldset><label className="review-field"><span>Name <small>(optional)</small></span><input name="name" type="text" placeholder="Your name" /></label><label className="review-field"><span>Comment</span><textarea name="comment" required placeholder="Share your experience" rows="4" /></label><button className="review-submit" type="submit">Submit review <span>↗</span></button></form>}</section>
    <footer><span>CANOE CAFE</span><span>Made for lingering.</span><button className="admin-login-button" type="button" onClick={() => { setShowAdminLogin(true); setLoginError('') }}>Admin login</button></footer>
    {showAdminLogin && <div className="admin-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAdminLogin(false) }}><form className="admin-login" onSubmit={handleAdminLogin}><button className="admin-close" type="button" onClick={() => setShowAdminLogin(false)} aria-label="Close admin login">×</button><p className="eyebrow">Canoe management</p><h2>Admin login</h2><label className="admin-field"><span>Email</span><input autoFocus type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required /></label><label className="admin-field"><span>Password</span><input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} required /></label>{loginError && <p className="login-error" role="alert">{loginError}</p>}<button className="admin-submit" type="submit">Login <span>↗</span></button></form></div>}
    {isAdmin && <section className="admin-panel" aria-labelledby="admin-heading"><div className="admin-panel-heading"><div><p className="eyebrow">Signed in as admin</p><h2 id="admin-heading">Manage menu</h2></div><button className="admin-logout" type="button" onClick={() => { setIsAdmin(false); setEditingItem(null) }}>Log out</button></div><form className="add-item-form" onSubmit={addItem}><h3>Add a dish</h3><div className="admin-form-grid"><input aria-label="New dish name" placeholder="Dish name" value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} /><select aria-label="New dish category" value={newItem.category} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select><input aria-label="New dish price" placeholder="Price" value={newItem.price} onChange={(event) => setNewItem({ ...newItem, price: event.target.value })} /><input aria-label="New dish description" placeholder="Description" value={newItem.description} onChange={(event) => setNewItem({ ...newItem, description: event.target.value })} /><button className="admin-action primary" type="submit">Add dish</button></div></form><AdminTable items={menuItems} editingItem={editingItem} setEditingItem={setEditingItem} updateItem={updateItem} removeItem={removeItem} /><CommentsTable comments={comments} removeComment={removeComment} /></section>}
  </main>
}

export default App
