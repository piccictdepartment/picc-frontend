'use client';

import { useState, useMemo, type FormEvent, type SyntheticEvent } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, X, CheckCircle2, 
  MessageCircle, ImageIcon, BookOpen, ExternalLink, Building2, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { products, categories, bookAuthors, bookGenres, type Product } from '@/components/data/products';

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeAuthor, setActiveAuthor] = useState('All');
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTab, setTrendingTab] = useState<'Featured' | 'New arrivals' | 'Best sellers'>('Featured');
  
  // Selection Modal State
  const [selectedBook, setSelectedBook] = useState<Product | null>(null);

  // Cart & Checkout State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory !== 'All' && product.category !== activeCategory) return false;
      if (activeCategory === 'Books') {
        if (activeAuthor !== 'All' && product.author !== activeAuthor) return false;
        if (activeGenre !== 'All' && product.genre !== activeGenre) return false;
      }

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const searchable = [
          product.name,
          product.category,
          product.author || '',
          product.genre || '',
        ].join(' ').toLowerCase();
        if (!searchable.includes(lowerQuery)) return false;
      }

      return true;
    });
  }, [activeCategory, activeAuthor, activeGenre, searchQuery]);

  const trendingProducts = useMemo(() => {
    const active = filteredProducts.length ? filteredProducts : products;

    if (trendingTab === 'New arrivals') {
      return [...active].slice(-4).reverse();
    }

    if (trendingTab === 'Best sellers') {
      return active.filter((product) => product.price >= 5000).slice(0, 4);
    }

    return active.slice(0, 4);
  }, [filteredProducts, trendingTab]);

  const featuredProduct = filteredProducts[0] || products[0];
  const heroBook = products.find((product) => product.id === 'b2') || featuredProduct;
  const dealsOfWeek = products.slice(1, 3);
  const bookProductsWithImages = useMemo(
    () => products.filter((product) => product.category === 'Books' && !product.image.includes('placeholder')),
    []
  );

  const classicTrendingProducts = useMemo(() => {
    const active = bookProductsWithImages.length ? bookProductsWithImages : products.filter((product) => product.category === 'Books');

    if (trendingTab === 'New arrivals') {
      return [...active].slice(-8).reverse();
    }

    if (trendingTab === 'Best sellers') {
      return [...active]
        .sort((a, b) => b.price - a.price)
        .slice(0, 8);
    }

    return active.slice(0, 8);
  }, [bookProductsWithImages, trendingTab]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const swapImage = (fallback: string) => (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = fallback;
  };

  const handleProductClick = (product: Product) => {
    if (product.category === 'Books') {
      setSelectedBook(product);
    } else {
      addToCart(product);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setSelectedBook(null);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.product.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const formatMWK = (amount: number) => `MWK ${amount.toLocaleString()}`;

  return (
    <>
      <Navigation />
      
      {/* Selection Modal for Books */}
      <AnimatePresence>
        {selectedBook && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBook(null)} className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[70] rounded-2xl shadow-2xl p-6 overflow-hidden">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-black/5 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-black/20" />
                </div>
                <h3 className="text-xl font-bold">{selectedBook.name}</h3>
                <p className="text-sm text-black/50">Choose how you want to purchase this book</p>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={() => addToCart(selectedBook)}
                  className="group relative flex items-center gap-4 p-4 border rounded-xl hover:border-black transition-all text-left"
                >
                  <div className="p-3 bg-black text-white rounded-lg group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">Hard Copy</p>
                    <p className="text-xs text-black/50">Pay via Bank/Mobile Money & collect in person.</p>
                  </div>
                </button>

                <a 
                  href="https://www.amazon.com/stores/author/B0198LK6E6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-4 p-4 border rounded-xl hover:border-black transition-all text-left"
                >
                  <div className="p-3 bg-[#FF9900] text-white rounded-lg group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">Soft Copy</p>
                    <p className="text-xs text-black/50">Purchase the digital version on Amazon.</p>
                  </div>
                </a>
              </div>

              <button onClick={() => setSelectedBook(null)} className="mt-6 w-full py-2 text-sm text-black/40 hover:text-black font-medium transition-colors">
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isCartOpen && cartCount > 0 && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 z-40 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="font-bold">{cartCount}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-white text-slate-900">
        <section className="bg-white text-slate-950">
          <div className="bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-700">
              <p>Support: support@propheticstore.com</p>
              <div className="flex flex-wrap items-center gap-4">
                <button type="button" className="hover:text-slate-950">Account</button>
                <span className="h-4 w-px bg-slate-300" />
                <span>MWK MK</span>
                <span className="h-4 w-px bg-slate-300" />
                <button type="button" className="hover:text-slate-950">English</button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(320px,1fr)_220px] lg:items-center">
              <div className="flex items-center gap-3">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-slate-950" strokeWidth={1.5} />
                  <span className="absolute bottom-2 right-1 rounded bg-white px-1 text-[10px] font-black text-[#d71920]">S</span>
                </div>
                <div className="leading-none">
                  <p className="text-2xl font-black tracking-tight">Prophetic</p>
                  <p className="-mt-1 text-2xl font-black tracking-tight text-[#d71920]">Store</p>
                </div>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex w-full items-stretch">
                <label htmlFor="store-search-top" className="sr-only">Search</label>
                <input
                  id="store-search-top"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search"
                  className="min-h-14 flex-1 border-2 border-r-0 border-slate-950 bg-white px-5 text-base text-slate-950 outline-none placeholder:text-slate-500"
                />
                <button type="submit" className="min-h-14 w-16 bg-[#1688b4] text-white hover:bg-[#0f759c]" aria-label="Search products">
                  <Search className="mx-auto h-5 w-5" />
                </button>
              </form>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center justify-start gap-3 text-left lg:justify-center"
              >
                <ShoppingCart className="h-7 w-7 text-slate-950" />
                <span>
                  <span className="block font-serif text-base">Shopping Cart</span>
                  <span className="block text-xs text-slate-500">{cartCount} item{cartCount === 1 ? '' : 's'}</span>
                </span>
              </button>
            </div>
          </div>

          <div className="border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setActiveAuthor('All');
                  setActiveGenre('All');
                  setTrendingTab('Featured');
                }}
                className="inline-flex min-h-14 items-center gap-4 rounded-md bg-[#1688b4] px-7 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#0f759c]"
              >
                <Menu className="h-6 w-6" />
                All Categories
              </button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#142458] text-white">
          <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16)_0,transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] [background-size:900px_600px,18px_18px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(37,99,235,0.28),transparent_38%),linear-gradient(90deg,rgba(7,22,71,0.2),rgba(7,22,71,0.7))]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] items-center">
              <div className="relative mx-auto w-[min(76vw,390px)] aspect-[0.72] [perspective:1200px]">
                <div className="absolute -bottom-9 left-8 right-1 h-12 rounded-[50%] bg-black/45 blur-2xl" />
                <div className="relative h-full w-full origin-left [transform:rotateY(-7deg)]">
                  <div className="absolute -right-3 top-4 z-0 h-[calc(100%-32px)] w-4 skew-y-2 bg-gradient-to-r from-[#3b2018] to-[#160d0a] shadow-xl" />
                  <div className="absolute left-0 top-0 z-20 h-full w-[7%] bg-gradient-to-r from-black/35 via-white/14 to-transparent" />
                  <Image
                    src={heroBook.image}
                    alt={heroBook.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 390px, 76vw"
                    className="z-10 object-cover shadow-[22px_28px_48px_rgba(0,0,0,0.45)]"
                    onError={swapImage('/store/books/placeholder.png')}
                  />
                </div>
              </div>

              <div className="mx-auto max-w-2xl text-center">
                <p className="font-serif text-3xl md:text-4xl text-white">Now Available</p>
                <h1 className="mt-5 font-serif text-5xl md:text-7xl font-semibold leading-tight tracking-wide uppercase">
                  {heroBook.name}
                </h1>
                <p className="mx-auto mt-7 max-w-2xl font-serif text-lg leading-8 text-white">
                  A prophetic resource to strengthen your faith, sharpen your focus, and help you contend for the breakthroughs God has prepared for you.
                </p>
                <div className="mt-10">
                  <Button
                    onClick={() => handleProductClick(heroBook)}
                    className="rounded-md bg-[#1688b4] px-8 py-6 font-serif text-base font-bold uppercase tracking-wide text-white hover:bg-[#0f759c]"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfbff] py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-serif text-4xl font-semibold text-slate-950 md:text-5xl">Trending Products</h2>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {['Featured', 'New arrivals', 'Best sellers'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setTrendingTab(tab as 'Featured' | 'New arrivals' | 'Best sellers')}
                    className={`min-h-12 rounded-md border px-8 font-serif text-base transition ${trendingTab === tab ? 'border-[#1688b4] bg-[#1688b4] text-white' : 'border-slate-200 bg-white text-slate-950 hover:border-[#1688b4]'}`}
                  >
                    {tab === 'New arrivals' ? 'New Arrivals' : tab === 'Best sellers' ? 'Best Sellers' : tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {classicTrendingProducts.map((product, index) => (
                <ClassicProductTile
                  key={product.id}
                  product={product}
                  onSelect={() => handleProductClick(product)}
                  formatMWK={formatMWK}
                  showSaleBadge={index === 3 || index === 4 || index === 5}
                  originalPrice={index === 3 || index === 5 ? product.price + 2500 : undefined}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Shop the store</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Find what you need quickly</h2>
              </div>
              <form onSubmit={handleSearchSubmit} className="flex w-full max-w-xl items-center gap-3">
                <label htmlFor="store-search" className="sr-only">Search products</label>
                <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm focus-within:border-[#045BB4]">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    id="store-search"
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products, books, devotionals..."
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  />
                </div>
                <Button type="submit" className="whitespace-nowrap px-5 py-3">Search</Button>
              </form>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveAuthor('All');
                    setActiveGenre('All');
                    setTrendingTab('Featured');
                  }}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${activeCategory === cat ? 'bg-[#045BB4] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {activeCategory === 'Books' && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">By author</p>
                  <select
                    value={activeAuthor}
                    onChange={(e) => setActiveAuthor(e.target.value)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option value="All">All authors</option>
                    {bookAuthors.map((author) => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">By genre</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['All', ...bookGenres].map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setActiveGenre(genre)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition ${activeGenre === genre ? 'bg-[#045BB4] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Trending Products</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Selected picks for you</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white p-1 shadow-sm border border-slate-200">
                {['Featured', 'New arrivals', 'Best sellers'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setTrendingTab(tab as 'Featured' | 'New arrivals' | 'Best sellers')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${trendingTab === tab ? 'bg-[#045BB4] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-4">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={() => handleProductClick(product)} formatMWK={formatMWK} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Deals of the week</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Deals Of The Week</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {dealsOfWeek.map((deal, index) => (
                <div key={deal.id} className={`relative overflow-hidden rounded-[32px] text-white shadow-2xl ${index === 0 ? 'bg-[radial-gradient(circle_at_top_left,_rgba(38,191,255,0.18),_transparent_35%)]' : 'bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_35%)]'}`}>
                  <div className="relative h-96 lg:h-[360px]">
                    <Image src={deal.image} alt={deal.name} fill className="object-cover opacity-70" onError={swapImage('/images/placeholder.png')} />
                  </div>
                  <div className="relative p-8 lg:p-10 bg-slate-950/75">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Shop now</p>
                    <h3 className="mt-4 text-3xl font-semibold">{deal.name}</h3>
                    <p className="mt-4 max-w-xl text-sm text-slate-200">Grab this season’s best prophetic resource with a special offer and faster checkout.</p>
                    <Button onClick={() => addToCart(deal)} className="mt-8 bg-white text-slate-950 px-6 py-3 hover:bg-slate-100">SHOP NOW</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                { title: 'Spiritual', subtitle: 'Get 45% Off', color: 'bg-cyan-600' },
                { title: 'Business', subtitle: 'Get 45% Off', color: 'bg-emerald-600' },
                { title: 'Audio Book', subtitle: 'Get 50% Off', color: 'bg-blue-600' },
              ].map((card) => (
                <div key={card.title} className={`group relative overflow-hidden rounded-[32px] ${card.color} p-8 text-white shadow-2xl`}>
                  <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/30 via-transparent to-black/10"></div>
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-200">{card.title}</p>
                      <h3 className="mt-3 text-3xl font-semibold">{card.subtitle}</h3>
                    </div>
                    <div className="mt-6 flex items-end justify-between gap-4">
                      <p className="text-sm text-slate-200">Best discounts on study and ministry resources.</p>
                      <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/20 bg-white/10">
                        <Image src={featuredProduct.image} alt={card.title} fill className="object-cover" onError={swapImage('/images/placeholder.png')} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">{checkoutStep === 'success' ? 'Payment Details' : checkoutStep === 'checkout' ? 'Order Confirmation' : 'Your Cart'}</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {checkoutStep === 'cart' && (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4">
                        <div className="relative w-20 h-20 bg-black/5 rounded-md overflow-hidden">
                           <Image src={item.product.image} alt={item.product.name} fill className="object-cover" onError={swapImage('/images/placeholder.png')} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm leading-tight">{item.product.name}</h4>
                          <p className="text-xs text-black/50 mt-1">{formatMWK(item.product.price)}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border rounded-md">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-black/5"><Minus className="w-3 h-3" /></button>
                              <span className="w-8 text-center text-xs">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-black/5"><Plus className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => updateQuantity(item.product.id, -item.quantity)} className="text-black/30 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {checkoutStep === 'checkout' && (
                  <div className="space-y-6">
                    <div className="bg-black/5 p-4 rounded-lg">
                      <p className="text-sm text-black/50 mb-1">Total to Pay</p>
                      <p className="text-2xl font-bold">{formatMWK(cartTotal)}</p>
                    </div>
                    
                    <div className="p-4 border border-black/10 rounded-xl space-y-3">
                      <h3 className="font-bold flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Bank Account Details
                      </h3>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-black/50">Bank:</span> <span className="font-medium">National Bank</span></div>
                        <div className="flex justify-between"><span className="text-black/50">Account Name:</span> <span className="font-medium">PICC AUDITORIUM</span></div>
                        <div className="flex justify-between"><span className="text-black/50">Account Number:</span> <span className="font-medium">1008844948</span></div>
                        <div className="flex justify-between"><span className="text-black/50">Branch:</span> <span className="font-medium">Capital City</span></div>
                      </div>
                      <p className="text-[10px] bg-black text-white p-2 rounded text-center font-bold">
                        IMPORTANT: INCLUDE YOUR NAME IN THE DESCRIPTION
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-black/40">Select Payment Method</h3>
                      <div className="space-y-2">
                        {['Airtel Money', 'TNM Mpamba', 'Bank Transfer'].map(m => (
                          <label key={m} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === m ? 'border-black bg-black/5' : 'border-black/10'}`}>
                            <input type="radio" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="mr-3" />
                            <span className="text-sm font-medium">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {checkoutStep === 'success' && (
                  <div className="h-full flex flex-col animate-in fade-in duration-500">
                    <div className="text-center mb-8">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Order Submitted!</h3>
                      <p className="text-sm text-black/60">Please complete your payment to the details below.</p>
                    </div>

                    <div className="bg-black p-6 rounded-2xl text-white space-y-4 mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase text-white/40">Account Name</p>
                        <p className="font-bold">PICC AUDITORIUM</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-white/40">Account Number</p>
                          <p className="font-bold">1008844948</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-white/40">Bank / Branch</p>
                          <p className="font-bold">National / Capital City</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-medium text-center px-4">
                        Once paid, send your <span className="font-bold underline">proof of payment</span> and <span className="font-bold underline">full name</span> to our team on WhatsApp:
                      </p>
                      <Button className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#25D366]/90 border-0 py-6" onClick={() => window.open(`https://wa.me/265888000000?text=Hello, I have made a payment for my PICC Store order. Name: `, '_blank')}>
                        <MessageCircle className="w-5 h-5" /> Send Proof on WhatsApp
                      </Button>
                      <p className="text-xs text-black/40 text-center">We will then contact you to organize collection.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50">
                {checkoutStep === 'cart' && cart.length > 0 && (
                  <Button className="w-full py-6 text-lg" onClick={() => setCheckoutStep('checkout')}>Next: Payment Information</Button>
                )}
                {checkoutStep === 'checkout' && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCheckoutStep('cart')}>Back</Button>
                    <Button className="flex-1" disabled={!paymentMethod} onClick={() => setCheckoutStep('success')}>Confirm & View Details</Button>
                  </div>
                )}
                {checkoutStep === 'success' && (
                  <Button className="w-full" variant="outline" onClick={() => { setIsCartOpen(false); setCart([]); setCheckoutStep('cart'); }}>Back to Store</Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ClassicProductTile({
  product,
  onSelect,
  formatMWK,
  showSaleBadge,
  originalPrice,
}: {
  product: Product;
  onSelect: () => void;
  formatMWK: (a: number) => string;
  showSaleBadge?: boolean;
  originalPrice?: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button type="button" onClick={onSelect} className="group text-center">
      <div className="relative flex aspect-square items-center justify-center border border-slate-200 bg-white p-7 transition group-hover:border-slate-300 group-hover:shadow-lg">
        {showSaleBadge && (
          <span className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            Sale
          </span>
        )}
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            width={260}
            height={360}
            sizes="(min-width: 1024px) 260px, (min-width: 640px) 35vw, 70vw"
            className="h-full w-auto object-contain drop-shadow-[0_16px_18px_rgba(15,23,42,0.18)] transition duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center text-slate-300">
            <ImageIcon className="h-12 w-12" />
            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest">Image Coming Soon</span>
          </div>
        )}
      </div>
      <h3 className="mt-5 min-h-12 font-serif text-lg leading-6 text-slate-950">{product.name}</h3>
      <p className="mt-1 font-serif text-base text-slate-950">
        {originalPrice && <span className="mr-2 text-slate-400 line-through">{formatMWK(originalPrice)}</span>}
        <span>{formatMWK(product.price)}</span>
      </p>
    </button>
  );
}

function ProductCard({ product, onAdd, formatMWK }: { product: Product, onAdd: () => void, formatMWK: (a: number) => string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="flex flex-col h-full overflow-hidden border-black/10 hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-black/5 flex items-center justify-center">
        {!imgError ? (
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-cover" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="flex flex-col items-center opacity-20">
            <ImageIcon className="w-12 h-12" />
            <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">Image Coming Soon</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase text-black/60 border border-black/5">
          {product.category}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg leading-tight mb-1">{product.name}</h3>
        {product.author && <p className="text-sm text-black/50 mb-4">{product.author}</p>}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-bold">{formatMWK(product.price)}</span>
          <Button size="sm" onClick={onAdd} className="rounded-full px-5">
            {product.category === 'Books' ? 'View Options' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
