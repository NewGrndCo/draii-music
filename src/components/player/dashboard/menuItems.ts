
import { 
  LayoutDashboard, 
  Library, 
  BarChart, 
  MessageSquare,
  Settings,
  Wallet,
  PieChart,
  Users,
  FileText,
  Bell,
  Heart
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mining', label: 'Mining', icon: PieChart },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'listeners', label: 'Listeners', icon: Users },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];
