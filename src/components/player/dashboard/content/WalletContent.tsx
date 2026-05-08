import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Download, Upload, Clock, ChevronRight, Wallet, Link, CreditCard, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStats } from '../hooks/useAdminStats';

const WalletContent: React.FC = () => {
  const [copySuccess, setCopySuccess] = useState('');
  const stats = useAdminStats();

  const walletAddresses = {
    solana: 'DRAii9zY4LhxH1RKvyFs6ymNxgXysmWVNz8Q4H9B1k9q',
    ethereum: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${type} address copied to clipboard`);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/30 p-6 border-0">
          <h3 className="text-xl font-medium text-white mb-4">KAS Balance</h3>
          <p className="text-4xl font-bold text-white mb-2">{stats.kasBalance.toLocaleString()}</p>
          <p className="text-sm text-gray-300 mb-4">≈ {stats.solBalance.toLocaleString()} SOL</p>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
              <Upload size={16} className="mr-1" /> Send
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
              <Download size={16} className="mr-1" /> Receive
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
              <ArrowRightLeft size={16} className="mr-1" /> Swap
            </Button>
          </div>
        </Card>
        
        <Card className="bg-black/30 p-6 border-0">
          <h3 className="text-xl font-medium text-white mb-4">SOL Balance</h3>
          <p className="text-4xl font-bold text-white mb-2">{stats.solBalance.toLocaleString()}</p>
          <p className="text-sm text-gray-300 mb-4">≈ ${stats.solValueInUsd.toLocaleString()} USD</p>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
              <Upload size={16} className="mr-1" /> Send
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
              <Download size={16} className="mr-1" /> Receive
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
              <ArrowRightLeft size={16} className="mr-1" /> Swap
            </Button>
          </div>
        </Card>
      </div>

      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Connected Wallets</h3>
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Wallet size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Solana</p>
                <p className="text-sm text-gray-400">{formatAddress(walletAddresses.solana)}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => copyToClipboard(walletAddresses.solana, 'Solana')}
              className="text-gray-400 hover:text-white"
            >
              <Link size={16} />
            </Button>
          </div>

          <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Landmark size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Ethereum</p>
                <p className="text-sm text-gray-400">{formatAddress(walletAddresses.ethereum)}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => copyToClipboard(walletAddresses.ethereum, 'Ethereum')}
              className="text-gray-400 hover:text-white"
            >
              <Link size={16} />
            </Button>
          </div>

          <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <CreditCard size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">Bitcoin</p>
                <p className="text-sm text-gray-400">{formatAddress(walletAddresses.bitcoin)}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => copyToClipboard(walletAddresses.bitcoin, 'Bitcoin')}
              className="text-gray-400 hover:text-white"
            >
              <Link size={16} />
            </Button>
          </div>
        </div>
      </Card>
      
      <Card className="bg-black/30 p-6 border-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-white">Transaction History</h3>
          <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 h-auto">
            View All <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="space-y-3">
          {[
            { 
              type: 'received', 
              amount: '1.24 SOL', 
              from: '0xfe3...c42a', 
              timestamp: '2h ago',
              status: 'completed'
            },
            { 
              type: 'sent', 
              amount: '185.62 KAS', 
              to: '0xa71...f95e', 
              timestamp: '1d ago',
              status: 'completed'
            },
            { 
              type: 'swap', 
              amount: '500 KAS → 3.75 SOL', 
              timestamp: '3d ago',
              status: 'completed'
            },
            { 
              type: 'received', 
              amount: '2,450.13 KAS', 
              from: 'Mining Pool', 
              timestamp: '4d ago',
              status: 'completed'
            },
            { 
              type: 'sent', 
              amount: '0.5 SOL', 
              to: '0xb3d...a18f', 
              timestamp: '1w ago',
              status: 'completed'
            }
          ].map((transaction, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'received' ? 'bg-green-500/20' : 
                  transaction.type === 'sent' ? 'bg-red-500/20' : 'bg-blue-500/20'
                }`}>
                  {transaction.type === 'received' && <Download size={18} className="text-green-400" />}
                  {transaction.type === 'sent' && <Upload size={18} className="text-red-400" />}
                  {transaction.type === 'swap' && <ArrowRightLeft size={18} className="text-blue-400" />}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-white capitalize">{transaction.type}</h4>
                  <div className="flex items-center text-xs text-gray-300">
                    <Clock size={12} className="mr-1" />
                    {transaction.timestamp}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{transaction.amount}</p>
                <p className="text-xs text-gray-300">
                  {transaction.from ? `From: ${transaction.from}` : 
                   transaction.to ? `To: ${transaction.to}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WalletContent;
