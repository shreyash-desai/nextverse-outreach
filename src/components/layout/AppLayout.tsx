import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { initializeDemoData } from '../../data/demoData';

export function AppLayout() {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-light">
      <Sidebar />
      <main className="md:ml-28 lg:ml-[296px] pb-24 md:pb-6 pt-6 px-4 md:pr-6 md:pl-2 min-h-screen">
        <div className="max-w-7xl mx-auto h-full relative">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
