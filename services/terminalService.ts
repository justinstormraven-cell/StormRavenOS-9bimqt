// Terminal Command Processing Service — Thor / Heimdall Layer

import {
  SCAN_HOSTS,
  VAULT_ENTRIES,
  NEOFETCH_OUTPUT,
  HELP_OUTPUT,
  ScanHost,
} from '../constants/mockData';

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'warning' | 'system' | 'scan';
  text: string;
  timestamp: string;
}

let lineCounter = 0;
const makeLine = (type: TerminalLine['type'], text: string): TerminalLine => ({
  id: `line-${++lineCounter}-${Date.now()}`,
  type,
  text,
  timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
});

export type CommandResult = {
  lines: TerminalLine[];
  lockdown?: boolean;
  scanHosts?: ScanHost[];
  streaming?: boolean;
};

export function processCommand(rawInput: string): CommandResult {
  const trimmed = rawInput.trim();
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
      return {
        lines: HELP_OUTPUT.split('\n').map(l => makeLine('output', l)),
      };

    case 'neofetch':
      return {
        lines: NEOFETCH_OUTPUT.split('\n').map(l => makeLine('system', l)),
      };

    case 'scan':
      return {
        lines: [
          makeLine('system', '[Mjolnir] Initiating ARP broadcast sweep on 192.168.1.0/24...'),
          makeLine('system', '[Mjolnir] Sending probe packets via wlan0...'),
        ],
        scanHosts: SCAN_HOSTS,
        streaming: true,
      };

    case 'fenrir': {
      const target = args[0];
      if (!target) {
        return {
          lines: [makeLine('error', '[Fenrir] Error: Target IP required. Usage: fenrir <ip>')],
        };
      }
      const isValidIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(target);
      if (!isValidIp) {
        return {
          lines: [makeLine('error', `[Fenrir] Error: Invalid IP format → "${target}"`)],
        };
      }
      return {
        lines: [
          makeLine('system', `[Fenrir] Initializing TCP interrogation on ${target}...`),
          makeLine('system', `[Fenrir] Deploying stealth connect-level socket probes...`),
          makeLine('scan',   `[Fenrir]  22/tcp   OPEN    SSH      OpenSSH 8.9`),
          makeLine('scan',   `[Fenrir]  80/tcp   OPEN    HTTP     nginx/1.24`),
          makeLine('scan',   `[Fenrir] 443/tcp   OPEN    HTTPS    TLSv1.3`),
          makeLine('scan',   `[Fenrir] 3306/tcp  CLOSED  MySQL`),
          makeLine('scan',   `[Fenrir] 8080/tcp  FILTERED —`),
          makeLine('success',`[Fenrir] Scan complete → 3 open, 1 closed, 1 filtered on ${target}`),
        ],
      };
    }

    case 'strike': {
      const command = args.join(' ');
      if (!command) {
        return {
          lines: [makeLine('error', '[Thor] Error: Command required. Usage: strike <command>')],
        };
      }
      const mockOutputs: Record<string, string[]> = {
        'uname -a':     ['StormRaven/Linux raven-node 6.6.21-ymir-hardened #1 SMP PREEMPT x86_64 GNU/Linux'],
        'whoami':       ['root'],
        'id':           ['uid=0(root) gid=0(root) groups=0(root)'],
        'uptime':       [' 22:41:03 up 14 days, 22:41,  1 user,  load average: 0.12, 0.08, 0.04'],
        'ls /':         ['bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  stormraven  sys  tmp  usr  var'],
        'ps aux':       ['PID  COMMAND', '  1  systemd', '  2  ginnungagap.service', '  3  odin.daemon', ' 44  leviathan.api', '102  loki.vault'],
        'ifconfig':     ['wg0: inet 10.0.0.2  netmask 255.0.0.0  WireGuard VPN\neth0: inet 192.168.1.24  netmask 255.255.255.0'],
      };
      const output = mockOutputs[command] || [`[Thor] Executed: ${command}`, `exit code: 0`];
      return {
        lines: [
          makeLine('system',  `[Thor] Invoking sub-shell: $ ${command}`),
          ...output.map(l => makeLine('output', l)),
          makeLine('success', `[Thor] Command completed successfully.`),
        ],
      };
    }

    case 'vault':
      return {
        lines: [
          makeLine('system',  '[Loki] Authenticating access to shadow vault...'),
          makeLine('system',  '[Loki] AES-256 Fernet key accepted. Decrypting entries...'),
          makeLine('output',  ''),
          makeLine('output',  '  ID       TIMESTAMP             TYPE      ENCRYPTED  HASH'),
          makeLine('output',  '  ──────── ─────────────────────  ──────── ─────────  ─────────────'),
          ...VAULT_ENTRIES.map(e =>
            makeLine(
              e.type === 'BREACH' ? 'error' : e.type === 'LOCKDOWN' ? 'warning' : 'scan',
              `  ${e.id.padEnd(8)} ${e.timestamp}  ${e.type.padEnd(8)} ${e.encrypted ? '🔐 YES' : '🔓 NO '}     ${e.hash}`
            )
          ),
          makeLine('output', ''),
          makeLine('output', `  ${VAULT_ENTRIES.length} entries retrieved. ${VAULT_ENTRIES.filter(e => e.encrypted).length} encrypted.`),
          makeLine('system', '[Loki] Vault access session closed.'),
        ],
      };

    case 'lockdown':
      return {
        lines: [
          makeLine('warning', '[Jörmungandr] ⚠  LOCKDOWN SEQUENCE INITIATED'),
          makeLine('warning', '[Jörmungandr] Flushing all iptables rules...'),
          makeLine('warning', '[Jörmungandr] Disabling all network interfaces...'),
          makeLine('warning', '[Sleipnir] Terminating WireGuard tunnel wg0...'),
          makeLine('warning', '[Odin] Broadcasting CRITICAL alert to all registered webhooks...'),
          makeLine('error',   '[SYSTEM] ████████████ NETWORK ISOLATED ████████████'),
          makeLine('error',   '[SYSTEM] All external connections terminated. System quarantined.'),
        ],
        lockdown: true,
      };

    case 'clear':
      return { lines: [] };

    case '':
      return { lines: [] };

    default:
      return {
        lines: [
          makeLine('error', `[Heimdall] Unknown command: "${cmd}". Type 'help' for available commands.`),
        ],
      };
  }
}

export function getBootSequence(): TerminalLine[] {
  const lines = [
    '╔══════════════════════════════════════════════════╗',
    '║   STORMRAVEN OS  ∴  ITERATION III               ║',
    '║   Yggdrasil Matrix v3.1 — Kernel 6.6.21-ymir   ║',
    '╚══════════════════════════════════════════════════╝',
    '',
    '  [Odin]        Orchestrator       ....  ONLINE',
    '  [Leviathan]   UI Controller      ....  ONLINE',
    '  [Heimdall]    Sanitizer          ....  ONLINE',
    '  [Thor]        Strike Agent       ....  STANDBY',
    '  [Loki]        Cryptography       ....  SEALED',
    '  [Mjolnir]     Net Auditor        ....  STANDBY',
    '  [Fenrir]      TCP Mapper         ....  STANDBY',
    '  [Sleipnir]    Router/VPN         ....  ONLINE',
    '  [Demogorgon]  Honeypot Trap      ....  ONLINE',
    '  [Jörmungandr] Quarantine         ....  STANDBY',
    '  [Ginnungagap] Sentinel           ....  ONLINE',
    '',
    '  11/11 modules loaded. System integrity: VERIFIED.',
    '  Type "help" to display available commands.',
    '',
  ];
  return lines.map((text, i) => ({
    id: `boot-${i}`,
    type: text.includes('ONLINE') ? 'success' : text.includes('STANDBY') || text.includes('SEALED') ? 'warning' : 'system',
    text,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
  }));
}
