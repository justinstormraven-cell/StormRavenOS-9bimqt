import { useState, useCallback, useRef } from 'react';
import { TerminalLine, processCommand, getBootSequence, CommandResult } from '../services/terminalService';
import { ScanHost, SCAN_HOSTS } from '../constants/mockData';

export interface TerminalState {
  lines: TerminalLine[];
  input: string;
  isProcessing: boolean;
  isLockdown: boolean;
  isScanStreaming: boolean;
  historyIndex: number;
  commandHistory: string[];
}

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(getBootSequence());
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLockdown, setIsLockdown] = useState(false);
  const [isScanStreaming, setIsScanStreaming] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const processingRef = useRef(false);

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines(prev => [...prev, ...newLines]);
  }, []);

  const streamScanHosts = useCallback((hosts: ScanHost[]) => {
    setIsScanStreaming(true);
    hosts.forEach((host, i) => {
      setTimeout(() => {
        const statusIcon = host.status === 'online' ? '●' : host.status === 'filtered' ? '◐' : '○';
        const colorTag = host.status === 'online' ? 'success' : host.status === 'filtered' ? 'warning' : 'output';
        setLines(prev => [...prev, {
          id: `scan-host-${i}-${Date.now()}`,
          type: colorTag as TerminalLine['type'],
          text: `  ${statusIcon} ${host.ip.padEnd(15)} ${host.mac}  ${host.vendor.padEnd(14)} ${host.hostname || '(unknown)'}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        }]);
        if (i === hosts.length - 1) {
          setTimeout(() => {
            setLines(prev => [...prev, {
              id: `scan-done-${Date.now()}`,
              type: 'success',
              text: `[Mjolnir] Scan complete → ${hosts.filter(h => h.status === 'online').length} hosts online, ${hosts.filter(h => h.status === 'filtered').length} filtered.`,
              timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            }]);
            setIsScanStreaming(false);
            processingRef.current = false;
            setIsProcessing(false);
          }, 400);
        }
      }, i * 220 + 800);
    });
  }, []);

  const executeCommand = useCallback((cmd: string) => {
    if (processingRef.current || isLockdown) return;
    const trimmed = cmd.trim();

    // Add input line
    setLines(prev => [...prev, {
      id: `input-${Date.now()}`,
      type: 'input',
      text: `root@stormraven:~# ${trimmed}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    }]);

    if (trimmed) {
      setCommandHistory(prev => [trimmed, ...prev.slice(0, 49)]);
      setHistoryIndex(-1);
    }

    if (trimmed === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setInput('');

    setTimeout(() => {
      const result: CommandResult = processCommand(trimmed);

      if (result.lockdown) {
        setIsLockdown(true);
      }

      if (result.scanHosts) {
        addLines(result.lines);
        streamScanHosts(result.scanHosts);
      } else {
        addLines(result.lines);
        processingRef.current = false;
        setIsProcessing(false);
      }
    }, 120);
  }, [isLockdown, addLines, streamScanHosts]);

  const resetLockdown = useCallback(() => {
    setIsLockdown(false);
    setLines(prev => [...prev, {
      id: `unlock-${Date.now()}`,
      type: 'success',
      text: '[Jörmungandr] Lockdown lifted. Network interfaces restored.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    }]);
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    setHistoryIndex(prev => {
      const newIndex = direction === 'up'
        ? Math.min(prev + 1, commandHistory.length - 1)
        : Math.max(prev - 1, -1);
      setInput(newIndex >= 0 ? commandHistory[newIndex] : '');
      return newIndex;
    });
  }, [commandHistory]);

  return {
    lines,
    input,
    setInput,
    isProcessing,
    isLockdown,
    isScanStreaming,
    executeCommand,
    resetLockdown,
    navigateHistory,
  };
}
