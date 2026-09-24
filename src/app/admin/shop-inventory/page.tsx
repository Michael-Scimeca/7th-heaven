"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useMember } from "@/context/MemberContext";

type Variant = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  active: boolean;
  sort_order: number;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  category: "Shirts" | "Albums" | "Hats";
  variant_kind: "Size" | "Format" | "Color";
  active: boolean;
  sort_order: number;
  variants: Variant[];
};

type Order = {
  id: string;
  tran_nbr: string;
  status: "pending" | "paid" | "failed";
  line_items: {
    title: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
  }[];
  total_amount: number;
  created_at: string;
  formatted_date?: string;
};

const CATEGORIES = ["Shirts", "Albums", "Hats"] as const;
const VARIANT_KINDS = ["Size", "Format", "Color"] as const;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ShopInventoryAdminPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const devBypass = useSyncExternalStore(
    () => () => {},
    () =>
      process.env.NODE_ENV === "development" &&
      localStorage.getItem("7h_dev_bypass") === "true",
    () => false,
  );

  const allowedRoles = ["admin", "crew", "merch"];
  const authorized =
    devBypass ||
    (isLoggedIn && !!member?.role && allowedRoles.includes(member.role));

  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/shop-inventory/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products.");
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/shop-inventory/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(
          (data || []).map((o: Order) => ({
            ...o,
            formatted_date: formatOrderDate(o.created_at),
          })),
        );
      }
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([loadProducts(), loadOrders()]).finally(() =>
      setLoading(false),
    );
  }, [authorized, loadProducts, loadOrders]);

  const lowStockCount = useMemo(
    () =>
      products.reduce(
        (n, p) =>
          n +
          p.variants.filter(
            (v) => v.active && v.stock_quantity <= v.low_stock_threshold,
          ).length,
        0,
      ),
    [products],
  );

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 pt-32 pb-24">
        <div className="w-full max-w-md rounded-lg border border-white/[0.12] bg-white/[0.04] p-8 text-center">
          <h2 className="mb-2 text-xl">Admin Access Required</h2>
          <p className="mb-6">
            This page manages real inventory and pricing. Sign in with an admin,
            crew, or merch account to continue.
          </p>
          <button
            type="button"
            onClick={() => openModal("login")}
            className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="site-container mx-auto max-w-5xl px-6">
        <Link
          href="/payment-test"
          className="mb-6 flex items-center gap-2 text-purple-400 transition-colors hover:text-white"
        >
          ← Back to Shop
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-1 inline-block text-[10px]">Shop Backend</span>
            <h1>Inventory Management</h1>
            {lowStockCount > 0 && (
              <p className="text-yellow-300">
                ⚠️ {lowStockCount} variant{lowStockCount === 1 ? "" : "s"} at or
                below its low-stock threshold
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAddProduct(true)}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2.5 transition-colors hover:bg-[var(--color-accent)]/80"
          >
            + Add Product
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`rounded-lg px-4 py-2 transition-colors ${activeTab === "products" ? "bg-cyan-500 text-black" : "border border-white/10 bg-[#00000029] hover:text-white"}`}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`rounded-lg px-4 py-2 transition-colors ${activeTab === "orders" ? "bg-cyan-500 text-black" : "border border-white/10 bg-[#00000029] hover:text-white"}`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center">Loading…</p>
        ) : activeTab === "products" ? (
          <ProductsTab products={products} onChanged={loadProducts} />
        ) : (
          <OrdersTab orders={orders} />
        )}
      </div>

      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onCreated={() => {
            setShowAddProduct(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Products tab
// ─────────────────────────────────────────────────────────────────────────

function ProductsTab({
  products,
  onChanged,
}: {
  products: Product[];
  onChanged: () => void;
}) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center">No products yet — add one above.</p>
    );
  }
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductRow key={product.id} product={product} onChanged={onChanged} />
      ))}
    </div>
  );
}

function ProductRow({
  product,
  onChanged,
}: {
  product: Product;
  onChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    try {
      await fetch(`/api/admin/shop-inventory/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async () => {
    if (
      !confirm(
        `Delete "${product.title}" and all its variants? This can't be undone.`,
      )
    )
      return;
    setBusy(true);
    try {
      await fetch(`/api/admin/shop-inventory/products/${product.id}`, {
        method: "DELETE",
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white/[0.04] ${product.active ? "border-white/[0.12]" : "border-white/[0.06] opacity-50"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] p-4">
        <div className="flex min-w-0 items-center gap-3">
          {product.image_url ? (
            <Image
              width={48}
              height={48}
              unoptimized
              src={product.image_url}
              alt={product.title}
              className="h-12 w-12 rounded-lg bg-[#00000029] object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00000029] text-white/30">
              No Pic
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate">{product.title}</h3>
              <span className="rounded bg-[#00000029] px-2 py-0.5 text-[10px] text-white/40">
                {product.category}
              </span>
            </div>
            <p className="truncate">
              {product.description || "No description."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={toggleActive}
            className={`rounded-lg px-3 py-1.5 transition-colors ${product.active ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border border-white/10 bg-[#00000029] text-white/40"}`}
          >
            {product.active ? "Active" : "Inactive"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={deleteProduct}
            className="rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-1.5 text-rose-300 transition-colors hover:bg-rose-500/30"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg bg-[#00000029] px-3 py-1.5 text-white/70 transition-colors hover:text-white"
          >
            {expanded
              ? "Collapse"
              : `Variants (${product.variants?.length || 0})`}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-2 bg-black/20 p-4">
          <div className="mb-2 text-[10px] text-white/40">
            Variants ({product.variant_kind})
          </div>
          {(product.variants || []).map((variant) => (
            <VariantRow
              key={variant.id}
              variant={variant}
              onChanged={onChanged}
            />
          ))}

          {showAddVariant ? (
            <AddVariantForm
              productId={product.id}
              onDone={() => {
                setShowAddVariant(false);
                onChanged();
              }}
              onCancel={() => setShowAddVariant(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddVariant(true)}
              className="mt-2"
            >
              + Add {product.variant_kind.toLowerCase()} variant
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function VariantRow({
  variant,
  onChanged,
}: {
  variant: Variant;
  onChanged: () => void;
}) {
  const [label, setLabel] = useState(() => variant.label);
  const [price, setPrice] = useState(() => String(variant.price));
  const [stock, setStock] = useState(() => String(variant.stock_quantity));
  const [lowStock, setLowStock] = useState(() =>
    String(variant.low_stock_threshold),
  );
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  const markDirty = () => setDirty(true);

  const save = async () => {
    setBusy(true);
    try {
      await fetch(`/api/admin/shop-inventory/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          price: parseFloat(price) || 0,
          stockQuantity: Math.max(0, parseInt(stock, 10) || 0),
          lowStockThreshold: Math.max(0, parseInt(lowStock, 10) || 0),
        }),
      });
      setDirty(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async () => {
    setBusy(true);
    try {
      await fetch(`/api/admin/shop-inventory/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !variant.active }),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const deleteVariant = async () => {
    if (!confirm(`Delete variant "${variant.label}"?`)) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/shop-inventory/variants/${variant.id}`, {
        method: "DELETE",
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const isLow = Number(stock) <= Number(lowStock) && Number(stock) > 0;
  const isOut = Number(stock) <= 0;

  return (
    <div className="grid grid-cols-2 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 sm:grid-cols-6">
      <input
        value={label}
        onChange={(e) => {
          setLabel(e.target.value);
          markDirty();
        }}
        className="col-span-2 rounded border border-white/10 bg-[#00000029] px-2 py-1.5 sm:col-span-1"
        placeholder="Label"
      />
      <div className="flex items-center gap-1">
        <span className="text-white/30">$</span>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            markDirty();
          }}
          className="form-input !px-2 !py-1.5"
        />
      </div>
      <div>
        <input
          type="number"
          value={stock}
          onChange={(e) => {
            setStock(e.target.value);
            markDirty();
          }}
          className={`form-input !px-2 !py-1.5 ${isOut ? "border-rose-500/50" : isLow ? "border-yellow-500/50" : ""}`}
          title="Stock quantity"
        />
        {isOut && <span className="text-[12px] text-rose-400">SOLD OUT</span>}
        {isLow && (
          <span className="text-[12px] text-yellow-400">LOW STOCK</span>
        )}
      </div>
      <div>
        <input
          type="number"
          value={lowStock}
          onChange={(e) => {
            setLowStock(e.target.value);
            markDirty();
          }}
          className="form-input !px-2 !py-1.5"
          title="Low-stock threshold"
        />
      </div>
      <div className="col-span-2 flex items-center justify-end gap-1.5 sm:col-span-1">
        {dirty && (
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="rounded-md bg-[var(--color-accent)] px-2.5 py-1.5 text-[10px]"
          >
            Save
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={toggleActive}
          className={`rounded-lg px-2 py-1.5 text-[10px] ${variant.active ? "bg-emerald-500/15 text-emerald-300" : "bg-[#00000029] text-white/40"}`}
        >
          {variant.active ? "On" : "Off"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={deleteVariant}
          className="px-1 text-white/30 hover:text-rose-400"
          aria-label={`Delete ${variant.label}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function AddVariantForm({
  productId,
  onDone,
  onCancel,
}: {
  productId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!label || !price) {
      setError("Label and price are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/shop-inventory/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          label,
          price: parseFloat(price),
          stockQuantity: Math.max(0, parseInt(stock, 10) || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add variant.");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add variant.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-3">
      <div>
        <label className="mb-1 block text-[12px] text-white/40">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. XL"
          className="w-24 rounded border border-white/10 bg-[#00000029] px-2 py-1.5"
        />
      </div>
      <div>
        <label className="mb-1 block text-[12px] text-white/40">Price</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="w-24 rounded border border-white/10 bg-[#00000029] px-2 py-1.5"
        />
      </div>
      <div>
        <label className="mb-1 block text-[12px] text-white/40">Stock</label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-20 rounded border border-white/10 bg-[#00000029] px-2 py-1.5"
        />
      </div>
      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[10px]"
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md bg-[#00000029] px-3 py-1.5 text-[10px]"
      >
        Cancel
      </button>
      {error && <p className="w-full text-rose-400">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Add Product modal
// ─────────────────────────────────────────────────────────────────────────

function AddProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Shirts");
  const [variantKind, setVariantKind] =
    useState<(typeof VARIANT_KINDS)[number]>("Size");
  const [variants, setVariants] = useState([
    { id: "var-0", label: "", price: "", stock: "0" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateVariant = (
    i: number,
    field: "label" | "price" | "stock",
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)),
    );
  };

  const submit = async () => {
    setError("");
    if (!title) {
      setError("Title is required.");
      return;
    }
    const validVariants = variants.filter((v) => v.label && v.price);
    if (validVariants.length === 0) {
      setError("Add at least one variant with a label and price.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/shop-inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugify(title),
          title,
          description,
          imageUrl,
          category,
          variantKind,
          variants: validVariants.map((v) => ({
            label: v.label,
            price: parseFloat(v.price),
            stockQuantity: Math.max(0, parseInt(v.stock, 10) || 0),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product.");
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create product.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[45px]">
      <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border border-white/[0.12] bg-[#0e0e18] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2>Add Product</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-lg text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-white/40">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-white/40">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-white/40">
            Image URL
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/images/merch/logo-tee.png"
            className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[10px] text-white/40">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2.5"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-white/40">
              Variant Type
            </label>
            <select
              value={variantKind}
              onChange={(e) =>
                setVariantKind(e.target.value as typeof variantKind)
              }
              className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2.5"
            >
              {VARIANT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] text-white/40">
            Variants (
            {variantKind === "Size"
              ? "sizes"
              : variantKind === "Format"
                ? "formats"
                : "colors"}
            )
          </label>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={v.id} className="flex gap-2">
                <input
                  value={v.label}
                  onChange={(e) => updateVariant(i, "label", e.target.value)}
                  placeholder={
                    variantKind === "Size"
                      ? "M"
                      : variantKind === "Format"
                        ? "Vinyl LP"
                        : "Black"
                  }
                  className="flex-1 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3 py-2"
                />
                <input
                  type="number"
                  step="0.01"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  placeholder="Price"
                  className="w-20 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3 py-2"
                />
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  placeholder="Stock"
                  className="w-20 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3 py-2"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setVariants([
                ...variants,
                {
                  id: `var-${Date.now()}-${variants.length}`,
                  label: "",
                  price: "",
                  stock: "0",
                },
              ])
            }
            className="mt-2"
          >
            + Another variant
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400">
            ⚠️ {error}
          </div>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="w-full rounded-lg bg-[var(--color-accent)] py-3 transition-colors hover:bg-[var(--color-accent)]/80 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create Product"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Orders tab
// ─────────────────────────────────────────────────────────────────────────

const statusStyles: Record<Order["status"], string> = {
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
};

const ORDER_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatOrderDate(dateStr: string) {
  try {
    return ORDER_DATE_FORMATTER.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="py-12 text-center">No orders yet.</p>;
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>{order.tran_nbr}</span>
              <span
                className={`rounded-lg border px-2 py-0.5 text-[10px] ${statusStyles[order.status]}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/40">
                {order.formatted_date || order.created_at}
              </span>
              <span className="text-[var(--color-accent)]">
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
          <div>
            {(order.line_items || []).map((item, i) => (
              <span key={`${item.title}-${item.variantLabel}-${i}`}>
                {item.title} ({item.variantLabel}) × {item.quantity}
                {i < order.line_items.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
