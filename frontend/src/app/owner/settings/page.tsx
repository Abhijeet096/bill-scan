'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Store as StoreIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Field } from '../../../components/ui/Field';
import { Loading } from '../../../components/ui/States';
import type { Store } from '../../../types';

type SettingsForm = Pick<Store, 'name' | 'address' | 'paymentUpiId' | 'merchantName'> & {
  logoUrl: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
};

const EMPTY_FORM: SettingsForm = {
  name: '',
  address: '',
  logoUrl: '',
  paymentUpiId: '',
  merchantName: '',
  razorpayKeyId: '',
  razorpayKeySecret: '',
};

export default function StoreSettings() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const loadStore = async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/stores/${user.storeId}`);
      if (res.ok) {
        const store: Store = await res.json();
        setForm({
          name: store.name,
          address: store.address,
          logoUrl: store.logoUrl ?? '',
          paymentUpiId: store.paymentUpiId,
          merchantName: store.merchantName,
          razorpayKeyId: store.razorpayKeyId ?? '',
          razorpayKeySecret: store.razorpayKeySecret ?? '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/api/stores/${user?.storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        notify('Settings saved.', 'success');
        loadStore();
      } else {
        notify('Could not save your settings.', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Could not save your settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading settings…" />;

  return (
    <div>
      <PageHeader title="Settings" description="Your store profile and where customer payments go." />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <section className="card-pad space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-fg">
              <StoreIcon className="h-[18px] w-[18px]" />
            </span>
            <h2 className="text-lg font-semibold">Store profile</h2>
          </div>

          <Field label="Store name">
            <input required value={form.name} onChange={setField('name')} className="input" />
          </Field>
          <Field label="Address">
            <textarea required rows={3} value={form.address} onChange={setField('address')} className="input" />
          </Field>
          <Field label="Logo URL (optional)">
            <input type="url" value={form.logoUrl} onChange={setField('logoUrl')} placeholder="https://…" className="input" />
          </Field>
        </section>

        <section className="card-pad space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-fg">
              <CreditCard className="h-[18px] w-[18px]" />
            </span>
            <h2 className="text-lg font-semibold">Payments</h2>
          </div>

          <Field label="UPI ID" hint="UPI payments from customers are sent to this ID.">
            <input required value={form.paymentUpiId} onChange={setField('paymentUpiId')} placeholder="store@okaxis" className="input" />
          </Field>
          <Field label="Name shown to customers">
            <input required value={form.merchantName} onChange={setField('merchantName')} placeholder="Kumar Digital Mart" className="input" />
          </Field>
          <Field label="Razorpay key ID (optional)">
            <input value={form.razorpayKeyId} onChange={setField('razorpayKeyId')} placeholder="rzp_test_…" className="input" />
          </Field>
          <Field label="Razorpay secret (optional)">
            <input type="password" autoComplete="off" value={form.razorpayKeySecret} onChange={setField('razorpayKeySecret')} className="input" />
          </Field>
        </section>

        <div className="flex justify-end lg:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
