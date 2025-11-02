'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import DockWrapper from './DockWrapper';

export default function ConditionalDock() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const noDockPages = ['/login', '/register', '/forgot-password'];

  if (status === 'authenticated' && !noDockPages.includes(pathname)) {
    return <DockWrapper />;
  }

  return null;
}
