import React, { useState } from 'react';
import AdminLayout from '@/admin/AdminLayout';
import Dashboard from '@/admin/modules/Dashboard';
import Library from '@/admin/modules/Library';
import Analytics from '@/admin/modules/Analytics';
import Events from '@/admin/modules/Events';
import Merch from '@/admin/modules/Merch';
import Settings from '@/admin/modules/Settings';
import MailingList from '@/admin/modules/MailingList';
import SupportFund from '@/admin/modules/SupportFund';

const Admin: React.FC = () => {
  const [tab, setTab] = useState<string>('dashboard');

  return (
    <AdminLayout active={tab} onChange={setTab}>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'library'   && <Library />}
      {tab === 'analytics' && <Analytics />}
      {tab === 'events'    && <Events />}
      {tab === 'merch'     && <Merch />}
      {tab === 'support'   && <SupportFund />}
      {tab === 'mailing'   && <MailingList />}
      {tab === 'settings'  && <Settings />}
    </AdminLayout>
  );
};

export default Admin;
