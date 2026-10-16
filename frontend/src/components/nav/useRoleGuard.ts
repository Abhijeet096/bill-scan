'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

type Area = 'customer' | 'owner';

/**
 * Sends signed-out visitors to the login page and people with the wrong role
 * to their own area. Returns true once the session is confirmed for this area.
 */
export const useRoleGuard = (area: Area) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const isCustomer = user?.role === 'CUSTOMER';
  const allowed = !!user && (area === 'customer' ? isCustomer : !isCustomer);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?portal=${area}`);
    else if (!allowed) router.replace(isCustomer ? '/customer/home' : '/owner/dashboard');
  }, [loading, user, allowed, isCustomer, area, router]);

  return { user, ready: !loading && allowed };
};
