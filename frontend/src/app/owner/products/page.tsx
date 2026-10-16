'use client';

import { useEffect, useState } from 'react';
import { Download, Eye, EyeOff, Package, Pencil, Plus, QrCode, Search, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { generateQRCodeSVG } from '../../../utils/qr';
import { BRAND } from '../../../lib/brand';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Field } from '../../../components/ui/Field';
import { Empty, Loading } from '../../../components/ui/States';
import type { Product, Store } from '../../../types';

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  price: string;
  stockQty: string;
  reorderPoint: string;
  gstPercent: string;
  discountPercent: string;
  expiryDate: string;
  imageUrl: string;
  description: string;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  sku: '',
  category: '',
  price: '',
  stockQty: '',
  reorderPoint: '10',
  gstPercent: '18',
  discountPercent: '0',
  expiryDate: '',
  imageUrl: '',
  description: '',
};

const formFromProduct = (p: Product): ProductForm => ({
  name: p.name,
  sku: p.sku,
  category: p.category,
  price: String(p.price),
  stockQty: String(p.stockQty),
  reorderPoint: String(p.reorderPoint),
  gstPercent: String(p.gstPercent),
  discountPercent: String(p.discountPercent),
  expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '',
  imageUrl: p.imageUrl ?? '',
  description: p.description ?? '',
});

export default function ProductsDirectory() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const setField = (key: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const loadCatalog = async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try {
      const params = `storeId=${user.storeId}&search=${encodeURIComponent(search)}&category=${selectedCategory}&status=${selectedStatus}`;
      const res = await apiFetch(`/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setCategories(data.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [user, search, selectedCategory, selectedStatus]);

  // The store name is printed on QR labels.
  useEffect(() => {
    if (!user?.storeId) return;
    apiFetch(`/api/stores/${user.storeId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setStore)
      .catch(console.error);
  }, [user]);

  const openAddForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditing(product);
    setForm(formFromProduct(product));
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku,
      category: form.category,
      price: parseFloat(form.price),
      stockQty: parseInt(form.stockQty),
      reorderPoint: parseInt(form.reorderPoint),
      description: form.description,
      imageUrl: form.imageUrl,
      gstPercent: parseFloat(form.gstPercent),
      discountPercent: parseFloat(form.discountPercent),
      expiryDate: form.expiryDate || null,
    };

    try {
      const res = await apiFetch(editing ? `/api/products/${editing.id}` : '/api/products', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormOpen(false);
        loadCatalog();
        notify(editing ? 'Product updated.' : 'Product added.', 'success');
      } else {
        const err = await res.json();
        notify(err.error || 'Could not save the product.', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Could not save the product.', 'error');
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      const res = await apiFetch(`/api/products/${product.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) loadCatalog();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      const res = await apiFetch(`/api/products/${deleting.id}`, { method: 'DELETE' });
      if (res.ok) {
        notify(`${deleting.name} deleted.`, 'success');
        loadCatalog();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const qrPayload = (p: Product) => JSON.stringify({ v: 1, sid: user?.storeId, pid: p.id, sku: p.sku });

  // Builds an A6 label with the QR code and downloads it as a PDF.
  const downloadLabel = (product: Product) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a6' });
    const url = URL.createObjectURL(new Blob([generateQRCodeSVG(qrPayload(product))], { type: 'image/svg+xml' }));
    const img = new Image();
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 10, 10, 280, 280);

      doc.setDrawColor(15, 138, 92);
      doc.setLineWidth(1);
      doc.rect(5, 5, 95, 138);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(20, 24, 31);
      doc.text(store?.name ?? BRAND.name, 52.5, 20, { align: 'center' });

      doc.setDrawColor(231, 230, 223);
      doc.setLineWidth(0.5);
      doc.line(15, 26, 90, 26);

      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 20, 32, 65, 65);

      doc.setFontSize(12);
      doc.text(product.name, 52.5, 108, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(95, 102, 114);
      doc.text(`SKU: ${product.sku}`, 52.5, 116, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 138, 92);
      doc.text(`Rs. ${product.price.toFixed(2)}`, 52.5, 128, { align: 'center' });

      doc.save(`QR_${product.sku}.pdf`);
      URL.revokeObjectURL(url);
    };
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Your catalog. Every product gets its own QR label."
        actions={
          <button onClick={openAddForm} className="btn-primary">
            <Plus className="h-4 w-4" /> Add product
          </button>
        }
      />

      <div className="card mb-6 flex flex-col gap-3 p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category"
            className="input pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:w-96">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input" aria-label="Category">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="input" aria-label="Status">
            <option value="all">All statuses</option>
            <option value="active">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading products…" />
      ) : products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const lowStock = product.stockQty < product.reorderPoint;
            return (
              <article key={product.id} className={`card flex flex-col p-5 ${product.isActive ? '' : 'opacity-60'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="badge-neutral">{product.category}</span>
                  <span className={lowStock ? 'badge-bad' : 'badge-good'}>{product.stockQty} in stock</span>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug">{product.name}</h3>
                <p className="mt-0.5 font-mono text-xs text-muted">{product.sku}</p>

                <div className="mt-4 flex items-baseline justify-between">
                  <p className="tabular font-display text-2xl font-bold">{formatINR(product.price)}</p>
                  <p className="text-xs text-muted">GST {product.gstPercent}%</p>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
                  <button onClick={() => openEditForm(product)} className="btn-secondary btn-sm flex-1">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => setQrProduct(product)} className="btn-icon border border-line" aria-label={`QR label for ${product.name}`}>
                    <QrCode className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(product)}
                    className="btn-icon border border-line"
                    aria-label={product.isActive ? `Disable ${product.name}` : `Enable ${product.name}`}
                  >
                    {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setDeleting(product)} className="btn-icon border border-line hover:text-bad-fg" aria-label={`Delete ${product.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <Empty
            icon={<Package className="h-5 w-5" />}
            title="No products found"
            description="Try a different search, or add your first product."
            action={
              <button onClick={openAddForm} className="btn-primary">
                <Plus className="h-4 w-4" /> Add product
              </button>
            }
          />
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit product' : 'Add product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name">
              <input required value={form.name} onChange={setField('name')} placeholder="Wireless mouse" className="input" />
            </Field>
            <Field label="SKU" hint="Unique code printed on the label.">
              <input required value={form.sku} onChange={setField('sku')} placeholder="MOUSE-WL-101" className="input" />
            </Field>
            <Field label="Price (₹)">
              <input type="number" step="0.01" min="0" required value={form.price} onChange={setField('price')} placeholder="1499" className="input" />
            </Field>
            <Field label="Stock quantity">
              <input type="number" min="0" required value={form.stockQty} onChange={setField('stockQty')} placeholder="45" className="input" />
            </Field>
            <Field label="Category">
              <input required value={form.category} onChange={setField('category')} placeholder="Electronics" className="input" />
            </Field>
            <Field label="Low-stock alert at">
              <input type="number" min="0" required value={form.reorderPoint} onChange={setField('reorderPoint')} className="input" />
            </Field>
            <Field label="GST (%)">
              <input type="number" step="0.1" min="0" required value={form.gstPercent} onChange={setField('gstPercent')} className="input" />
            </Field>
            <Field label="Discount (%)">
              <input type="number" step="0.1" min="0" required value={form.discountPercent} onChange={setField('discountPercent')} className="input" />
            </Field>
          </div>

          <Field label="Image URL (optional)">
            <input type="url" value={form.imageUrl} onChange={setField('imageUrl')} placeholder="https://…" className="input" />
          </Field>
          <Field label="Expiry date (optional)">
            <input type="date" value={form.expiryDate} onChange={setField('expiryDate')} className="input" />
          </Field>
          <Field label="Description (optional)">
            <textarea rows={3} value={form.description} onChange={setField('description')} className="input" />
          </Field>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save product
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!qrProduct} onClose={() => setQrProduct(null)} title="QR label" width="sm:max-w-sm">
        {qrProduct && (
          <div className="text-center">
            <p className="text-lg font-semibold">{qrProduct.name}</p>
            <p className="mt-0.5 font-mono text-xs text-muted">{qrProduct.sku}</p>
            <p className="tabular mt-2 font-display text-xl font-bold">{formatINR(qrProduct.price)}</p>

            <div
              className="mx-auto my-5 h-48 w-48 rounded-2xl border border-line bg-white p-3"
              dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(qrPayload(qrProduct)) }}
            />

            <button onClick={() => downloadLabel(qrProduct)} className="btn-primary w-full">
              <Download className="h-4 w-4" /> Download PDF label
            </button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete product?"
        message={`"${deleting?.name}" will be removed from your catalog.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
