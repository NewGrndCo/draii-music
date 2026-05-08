
import React from 'react';
import { Card } from '@/components/ui/card';

const ContractsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Active Contracts</h3>
        <div className="space-y-3">
          {[
            { name: 'Arik Divine', tier: 'Tier 2', royalty: '70%', wallet: '0x3a...4f9e' },
            { name: 'Yardie', tier: 'Tier 3', royalty: '80%', wallet: '0x7d...2c1b' },
            { name: 'Danjha', tier: 'Tier 1', royalty: '60%', wallet: '0x9b...6a3d' }
          ].map((contract, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium text-white">{contract.name}</h4>
                <p className="text-sm text-gray-300">{contract.tier} • {contract.royalty}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{contract.wallet}</p>
                <p className="text-xs text-green-400">Active</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Royalty Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 p-4 rounded-lg text-center">
            <p className="text-gray-300 text-sm">Tier 1</p>
            <p className="text-2xl font-bold text-white">60%</p>
            <p className="text-xs text-gray-400">Base level</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg text-center">
            <p className="text-gray-300 text-sm">Tier 2</p>
            <p className="text-2xl font-bold text-white">70%</p>
            <p className="text-xs text-gray-400">Intermediate</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg text-center">
            <p className="text-gray-300 text-sm">Tier 3</p>
            <p className="text-2xl font-bold text-white">80%</p>
            <p className="text-xs text-gray-400">Premium</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContractsContent;
