
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Thermometer, Power, FileText, Bell } from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'overheat' | 'shutdown' | 'error' | 'info';
  deviceId: string;
  deviceType: 'gpu' | 'cpu';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

interface LogsAndErrorsProps {
  logs: LogEntry[];
  onExportLogs: () => void;
  onReportIssue: () => void;
}

const LogsAndErrors: React.FC<LogsAndErrorsProps> = ({ logs, onExportLogs, onReportIssue }) => {
  const [filter, setFilter] = useState<'all' | 'overheat' | 'shutdown' | 'error'>('all');

  // Function to render icon based on log type
  const renderIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'overheat':
        return <Thermometer className="w-4 h-4 text-red-400" />;
      case 'shutdown':
        return <Power className="w-4 h-4 text-orange-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  // Function to get severity color
  const getSeverityColor = (severity: LogEntry['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
    }
  };

  // Filter logs based on selected filter
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  return (
    <Card className="bg-black/30 border-0">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="text-xl font-medium text-white">Logs & Error Reports</h3>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" className="h-8" variant="outline" onClick={onExportLogs}>
              Export Logs
            </Button>
            <Button size="sm" className="h-8" onClick={onReportIssue}>
              Report Issue
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <Button 
            size="sm" 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            className="h-8"
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={filter === 'overheat' ? 'default' : 'outline'} 
            onClick={() => setFilter('overheat')}
            className="h-8"
          >
            Overheat
          </Button>
          <Button 
            size="sm" 
            variant={filter === 'shutdown' ? 'default' : 'outline'} 
            onClick={() => setFilter('shutdown')}
            className="h-8"
          >
            Shutdown
          </Button>
          <Button 
            size="sm" 
            variant={filter === 'error' ? 'default' : 'outline'} 
            onClick={() => setFilter('error')}
            className="h-8"
          >
            Errors
          </Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.id} className="bg-white/5 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-2">
                    {renderIcon(log.type)}
                    <span className="text-sm text-white">
                      {log.deviceType.toUpperCase()} #{log.deviceId.substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{log.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{log.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">
              No logs found for the selected filter
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LogsAndErrors;
