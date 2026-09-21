import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-light">
      <Sidebar />
      <main className="md:ml-28 lg:ml-[296px] pb-28 md:pb-8 pt-4 px-4 md:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto h-full relative">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
