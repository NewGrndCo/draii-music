
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Settings, 
  Music, 
  CreditCard
} from 'lucide-react';

const NotificationsContent: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Mining Efficiency Report',
      message: 'Your mining efficiency has increased by 12% in the last 24 hours.',
      time: '12 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'alert',
      title: 'GPU Temperature Warning',
      message: 'GPU #5 has exceeded recommended temperature threshold. Consider reducing workload.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Payment Received',
      message: 'You received 245.87 KAS from the mining pool distribution.',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'info',
      title: 'New Listener',
      message: 'You have 15 new listeners from Germany today.',
      time: '5 hours ago',
      read: true
    },
    {
      id: 5,
      type: 'alert',
      title: 'Contract Update Required',
      message: 'Your artist contract requires updates to comply with new terms.',
      time: '1 day ago',
      read: true
    },
    {
      id: 6,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur on April 25th, 2025 at 02:00 UTC.',
      time: '2 days ago',
      read: true
    },
    {
      id: 7,
      type: 'success',
      title: 'Track Performance',
      message: '"Dutty Ways" has reached 1,000 plays. It\'s your best performing track this month!',
      time: '3 days ago',
      read: true
    }
  ];
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info size={18} className="text-blue-400" />;
      case 'alert':
        return <AlertTriangle size={18} className="text-yellow-400" />;
      case 'success':
        return <CheckCircle size={18} className="text-green-400" />;
      default:
        return <Info size={18} className="text-blue-400" />;
    }
  };
  
  const getCategoryIcon = (title: string) => {
    if (title.includes('Mining') || title.includes('GPU')) {
      return <Settings size={14} className="text-gray-400" />;
    }
    if (title.includes('Payment') || title.includes('KAS')) {
      return <CreditCard size={14} className="text-gray-400" />;
    }
    if (title.includes('Listener')) {
      return <User size={14} className="text-gray-400" />;
    }
    if (title.includes('Track') || title.includes('plays')) {
      return <Music size={14} className="text-gray-400" />;
    }
    return <Info size={14} className="text-gray-400" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/10 text-white">
            Mark All Read
          </Button>
          <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700">
            Settings
          </Button>
        </div>
      </div>
      
      <Card className="bg-black/30 p-0 border-0 divide-y divide-white/5">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 flex gap-3 ${notification.read ? 'opacity-70' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              notification.type === 'info' ? 'bg-blue-500/20' : 
              notification.type === 'alert' ? 'bg-yellow-500/20' : 'bg-green-500/20'
            }`}>
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-white flex items-center gap-1.5">
                  {notification.title}
                  {!notification.read && (
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  )}
                </h4>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock size={12} className="mr-1" />
                  {notification.time}
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-xs text-gray-400">
                  {getCategoryIcon(notification.title)}
                  <span className="ml-1">
                    {notification.title.includes('Mining') || notification.title.includes('GPU')
                      ? 'Mining'
                      : notification.title.includes('Payment') || notification.title.includes('KAS')
                      ? 'Payment'
                      : notification.title.includes('Listener')
                      ? 'Listeners'
                      : notification.title.includes('Track') || notification.title.includes('plays')
                      ? 'Content'
                      : 'System'}
                  </span>
                </div>
                {!notification.read && (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-purple-400 hover:text-purple-300">
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </Card>
      
      <div className="flex justify-center">
        <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white">
          Load More
        </Button>
      </div>
    </div>
  );
};

export default NotificationsContent;
