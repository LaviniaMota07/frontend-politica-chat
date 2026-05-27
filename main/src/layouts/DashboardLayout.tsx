import { Outlet } from 'react-router-dom';
import Sidebar from '../pages/Sidebar/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#08111f] max-[900px]:pl-[76px] max-[640px]:pl-[68px]">
      <Sidebar />
      <main className="flex h-screen min-w-0 flex-1 overflow-hidden bg-[#071a30] max-[900px]:h-dvh">
        <Outlet />
      </main>
    </div>
  );
}