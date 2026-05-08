
import { useState } from 'react';
import { SystemLog } from '../types/dashboard';
import { toast } from 'sonner';

export function useLogState() {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const handleExportLogs = () => {
    toast.success('Exporting logs...');
    setTimeout(() => {
      toast.success('Logs exported successfully');
    }, 1500);
  };

  const handleReportIssue = () => {
    toast.success('Sending report to support team...');
    setTimeout(() => {
      toast.success('Report sent to support team');
    }, 1500);
  };

  return {
    logs,
    handleExportLogs,
    handleReportIssue
  };
}
