
import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  Sun, 
  Volume2, 
  Bell, 
  Cpu, // Fixed the import
  Shield, 
  Globe 
} from 'lucide-react';

const SettingsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">App Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon size={20} className="text-purple-400" />
              <span className="text-gray-300">Dark Mode</span>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-blue-400" />
              <span className="text-gray-300">Notifications</span>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 size={20} className="text-green-400" />
              <span className="text-gray-300">Sound Effects</span>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
      
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Mining Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={20} className="text-red-400" />
              <span className="text-gray-300">Auto-Optimization</span>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-yellow-400" />
              <span className="text-gray-300">Security Mode</span>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-purple-400" />
              <span className="text-gray-300">Global Network</span>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
      
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Account Settings</h3>
        <div className="space-y-4">
          <Button variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10">
            Change Password
          </Button>
          <Button variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10">
            Export Data
          </Button>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsContent;
