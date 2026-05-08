
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Song } from '../../../../data/musicData';
import { GPU, CpuGroup, SystemLog } from '../types/dashboard';

export function useAdminDashboardData() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Mining system state
  const [balancedMode, setBalancedMode] = useState<boolean>(true);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [powerUsage, setPowerUsage] = useState<number>(142.37);
  const [systemHealth, setSystemHealth] = useState<'optimal' | 'degraded' | 'failure'>('optimal');
  const [liveHashrate, setLiveHashrate] = useState<number>(245);

  // GPU data - Expanded to 24 GPUs
  const [gpus, setGpus] = useState<GPU[]>([
    // Group 1
    { 
      id: '1a2b3c4d5e6f7g8h', 
      slot: 1, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 82, 
      temperature: 72, 
      hashrate: 14.2, 
      uptime: '12h 37m', 
      lastBoot: '2025-04-22 08:14', 
      highPerformanceMode: true
    },
    { 
      id: '2a3b4c5d6e7f8g9h', 
      slot: 2, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 78, 
      temperature: 68, 
      hashrate: 13.9, 
      uptime: '12h 37m', 
      lastBoot: '2025-04-22 08:14', 
      highPerformanceMode: true
    },
    { 
      id: '3a4b5c6d7e8f9g0h', 
      slot: 3, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 85, 
      temperature: 75, 
      hashrate: 12.1, 
      uptime: '12h 37m', 
      lastBoot: '2025-04-22 08:14', 
      highPerformanceMode: false
    },
    { 
      id: '4a5b6c7d8e9f0g1h', 
      slot: 4, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 76, 
      temperature: 70, 
      hashrate: 11.8, 
      uptime: '12h 37m', 
      lastBoot: '2025-04-22 08:14', 
      highPerformanceMode: false
    },
    { 
      id: '5a6b7c8d9e0f1g2h', 
      slot: 5, 
      model: 'RTX 5090', 
      status: 'error', 
      load: 94, 
      temperature: 84, 
      hashrate: 8.3, 
      uptime: '2h 15m', 
      lastBoot: '2025-04-22 18:36', 
      highPerformanceMode: true
    },
    { 
      id: '6a7b8c9d0e1f2g3h', 
      slot: 6, 
      model: 'RTX 4090', 
      status: 'offline', 
      load: 0, 
      temperature: 35, 
      hashrate: 0, 
      uptime: '0h 0m', 
      lastBoot: '2025-04-21 14:22', 
      highPerformanceMode: false
    },
    // Group 2
    { 
      id: '7a8b9c0d1e2f3g4h', 
      slot: 7, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 88, 
      temperature: 74, 
      hashrate: 14.5, 
      uptime: '13h 02m', 
      lastBoot: '2025-04-22 07:59', 
      highPerformanceMode: true
    },
    { 
      id: '8a9b0c1d2e3f4g5h', 
      slot: 8, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 81, 
      temperature: 69, 
      hashrate: 14.1, 
      uptime: '13h 02m', 
      lastBoot: '2025-04-22 07:59', 
      highPerformanceMode: true
    },
    { 
      id: '9a0b1c2d3e4f5g6h', 
      slot: 9, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 86, 
      temperature: 76, 
      hashrate: 12.3, 
      uptime: '13h 02m', 
      lastBoot: '2025-04-22 07:59', 
      highPerformanceMode: false
    },
    { 
      id: '0a1b2c3d4e5f6g7h', 
      slot: 10, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 77, 
      temperature: 71, 
      hashrate: 11.9, 
      uptime: '13h 02m', 
      lastBoot: '2025-04-22 07:59', 
      highPerformanceMode: false
    },
    { 
      id: '1b2c3d4e5f6g7h8a', 
      slot: 11, 
      model: 'RTX 5090', 
      status: 'error', 
      load: 95, 
      temperature: 85, 
      hashrate: 8.5, 
      uptime: '2h 30m', 
      lastBoot: '2025-04-22 18:15', 
      highPerformanceMode: true
    },
    { 
      id: '2b3c4d5e6f7g8h9a', 
      slot: 12, 
      model: 'RTX 4090', 
      status: 'offline', 
      load: 0, 
      temperature: 36, 
      hashrate: 0, 
      uptime: '0h 0m', 
      lastBoot: '2025-04-21 14:37', 
      highPerformanceMode: false
    },
    // Group 3
    { 
      id: '3b4c5d6e7f8g9h0a', 
      slot: 13, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 83, 
      temperature: 73, 
      hashrate: 14.3, 
      uptime: '12h 45m', 
      lastBoot: '2025-04-22 08:06', 
      highPerformanceMode: true
    },
    { 
      id: '4b5c6d7e8f9g0h1a', 
      slot: 14, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 79, 
      temperature: 67, 
      hashrate: 14.0, 
      uptime: '12h 45m', 
      lastBoot: '2025-04-22 08:06', 
      highPerformanceMode: true
    },
    { 
      id: '5b6c7d8e9f0g1h2a', 
      slot: 15, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 87, 
      temperature: 77, 
      hashrate: 12.5, 
      uptime: '12h 45m', 
      lastBoot: '2025-04-22 08:06', 
      highPerformanceMode: false
    },
    { 
      id: '6b7c8d9e0f1g2h3a', 
      slot: 16, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 75, 
      temperature: 69, 
      hashrate: 11.7, 
      uptime: '12h 45m', 
      lastBoot: '2025-04-22 08:06', 
      highPerformanceMode: false
    },
    { 
      id: '7b8c9d0e1f2g3h4a', 
      slot: 17, 
      model: 'RTX 5090', 
      status: 'error', 
      load: 93, 
      temperature: 83, 
      hashrate: 8.2, 
      uptime: '2h 22m', 
      lastBoot: '2025-04-22 18:29', 
      highPerformanceMode: true
    },
    { 
      id: '8b9c0d1e2f3g4h5a', 
      slot: 18, 
      model: 'RTX 4090', 
      status: 'offline', 
      load: 0, 
      temperature: 34, 
      hashrate: 0, 
      uptime: '0h 0m', 
      lastBoot: '2025-04-21 14:14', 
      highPerformanceMode: false
    },
    // Group 4
    { 
      id: '9b0c1d2e3f4g5h6a', 
      slot: 19, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 80, 
      temperature: 70, 
      hashrate: 14.1, 
      uptime: '12h 52m', 
      lastBoot: '2025-04-22 07:53', 
      highPerformanceMode: true
    },
    { 
      id: '0c1d2e3f4g5h6a7b', 
      slot: 20, 
      model: 'RTX 5090', 
      status: 'online', 
      load: 77, 
      temperature: 66, 
      hashrate: 13.8, 
      uptime: '12h 52m', 
      lastBoot: '2025-04-22 07:53', 
      highPerformanceMode: true
    },
    { 
      id: '1c2d3e4f5g6h7a8b', 
      slot: 21, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 84, 
      temperature: 74, 
      hashrate: 12.0, 
      uptime: '12h 52m', 
      lastBoot: '2025-04-22 07:53', 
      highPerformanceMode: false
    },
    { 
      id: '2c3d4e5f6g7h8a9b', 
      slot: 22, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 74, 
      temperature: 68, 
      hashrate: 11.6, 
      uptime: '12h 52m', 
      lastBoot: '2025-04-22 07:53', 
      highPerformanceMode: false
    },
    { 
      id: '3c4d5e6f7g8h9a0b', 
      slot: 23, 
      model: 'RTX 5090', 
      status: 'error', 
      load: 92, 
      temperature: 82, 
      hashrate: 8.1, 
      uptime: '2h 09m', 
      lastBoot: '2025-04-22 18:42', 
      highPerformanceMode: true
    },
    { 
      id: '24a2b3c4d5e6f7g8h', 
      slot: 24, 
      model: 'RTX 4090', 
      status: 'online', 
      load: 79, 
      temperature: 71, 
      hashrate: 11.8, 
      uptime: '12h 37m', 
      lastBoot: '2025-04-22 08:14', 
      highPerformanceMode: false
    }
  ]);
  
  // GPU stats summary
  const gpuStats = {
    rtx5090: { total: 12, online: 11 },
    rtx4090: { total: 12, online: 11 },
  };

  // CPU data
  const [cpuGroups, setCpuGroups] = useState<CpuGroup[]>([
    {
      id: 'cpu-group-1',
      name: 'US-East Cluster',
      totalNodes: 320,
      activeNodes: 298,
      avgLoad: 72,
      avgHashrate: 3.2,
      lastSync: '2min ago',
      isEnabled: true,
      thermalProtection: true
    },
    {
      id: 'cpu-group-2',
      name: 'US-West Cluster',
      totalNodes: 285,
      activeNodes: 267,
      avgLoad: 68,
      avgHashrate: 2.9,
      lastSync: '3min ago',
      isEnabled: true,
      thermalProtection: true
    },
    {
      id: 'cpu-group-3',
      name: 'EU-West Cluster',
      totalNodes: 210,
      activeNodes: 195,
      avgLoad: 84,
      avgHashrate: 3.6,
      lastSync: '6min ago',
      isEnabled: true,
      thermalProtection: true
    },
    {
      id: 'cpu-group-4',
      name: 'Asia-Pacific Cluster',
      totalNodes: 150,
      activeNodes: 132,
      avgLoad: 62,
      avgHashrate: 2.7,
      lastSync: '12min ago',
      isEnabled: true,
      thermalProtection: false
    }
  ]);
  
  // CPU stats summary
  const cpuStats = {
    total: 965,
    active: 892
  };
  
  // Top performing CPU groups
  const topPerformingGroups = ['cpu-group-3', 'cpu-group-1', 'cpu-group-2', 'cpu-group-4', 'cpu-group-5'];
  
  // System logs
  const [logs, setLogs] = useState<SystemLog[]>([
    {
      id: 'log-1',
      type: 'overheat',
      deviceId: '5a6b7c8d9e0f1g2h',
      deviceType: 'gpu',
      message: 'GPU temperature exceeded critical threshold (84°C)',
      timestamp: '2025-04-22 19:17:32',
      severity: 'high'
    },
    {
      id: 'log-2',
      type: 'shutdown',
      deviceId: '6a7b8c9d0e1f2g3h',
      deviceType: 'gpu',
      message: 'Unexpected shutdown during mining operation',
      timestamp: '2025-04-22 14:23:08',
      severity: 'medium'
    },
    {
      id: 'log-3',
      type: 'error',
      deviceId: 'cpu-group-3',
      deviceType: 'cpu',
      message: '15 nodes disconnected due to network latency issues',
      timestamp: '2025-04-22 16:42:19',
      severity: 'medium'
    },
    {
      id: 'log-4',
      type: 'info',
      deviceId: 'system',
      deviceType: 'cpu',
      message: 'Auto-throttling applied to US-East cluster due to high temperature',
      timestamp: '2025-04-22 18:03:54',
      severity: 'low'
    },
    {
      id: 'log-5',
      type: 'overheat',
      deviceId: '2a3b4c5d6e7f8g9h',
      deviceType: 'gpu',
      message: 'Temperature threshold warning (68°C)',
      timestamp: '2025-04-22 19:05:21',
      severity: 'low'
    }
  ]);

  // Fetch songs from Supabase
  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      
      const { data: songsData, error } = await (supabase as any)
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format the songs to match the Song interface
      const formattedSongs: Song[] = (songsData ?? []).map((song: any) => ({
        id: song.id,
        title: song.title || 'Untitled',
        artist: song.artist || 'Unknown Artist',
        album: song.category || 'Single',
        duration: formatDuration(song.duration || 180),
        coverArt: formatImageUrl(song.thumbnail_path),
        audioSrc: song.file_path || '',
        playCount: song.play_count || Math.floor(Math.random() * 1000) + 50,
        likesCount: Math.floor(Math.random() * 200) + 10,
        genre: song.genre || null
      }));
      
      setSongs(formattedSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format duration seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format image URLs
  const formatImageUrl = (path: string | null): string => {
    if (!path) return 'https://images.unsplash.com/photo-1577985051167-0d49eec21977?w=500';
    
    if (path.startsWith('http')) return path;
    if (path.startsWith('/lovable-uploads')) return path;
    
    return `https://iextgszxpxeurbpncapv.supabase.co/storage/v1/object/public/songs/${path}`;
  };

  return {
    songs,
    loading,
    setSongs,
    gpus,
    setGpus,
    gpuStats,
    cpuGroups,
    setCpuGroups,
    cpuStats,
    topPerformingGroups,
    logs,
    setLogs,
    balancedMode,
    setBalancedMode,
    emergencyMode,
    setEmergencyMode,
    powerUsage,
    setPowerUsage,
    systemHealth,
    setSystemHealth,
    liveHashrate,
    setLiveHashrate
  };
}
