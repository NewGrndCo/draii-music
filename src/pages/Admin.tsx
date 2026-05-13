import React, { useState, lazy, Suspense } from 'react';
import AdminLayout from '@/admin/AdminLayout';

const Dashboard          = lazy(() => import('@/admin/modules/Dashboard'));
const Library            = lazy(() => import('@/admin/modules/Library'));
const Analytics          = lazy(() => import('@/admin/modules/Analytics'));
const Events             = lazy(() => import('@/admin/modules/Events'));
const Merch              = lazy(() => import('@/admin/modules/Merch'));
const Settings           = lazy(() => import('@/admin/modules/Settings'));
const MailingList        = lazy(() => import('@/admin/modules/MailingList'));
const SupportFund        = lazy(() => import('@/admin/modules/SupportFund'));
const PredictiveInsights = lazy(() => import('@/admin/modules/PredictiveInsights'));
const ArtistOutreach     = lazy(() => import('@/admin/modules/ArtistOutreach'));
const ArtistPlanning     = lazy(() => import('@/admin/modules/ArtistPlanning'));

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
        {tab === 'library'    && <Library />}
        {tab === 'analytics'  && <Analytics />}
        {tab === 'predictive' && <PredictiveInsights />}
        {tab === 'outreach'   && <ArtistOutreach />}
        {tab === 'planning'   && <ArtistPlanning />}
        {tab === 'events'     && <Events />}
        {tab === 'merch'      && <Merch />}
        {tab === 'support'    && <SupportFund />}
        {tab === 'mailing'    && <MailingList />}
        {tab === 'settings'   && <Settings />}
      </Suspense>
    </AdminLayout>
  );
};

export default Admin;
