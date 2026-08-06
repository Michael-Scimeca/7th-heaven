"use client";
import Image from 'next/image';

import { useState, useRef } from "react";

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  quantityAvailable: number | null;
  images: { edges: { node: { url: string; altText: string } }[] };
  variants: { edges: { node: { id: string; price: { amount: string; currencyCode: string }; quantityAvailable?: number } }[] };
};

export default function StoreClient({ initialProducts }: { initialProducts: ShopifyProduct[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  // Checkout Modal States
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [checkoutDeliveryMethod, setCheckoutDeliveryMethod] = useState<'merch_table' | 'shipping'>('shipping');
  const [checkoutSelectedSize, setCheckoutSelectedSize] = useState('L');
  const [checkoutSelectedColor, setCheckoutSelectedColor] = useState('Black');
  const [shippingDetails, setShippingDetails] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '•••• •••• •••• 4242' });
  const claimPinRef = useRef('');
  
  // Create a mapping or guess the category based on tags or productType. 
  const categories = ["All", "Apparel", "Music", "Accessories"];

  // Filter products by title keywords (simulated categories for now)
  const filtered = initialProducts.filter(p => {
    if (activeCategory === "All") return true;
    const t = p.title.toLowerCase();
    if (activeCategory === "Apparel" && (t.includes("shirt") || t.includes("hoodie") || t.includes("hat") || t.includes("tee"))) return true;
    if (activeCategory === "Music" && (t.includes("cd") || t.includes("vinyl") || t.includes("music"))) return true;
    if (activeCategory === "Accessories" && (t.includes("mug") || t.includes("pin") || t.includes("poster"))) return true;
    return false;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Apparel": return "👕";
      case "Music": return "💿";
      case "Accessories": return "🛍️";
      default: return "🛒";
    }
  };

  const handleCheckoutClick = (product: ShopifyProduct) => {
    setSelectedProduct(product);
    setCheckoutStep('form');
    claimPinRef.current = Math.floor(1000 + Math.random() * 9000).toString();
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setCheckoutStep('processing');
    
    setTimeout(() => {
      const price = selectedProduct.variants?.edges?.[0]?.node?.price?.amount 
        ? `$${parseFloat(selectedProduct.variants.edges[0].node.price.amount).toFixed(2)}` 
        : '$45.00';

      const isClothing = selectedProduct.title.toLowerCase().match(/shirt|tee|hoodie|sweat|jersey|jacket|tank|hat|cap/);

      const newOrder = {
        id: Date.now(),
        customer: shippingDetails.name || 'Anonymous Fan',
        email: shippingDetails.email,
        address: checkoutDeliveryMethod === 'shipping' ? shippingDetails.address : '',
        city: checkoutDeliveryMethod === 'shipping' ? shippingDetails.city : '',
        zip: checkoutDeliveryMethod === 'shipping' ? shippingDetails.zip : '',
        item: selectedProduct.title,
        price,
        size: isClothing ? checkoutSelectedSize : null,
        color: isClothing ? checkoutSelectedColor : null,
        method: checkoutDeliveryMethod,
        source: 'Store',
        status: checkoutDeliveryMethod === 'merch_table' ? 'Ready for Pickup' : 'Pending',
        image: selectedProduct.images?.edges?.[0]?.node?.url || '/images/merch/vinyl.png',
        ts: Date.now()
      };

      // Save to admin_orders_list in localStorage
      try {
        const currentOrders = JSON.parse(localStorage.getItem('admin_orders_list_v1') || localStorage.getItem('admin_orders_list') || '[]');
        currentOrders.unshift(newOrder);
        localStorage.setItem('admin_orders_list_v1', JSON.stringify(currentOrders));

        // If table pickup, also add to merch_pickup_queue for unified live stream fulfillment queue compatibility
        if (checkoutDeliveryMethod === 'merch_table') {
          const queue = JSON.parse(localStorage.getItem('merch_pickup_queue_v1') || localStorage.getItem('merch_pickup_queue') || '[]');
          queue.unshift({
            id: newOrder.id,
            code: `PU-${claimPinRef.current}`,
            item: newOrder.item,
            size: newOrder.size,
            color: newOrder.color,
            price: newOrder.price,
            customer: newOrder.customer,
            email: newOrder.email,
            ts: newOrder.ts,
            claimed: false
          });
          localStorage.setItem('merch_pickup_queue_v1', JSON.stringify(queue));
        }

        // Decrement inventory in Shopify storefront
        const selectedVariantNode = selectedProduct.variants?.edges?.find((edge: any) => {
          const title = edge.node.title.toLowerCase();
          const matchesSize = !checkoutSelectedSize || title.includes(checkoutSelectedSize.toLowerCase());
          const matchesColor = !checkoutSelectedColor || title.includes(checkoutSelectedColor.toLowerCase());
          return matchesSize && matchesColor;
        })?.node || selectedProduct.variants?.edges?.[0]?.node;

        if (selectedVariantNode?.id) {
          fetch('/api/shopify/inventory/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variantId: selectedVariantNode.id, quantity: 1 })
          }).then(res => res.ok ? res.json() : null)
            .then(data => console.log('[Shopify Inventory Sync]', data))
            .catch(err => console.error('[Shopify Inventory Sync Error]', err));
        }

        // Notify admin via BroadcastChannel
        const bc = new BroadcastChannel('7h_live_michael');
        bc.postMessage({ type: 'ORDER_CREATED', payload: newOrder });
        bc.close();
      } catch (err) {
        console.error("Failed to persist order:", err);
      }

      setCheckoutStep('success');
    }, 1500);
  };

  return (
    <section className="pt-[88px] pb-32 min-h-screen bg-[#f0f2f5] text-black" id="store">
      <div className="site-container pt-[11px]">

        {/* Header */}
        <div className="mb-6 text-left flex flex-col items-start">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-none tracking-tight text-black text-left uppercase">
            Band <span className="text-purple-600">Merch</span>
          </h1>
          <p className="text-black/60 mt-2 max-w-lg text-base text-left font-medium">
            Apparel, Music, and more directly from the band.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-start gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-bold uppercase tracking-[0.1em] px-5 py-2.5  border transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "border-purple-600 bg-purple-600 text-white shadow-md"
                  : "border-black/10 bg-white text-black/70 hover:text-black hover:border-black/20 shadow-xs"
              }`}
            >
              {cat !== "All" && <span className="mr-1.5">{getCategoryIcon(cat)}</span>}
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(product => {
            const variant = product.variants?.edges?.[0]?.node;
            const price = variant?.price?.amount ? `$${parseFloat(variant.price.amount).toFixed(2)}` : 'TBD';
            const imageUrl = product.images?.edges?.[0]?.node?.url;

            return (
              <div key={product.id} className="group border border-black/10 bg-white shadow-sm hover:shadow-md hover:border-black/20 transition-colors duration-300 flex flex-col overflow-hidden text-black">
                <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <Image width={200} height={200} unoptimized src={imageUrl} alt={product.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl opacity-30">🛒</span>
                  )}
                  {product.quantityAvailable === 0 && (
                     <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                       Sold Out
                     </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-black leading-tight">{product.title}</h3>
                    <span className="text-purple-600 font-extrabold text-base shrink-0">{price}</span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-black/60 mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="mt-auto pt-3">
                    <button
                      onClick={() => handleCheckoutClick(product)}
                      disabled={product.quantityAvailable === 0}
                      className="w-full block text-center bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-[0.1em] py-2.5 transition-colors cursor-pointer shadow-sm"
                    >
                      {product.quantityAvailable === 0 ? 'Sold Out' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
           <div className="text-center text-black/40 text-sm mt-10 font-medium">No products found in this category.</div>
        )}

      </div>

      {/* ─── SECURE STORE CHECKOUT MODAL ─── */}
      {showCheckoutModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh] text-black">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-base">🛍️</span>
                <span className="text-xs font-black uppercase tracking-wider text-black">Store Checkout Gateway</span>
              </div>
              {checkoutStep !== 'processing' && (
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer border-none"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto pr-1">
              
              {checkoutStep === 'form' && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  
                  {/* Selected product card summary */}
                  <div className="flex gap-4 p-3 bg-gray-50 border border-black/10">
                    <div className="w-16 h-16 bg-white border border-black/10 rounded-lg flex items-center justify-center p-1 relative shrink-0">
                      {selectedProduct.images?.edges?.[0]?.node?.url ? (
                        <Image width={200} height={200} unoptimized 
                          src={selectedProduct.images.edges[0].node.url} 
                          alt={selectedProduct.title} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl">🛍️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-black font-black text-sm truncate leading-snug">{selectedProduct.title}</h4>
                      <p className="text-purple-600 font-extrabold text-xs mt-0.5">
                        {selectedProduct.variants?.edges?.[0]?.node?.price?.amount 
                          ? `$${parseFloat(selectedProduct.variants.edges[0].node.price.amount).toFixed(2)}` 
                          : 'TBD'}
                      </p>
                      {selectedProduct.description && (
                        <p className="text-black/50 text-[var(--font-size-3xs)] line-clamp-1 mt-1 font-sans">{selectedProduct.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Apparel sizing / colors */}
                  {selectedProduct.title.toLowerCase().match(/shirt|tee|hoodie|sweat|jersey|jacket|tank|hat|cap/) && (
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-black/10 p-3">
                      <div>
                        <label htmlFor="store-checkout-size" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">Select Size</label>
                        <select 
                          id="store-checkout-size"
                          value={checkoutSelectedSize}
                          onChange={e => setCheckoutSelectedSize(e.target.value)}
                          className="w-full bg-white border border-black/15 rounded-lg p-2 text-xs text-black outline-none focus:border-purple-600 font-sans cursor-pointer"
                        >
                          <option value="S">S (Small)</option>
                          <option value="M">M (Medium)</option>
                          <option value="L">L (Large)</option>
                          <option value="XL">XL (Extra Large)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="store-checkout-color" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">Select Color</label>
                        <select 
                          id="store-checkout-color"
                          value={checkoutSelectedColor}
                          onChange={e => setCheckoutSelectedColor(e.target.value)}
                          className="w-full bg-white border border-black/15 rounded-lg p-2 text-xs text-black outline-none focus:border-purple-600 font-sans cursor-pointer"
                        >
                          <option value="Black">Black</option>
                          <option value="White">White</option>
                          <option value="Heather Grey">Heather Grey</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Delivery method toggle */}
                  <div className="space-y-1.5">
                    <span className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block font-sans">Delivery Option</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutDeliveryMethod('shipping')}
                        className={`py-2 px-3  border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          checkoutDeliveryMethod === 'shipping'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white border-black/15 text-black/70 hover:bg-gray-50'
                        }`}
                      >
                        <span>📦</span> Ship Home
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutDeliveryMethod('merch_table')}
                        className={`py-2 px-3  border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          checkoutDeliveryMethod === 'merch_table'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white border-black/15 text-black/70 hover:bg-gray-50'
                        }`}
                      >
                        <span>🏟️</span> Table Pickup
                      </button>
                    </div>
                  </div>

                  {/* Details forms */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label htmlFor="store-checkout-name" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">Full Name</label>
                      <input
                        id="store-checkout-name"
                        type="text"
                        required
                        value={shippingDetails.name}
                        onChange={e => setShippingDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full bg-white border border-black/15 p-2.5 text-xs text-black placeholder:text-black/40 focus:border-purple-600 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label htmlFor="store-checkout-email" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">Email Address</label>
                      <input
                        id="store-checkout-email"
                        type="email"
                        required
                        value={shippingDetails.email}
                        onChange={e => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                        className="w-full bg-white border border-black/15 p-2.5 text-xs text-black placeholder:text-black/40 focus:border-purple-600 focus:outline-none font-sans"
                      />
                    </div>
                    
                    {checkoutDeliveryMethod === 'shipping' && (
                      <>
                        <div>
                          <label htmlFor="store-checkout-address" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">Shipping Address</label>
                          <input
                            id="store-checkout-address"
                            type="text"
                            required
                            value={shippingDetails.address}
                            onChange={e => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="123 Main St"
                            className="w-full bg-white border border-black/15 p-2.5 text-xs text-black placeholder:text-black/40 focus:border-purple-600 focus:outline-none font-sans"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label htmlFor="store-checkout-city" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">City</label>
                            <input
                              id="store-checkout-city"
                              type="text"
                              required
                              value={shippingDetails.city}
                              onChange={e => setShippingDetails(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="Chicago"
                              className="w-full bg-white border border-black/15 p-2.5 text-xs text-black placeholder:text-black/40 focus:border-purple-600 focus:outline-none font-sans"
                            />
                          </div>
                          <div>
                            <label htmlFor="store-checkout-zip" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">ZIP Code</label>
                            <input
                              id="store-checkout-zip"
                              type="text"
                              required
                              value={shippingDetails.zip}
                              onChange={e => setShippingDetails(prev => ({ ...prev, zip: e.target.value }))}
                              placeholder="60601"
                              className="w-full bg-white border border-black/15 p-2.5 text-xs text-black placeholder:text-black/40 focus:border-purple-600 focus:outline-none font-sans"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="store-checkout-card" className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/50 font-bold block mb-1 font-sans">Card Details (Mock)</label>
                      <input
                        id="store-checkout-card"
                        type="text"
                        required
                        value={shippingDetails.card}
                        onChange={e => setShippingDetails(prev => ({ ...prev, card: e.target.value }))}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-white border border-black/15 p-2.5 text-xs text-black placeholder:text-black/40 focus:border-purple-600 focus:outline-none font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 text-white font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-colors cursor-pointer border-none mt-2 font-sans shadow-md"
                  >
                    Authorize Payment
                  </button>
                </form>
              )}

              {checkoutStep === 'processing' && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 border-4 border-black/10 border-t-purple-600 rounded-full animate-spin mx-auto" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-black/80 font-sans">Securing payment</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/50 max-w-[200px] mx-auto font-sans">Connecting to Shopify checkout secure gateways...</p>
                </div>
              )}

              {checkoutStep === 'success' && (() => {
                const titleLower = selectedProduct.title.toLowerCase();
                const isClothing = titleLower.match(/shirt|tee|hoodie|sweat|jersey|jacket|tank|hat|cap/);
                const price = selectedProduct.variants?.edges?.[0]?.node?.price?.amount 
                  ? `$${parseFloat(selectedProduct.variants.edges[0].node.price.amount).toFixed(2)}` 
                  : '$45.00';
                return (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black uppercase tracking-wider font-sans">Purchase Successful!</h3>
                      <p className="text-xs text-black/60 mt-1 max-w-[240px] mx-auto font-sans">
                        {checkoutDeliveryMethod === 'merch_table' ? (
                          <span>Your order for the <strong>{selectedProduct.title}</strong> is confirmed. Please check your email for your single-use QR code to claim your item.</span>
                        ) : (
                          <span>Your order for the <strong>{selectedProduct.title}</strong> is confirmed.</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-black/10 p-4 text-left space-y-3">
                      {/* Product Image */}
                      <div className="flex justify-center">
                        <Image width={200} height={200} unoptimized 
                          src={selectedProduct.images?.edges?.[0]?.node?.url || '/images/merch/vinyl.png'} 
                          alt={selectedProduct.title} 
                          className="w-28 h-28 object-cover border border-black/10 shadow-sm" 
                        />
                      </div>

                      {/* Product Description */}
                      {selectedProduct.description && (
                        <p className="text-[var(--font-size-2xs)] text-black/60 text-center leading-relaxed font-sans px-2">
                          {selectedProduct.description}
                        </p>
                      )}

                      {/* Order Details */}
                      <div className="space-y-1.5 pt-2 border-t border-black/10">
                        <p className="text-[var(--font-size-3xs)] text-black/50 uppercase font-bold tracking-widest font-sans mb-1.5">Order Details</p>
                        <p className="text-xs font-bold text-black font-sans">Recipient: <span className="font-normal text-black/70">{shippingDetails.name}</span></p>
                        <p className="text-xs font-bold text-black font-sans truncate">Product: <span className="font-normal text-black/70">{selectedProduct.title}</span></p>
                        {isClothing && checkoutSelectedSize && (
                          <p className="text-xs font-bold text-black font-sans">Size: <span className="font-normal text-black/70">{checkoutSelectedSize}</span></p>
                        )}
                        {isClothing && checkoutSelectedColor && (
                          <p className="text-xs font-bold text-black font-sans">Color: <span className="font-normal text-black/70 inline-flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full border border-black/20" style={{ background: checkoutSelectedColor === 'Black' ? '#1a1a1a' : checkoutSelectedColor === 'White' ? '#f5f5f5' : '#888' }} />
                            {checkoutSelectedColor}
                          </span></p>
                        )}
                        <p className="text-xs font-bold text-black font-sans">Method: <span className="font-normal text-black/70">{checkoutDeliveryMethod === 'merch_table' ? 'Merch Table Pickup' : 'Shipped to Home'}</span></p>
                        {checkoutDeliveryMethod === 'shipping' && (
                          <p className="text-xs font-bold text-black font-sans truncate">Ship To: <span className="font-normal text-black/70">{shippingDetails.address}, {shippingDetails.city}</span></p>
                        )}
                        <p className="text-xs font-bold text-black font-sans">Price Paid: <span className="font-normal text-black/70">{price}</span></p>
                      </div>
                    </div>

                    {/* Email confirmation notice */}
                    {shippingDetails.email && (
                      <p className="text-xs text-emerald-700 font-sans flex items-center justify-center gap-1.5 font-bold">
                        <span>📧</span>
                        <span>Confirmation email sent to <span className="underline underline-offset-2">{shippingDetails.email}</span></span>
                      </p>
                    )}

                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="w-full py-3 bg-purple-600 text-white font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-colors cursor-pointer border-none font-sans shadow-md"
                    >
                      Close Gateway
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
