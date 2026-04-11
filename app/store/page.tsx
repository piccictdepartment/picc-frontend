'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Plus, Minus, Trash2, X, CheckCircle2, 
  Download, Printer, Mail, MessageCircle, ImageIcon,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  BookOpen, ExternalLink, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { products, categories, bookAuthors, bookGenres, type Product } from '@/components/data/products';

export default function StorePage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeAuthor, setActiveAuthor] = useState('All');
  const [activeGenre, setActiveGenre] = useState('All');
  
  // Selection Modal State
  const [selectedBook, setSelectedBook] = useState<Product | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Cart & Checkout State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeAuthor, activeGenre]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory !== 'All' && product.category !== activeCategory) return false;
      if (activeCategory === 'Books') {
        if (activeAuthor !== 'All' && product.author !== activeAuthor) return false;
        if (activeGenre !== 'All' && product.genre !== activeGenre) return false;
      }
      return true;
    });
  }, [activeCategory, activeAuthor, activeGenre]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (!mounted) return null;

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

      <main className="min-h-screen bg-white text-black">
        <section className="relative overflow-hidden py-24 md:py-36 text-white rounded-b-[36px] md:rounded-b-[48px]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/hero/hero-store.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mt-20">
              <h1 className="text-4xl md:text-6xl font-semibold mb-4">PICC Store</h1>
              <p className="text-lg text-white/80">Resources and items to empower your spiritual journey.</p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setActiveAuthor('All'); setActiveGenre('All'); }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === cat ? 'bg-black text-white' : 'hover:bg-black/5 text-black/70'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {activeCategory === 'Books' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t border-black/10">
                  <div>
                    <p className="text-xs font-bold uppercase text-black/40 mb-3">By Author</p>
                    <select value={activeAuthor} onChange={(e) => setActiveAuthor(e.target.value)} className="w-full p-2 border border-black/10 rounded-md text-sm outline-none">
                      <option value="All">All Authors</option>
                      {bookAuthors.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-black/40 mb-3">By Genre</p>
                    <div className="flex flex-wrap gap-2">
                      {['All', ...bookGenres].map(g => (
                        <button key={g} onClick={() => setActiveGenre(g)} className={`px-3 py-1 rounded-full text-xs border ${activeGenre === g ? 'bg-black text-white border-black' : 'border-black/10 text-black/60 hover:border-black/30'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </aside>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAdd={() => handleProductClick(product)} formatMWK={formatMWK} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 py-8 border-t border-black/5">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={() => goToPage(1)} disabled={currentPage === 1} className="hidden sm:flex">
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-black/30">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="hidden sm:flex">
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
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
                           <Image src={item.product.image} alt={item.product.name} fill className="object-cover" onError={(e:any) => e.target.src='/images/placeholder.png'} />
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