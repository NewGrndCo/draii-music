import React, { useState, lazy, Suspense } from 'react';
import AdminLayout from '@/admin/AdminLayout';

const Dashboard   = lazy(() => import('@/admin/modules/Dashboard'));
const Songs       = lazy(() => import('@/admin/modules/Songs'));
const Releases    = lazy(() => import('@/admin/modules/Releases'));
const Artists     = lazy(() => import('@/admin/modules/Artists'));
const Genres      = lazy(() => import('@/admin/modules/Genres'));
const Analytics   = lazy(() => import('@/admin/modules/Analytics'));
const Events      = lazy(() => import('@/admin/modules/Events'));
const Merch       = lazy(() => import('@/admin/modules/Merch'));
const Settings    = lazy(() => import('@/admin/modules/Settings'));
const MailingList = lazy(() => import('@/admin/modules/MailingList'));
const Revenue     = lazy(() => import('@/admin/modules/Revenue'));

const Fallback = () => (
  <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
    Loading…
  </div>
);

const Admin: React.FC = () => {
  const [tab, setTab] = useState<string>('dashboard');

  return (
    <AdminLayout active={tab} onChange={setTab}>
      <Suspense fallback={<Fallback />}>
        {tab === 'dashboard'  && <Dashboard />}
        {tab === 'songs'      && <Songs />}
        {tab === 'releases'   && <Releases />}
        {tab === 'artists'    && <Artists />}
        {tab === 'genres'     && <Genres />}
        {tab === 'analytics'  && <Analytics />}
        {tab === 'revenue'    && <Revenue />}
        {tab === 'events'     && <Events />}
        {tab === 'merch'      && <Merch />}
        {tab === 'mailing'    && <MailingList />}
        {tab === 'settings'   && <Settings />}
      </Suspense>
    </AdminLayout>
  );
};

export default Admin;
