'use client';

import { useMemo } from 'react';
import type { NavItem } from '@/types';

/**
 * Dummy values (replace with your real auth/org system later)
 */
const dummyOrg = {
  id: 'org_123',
  name: 'Sheikh Sahab Organization'
};

const dummyUser = {
  id: 'user_001',
  name: 'Athar'
};

const dummyMembership = {
  role: 'admin', // "admin" | "member" | "viewer" | etc
  permissions: ['manage_users', 'view_dashboard', 'edit_projects']
};

/**
 * Simplified hook — NO CLERK, NO external dependencies.
 */
export function useFilteredNavItems(items: NavItem[]) {
  // Prepare access context (dummy for now)
  const accessContext = useMemo(() => {
    return {
      organization: dummyOrg,
      user: dummyUser,
      permissions: dummyMembership.permissions,
      role: dummyMembership.role,
      hasOrg: !!dummyOrg
    };
  }, []);

  // Filter client-side
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (!item.access) return true;

        // Require an organization?
        if (item.access.requireOrg && !accessContext.hasOrg) return false;

        // Permission check
        if (item.access.permission) {
          if (!accessContext.permissions.includes(item.access.permission)) {
            return false;
          }
        }

        // Role check
        if (item.access.role) {
          if (accessContext.role !== item.access.role) return false;
        }

        return true;
      })
      .map((item) => {
        if (!item.items || item.items.length === 0) return item;

        const filteredChildren = item.items.filter((child) => {
          if (!child.access) return true;

          if (child.access.requireOrg && !accessContext.hasOrg) return false;

          if (child.access.permission) {
            if (!accessContext.permissions.includes(child.access.permission)) {
              return false;
            }
          }

          if (child.access.role) {
            if (accessContext.role !== child.access.role) return false;
          }

          return true;
        });

        return { ...item, items: filteredChildren };
      });
  }, [items, accessContext]);

  return filteredItems;
}
