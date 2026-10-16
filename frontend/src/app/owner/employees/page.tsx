'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatINR } from '../../../lib/plans';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Field } from '../../../components/ui/Field';
import { Empty, Loading } from '../../../components/ui/States';
import type { Employee, EmployeePerformance } from '../../../types';

const PERMISSION_OPTIONS = [
  { key: 'CASHIER_BILLING', label: 'Create checkout bills' },
  { key: 'EDIT_CATALOG', label: 'Edit products and prices' },
  { key: 'MANAGE_EMPLOYEES', label: 'View the staff roster' },
  { key: 'VIEW_REPORTS', label: 'See reports and ledgers' },
];

const humanize = (value: string) => value.toLowerCase().replace(/_/g, ' ');

export default function EmployeesRoster() {
  const { user, apiFetch } = useAuth();
  const { notify } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performances, setPerformances] = useState<EmployeePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [removing, setRemoving] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [permissions, setPermissions] = useState<string[]>(['CASHIER_BILLING']);

  const loadStaff = async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try {
      const [rosterRes, performanceRes] = await Promise.all([apiFetch('/api/employees'), apiFetch('/api/employees/performance')]);
      if (rosterRes.ok) setEmployees(await rosterRes.json());
      if (performanceRes.ok) setPerformances(await performanceRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [user]);

  const openForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('CASHIER');
    setPermissions(['CASHIER_BILLING']);
    setShowForm(true);
  };

  const togglePermission = (key: string) =>
    setPermissions((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, permissions }),
      });

      if (res.ok) {
        setShowForm(false);
        loadStaff();
        notify(`${name} was added to your team.`, 'success');
      } else {
        const err = await res.json();
        notify(err.error || 'Could not add this employee.', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Could not add this employee.', 'error');
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      const res = await apiFetch(`/api/employees/${removing.id}`, { method: 'DELETE' });
      if (res.ok) {
        notify(`${removing.user?.name ?? 'Employee'} was removed.`, 'success');
        loadStaff();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Add team members, choose what they can do and see who is selling."
        actions={
          <button onClick={openForm} className="btn-primary">
            <Plus className="h-4 w-4" /> Add employee
          </button>
        }
      />

      {loading ? (
        <Loading label="Loading your team…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card lg:col-span-2">
            <h2 className="px-6 pt-6 text-lg font-semibold">Team</h2>
            {employees.length > 0 ? (
              <ul className="mt-2 divide-y divide-line">
                {employees.map((employee) => (
                  <li key={employee.id} className="flex items-start justify-between gap-4 px-6 py-5">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-fg">
                        {(employee.user?.name ?? '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {employee.user?.name} <span className="badge-neutral ml-1 capitalize">{employee.role.toLowerCase()}</span>
                        </p>
                        <p className="truncate text-sm text-muted">{employee.user?.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {employee.permissions.map((permission) => (
                            <span key={permission} className="rounded-md bg-sunken px-2 py-0.5 text-xs capitalize text-muted">
                              {humanize(permission)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {employee.role !== 'OWNER' && (
                      <button onClick={() => setRemoving(employee)} className="btn-icon shrink-0 hover:text-bad-fg" aria-label={`Remove ${employee.user?.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={<Users className="h-5 w-5" />} title="No staff yet" description="Add a cashier or manager to share the work." />
            )}
          </section>

          <section className="card-pad h-fit">
            <h2 className="text-lg font-semibold">Sales by team member</h2>
            {performances.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {performances.map((p) => (
                  <li key={p.employeeId} className="flex items-center justify-between gap-3 rounded-xl bg-sunken p-4">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs capitalize text-muted">{p.role.toLowerCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular text-sm font-semibold">{formatINR(p.totalSalesGenerated)}</p>
                      <p className="text-xs text-muted">{p.transactionsCount} bills</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted">No sales recorded by staff yet.</p>
            )}
          </section>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add employee" width="sm:max-w-md">
        <form onSubmit={handleAdd} className="space-y-4">
          <Field label="Full name">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Amit Kumar" className="input" />
          </Field>
          <Field label="Login email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amit@yourstore.com" className="input" />
          </Field>
          <Field label="Password">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          </Field>
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
              <option value="MANAGER">Store manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="STAFF">General staff</option>
            </select>
          </Field>

          <fieldset>
            <legend className="label">Permissions</legend>
            <div className="space-y-1">
              {PERMISSION_OPTIONS.map((option) => (
                <label key={option.key} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-sunken">
                  <input
                    type="checkbox"
                    checked={permissions.includes(option.key)}
                    onChange={() => togglePermission(option.key)}
                    className="h-4 w-4 rounded border-line accent-[rgb(var(--brand))]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add employee
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removing}
        title="Remove employee?"
        message={`${removing?.user?.name ?? 'This person'} will lose access to your store immediately.`}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
