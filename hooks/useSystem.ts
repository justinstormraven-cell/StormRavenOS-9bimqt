import { useState, useEffect, useCallback } from 'react';
import { SystemModule, SYSTEM_MODULES } from '../constants/mockData';

export function useSystem() {
  const [modules, setModules] = useState<SystemModule[]>(SYSTEM_MODULES);
  const [systemLoad, setSystemLoad] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLockdown, setIsLockdown] = useState(false);
  const [uptime, setUptime] = useState('14d 22h 41m');
  const [threatLevel, setThreatLevel] = useState<'NOMINAL' | 'ELEVATED' | 'CRITICAL'>('NOMINAL');

  // Simulate minor fluctuations in module load
  useEffect(() => {
    const interval = setInterval(() => {
      setModules(prev => prev.map(mod => ({
        ...mod,
        load: mod.status === 'active'
          ? Math.max(1, Math.min(99, mod.load + (Math.random() * 6 - 3)))
          : mod.load,
      })));
      setSystemLoad(prev => Math.max(5, Math.min(95, prev + (Math.random() * 8 - 4))));
    }, 3000);
    // Initialize system load
    const activeLoad = SYSTEM_MODULES.filter(m => m.status === 'active').reduce((a, m) => a + m.load, 0);
    setSystemLoad(Math.min(95, activeLoad / SYSTEM_MODULES.length));
    return () => clearInterval(interval);
  }, []);

  const engageLockdown = useCallback(() => {
    setIsLockdown(true);
    setThreatLevel('CRITICAL');
    setModules(prev => prev.map(m => ({ ...m, status: m.id === 'jormungandr' ? 'active' : 'alert' as SystemModule['status'] })));
    setAlerts(prev => ['[CRITICAL] Lockdown engaged — network isolated', ...prev]);
  }, []);

  const liftLockdown = useCallback(() => {
    setIsLockdown(false);
    setThreatLevel('NOMINAL');
    setModules(SYSTEM_MODULES);
    setAlerts(prev => ['[INFO] Lockdown lifted — network restored', ...prev]);
  }, []);

  const activeCount = modules.filter(m => m.status === 'active').length;
  const alertCount = modules.filter(m => m.status === 'alert').length;

  return {
    modules,
    systemLoad,
    alerts,
    isLockdown,
    threatLevel,
    uptime,
    activeCount,
    alertCount,
    engageLockdown,
    liftLockdown,
  };
}
