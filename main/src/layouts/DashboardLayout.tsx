import { Outlet } from 'react-router-dom';
import Sidebar from '../pages/Sidebar/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-dvh w-full overflow-hidden bg-[var(--bg-body)]">
      <Sidebar />
      <main className="h-dvh min-w-0 overflow-y-auto pl-[344px]">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
