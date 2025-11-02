'use client';

import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';
import { useRouter } from 'next/navigation';
import Dock from './Dock';

export default function DockWrapper() {
  const router = useRouter();

  const items = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => router.push('/dashboard') },
    { icon: <VscArchive size={18} />, label: 'Trade', onClick: () => router.push('/trade') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => router.push('/profile') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => router.push('/settings') },
  ];

  return (
    <Dock 
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
    />
  );
}
