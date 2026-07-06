// StormRaven OS Mock Data Schemas

export interface ScanHost {
  ip: string;
  mac: string;
  vendor: string;
  hostname: string;
  status: 'online' | 'filtered' | 'unknown';
  latency: string;
  os: string;
}

export interface VaultEntry {
  id: string;
  timestamp: string;
  type: 'AUTH' | 'STRIKE' | 'LOCKDOWN' | 'BREACH' | 'SYSTEM';
  payload: string;
  hash: string;
  encrypted: boolean;
}

export interface SystemModule {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'idle' | 'scanning' | 'alert' | 'offline';
  port?: string;
  path?: string;
  uptime: string;
  load: number;
}

// ─── YMIR KERNEL DATA ───────────────────────────────────────────────────────

export interface KernelConfigEntry {
  option: string;
  value: string;
  mitigation: string;
}

export interface SysctlEntry {
  key: string;
  value: string;
  description: string;
  category: 'memory' | 'network' | 'execution';
}

export interface ArchPrinciple {
  id: string;
  tag: string;
  title: string;
  body: string[];
}

export interface NetworkCapability {
  name: string;
  config: string;
  description: string;
}

export const YMIR_VERSION = '6.6.21-ymir-hardened';
export const YMIR_BUILD_DATE = '2025-07-04T03:00:00Z';
export const YMIR_TARGET_ARCH = 'x86_64';
export const YMIR_COMPAT = 'Ubuntu 22.04 LTS / 24.04 LTS';

export const YMIR_ARCH_PRINCIPLES: ArchPrinciple[] = [
  {
    id: 'midgard',
    tag: 'A',
    title: 'Volatile RAM-Resident Root (Midgard Execution)',
    body: [
      'Natively builds and executes from an initramfs that mounts a tmpfs overlay.',
      'No write-backs to persistent disks are permitted unless explicitly authenticated via Luci hardware keys.',
      'The system runs entirely within volatile memory; once power is terminated, the entire user-space state is unrecoverable.',
      'Prevents cold-boot forensics and ensures complete operational isolation.',
    ],
  },
  {
    id: 'crypto',
    tag: 'B',
    title: 'Defense-in-Depth Cryptographic Pipeline',
    body: [
      'High-performance cipher suites (AES-NI, ChaCha20-Poly1305, SHA-512, dm-crypt) compiled directly into kernel core (=y) rather than modules (=m).',
      'Guarantees immediate availability at boot and prevents module hijacking.',
      'CPU-level hardware RNG (RDRAND/RDSEED) combined with software entropy harvesters feed the kernel entropy pool immediately on initialization.',
    ],
  },
  {
    id: 'zerotrust',
    tag: 'C',
    title: 'Zero-Trust Module Architecture',
    body: [
      'Unsigned module loading is prohibited (CONFIG_MODULE_SIG_FORCE=y).',
      'Kernel module loading can be disabled entirely after system boot via sysctl (kernel.modules_disabled=1).',
      'All loaded modules must carry a valid Ed25519 signature chain traceable to the Ymir forge key.',
    ],
  },
];

export const YMIR_KSPP_CONFIG: KernelConfigEntry[] = [
  { option: 'CONFIG_KASLR',                  value: 'y', mitigation: 'Randomizes kernel memory layout on boot to defeat ROP chains' },
  { option: 'CONFIG_STRICT_KERNEL_RWX',      value: 'y', mitigation: 'Enforces strict read/write/execute memory page permissions' },
  { option: 'CONFIG_STRICT_MODULE_RWX',      value: 'y', mitigation: 'Prevents data modification in module instruction spaces' },
  { option: 'CONFIG_PAGE_POISONING',         value: 'y', mitigation: 'Zeroes memory pages immediately upon deallocation' },
  { option: 'CONFIG_SLAB_FREELIST_RANDOM',   value: 'y', mitigation: 'Randomizes slab allocator to prevent heap layout prediction' },
  { option: 'CONFIG_SLAB_FREELIST_HARDENED', value: 'y', mitigation: 'Metadata validation checks to detect slab corruption' },
  { option: 'CONFIG_SECCOMP',                value: 'y', mitigation: 'Enables syscall restriction filter support' },
  { option: 'CONFIG_SECCOMP_FILTER',         value: 'y', mitigation: 'Restricts unprivileged system call executions' },
  { option: 'CONFIG_SECURITY_YAMA',          value: 'y', mitigation: 'Prevents unauthorized inter-process ptrace attachment' },
  { option: 'CONFIG_PANIC_ON_OOPS',          value: 'y', mitigation: 'Forces immediate kernel panic on error to block exploitation' },
  { option: 'CONFIG_MODULE_SIG_FORCE',       value: 'y', mitigation: 'Rejects any kernel module not bearing a valid signature' },
  { option: 'CONFIG_SHUFFLE_PAGE_ALLOCATOR', value: 'y', mitigation: 'Randomizes page allocation order to harden against probing' },
  { option: 'CONFIG_FORTIFY_SOURCE',         value: 'y', mitigation: 'Compile-time buffer overflow detection on string functions' },
  { option: 'CONFIG_WIREGUARD',              value: 'y', mitigation: 'In-kernel WireGuard VPN for maximum performance throughput' },
  { option: 'CONFIG_CRYPTO_AES_NI_INTEL',   value: 'y', mitigation: 'Hardware-accelerated AES via CPU AES-NI instruction set' },
  { option: 'CONFIG_CRYPTO_CHACHA20',        value: 'y', mitigation: 'ChaCha20-Poly1305 AEAD for mobile and low-power contexts' },
];

export const YMIR_SYSCTL: SysctlEntry[] = [
  { key: 'kernel.randomize_va_space',          value: '2',     category: 'memory',    description: 'Full ASLR — randomize stack, mmap, VDSO, and heap' },
  { key: 'kernel.yama.ptrace_scope',           value: '3',     category: 'execution', description: 'Disable ptrace entirely — no process can attach to another' },
  { key: 'kernel.mmap_min_addr',               value: '65536', category: 'memory',    description: 'Prevent null pointer dereference exploitation via low mmap' },
  { key: 'kernel.kptr_restrict',               value: '2',     category: 'memory',    description: 'Hide kernel pointer addresses from unprivileged users' },
  { key: 'kernel.dmesg_restrict',              value: '1',     category: 'execution', description: 'Restrict dmesg ring buffer access to root only' },
  { key: 'fs.protected_hardlinks',             value: '1',     category: 'execution', description: 'Prevent hardlink-based privilege escalation attacks' },
  { key: 'fs.protected_symlinks',              value: '1',     category: 'execution', description: 'Prevent symlink TOCTOU race condition attacks' },
  { key: 'net.ipv4.conf.all.rp_filter',        value: '1',     category: 'network',   description: 'Strict reverse path filtering to block IP spoofing' },
  { key: 'net.ipv4.conf.all.accept_redirects', value: '0',     category: 'network',   description: 'Reject ICMP redirect messages (MITM prevention)' },
  { key: 'net.ipv4.conf.all.send_redirects',   value: '0',     category: 'network',   description: 'Never send ICMP redirects from this host' },
  { key: 'net.ipv4.tcp_syncookies',            value: '1',     category: 'network',   description: 'SYN flood protection via cryptographic cookies' },
  { key: 'net.ipv4.tcp_timestamps',            value: '0',     category: 'network',   description: 'Disable TCP timestamps to prevent uptime fingerprinting' },
];

export const YMIR_NET_CAPABILITIES: NetworkCapability[] = [
  { name: 'In-Kernel WireGuard',        config: 'CONFIG_WIREGUARD=y',       description: 'VPN endpoints run in kernel space, bypassing user-space overhead for maximum throughput.' },
  { name: 'Netfilter State Tracking',   config: 'CONFIG_NF_CONNTRACK=y',    description: 'Full iptables/nftables stateful packet inspection for dynamic firewall synthesis (Gungnir).' },
  { name: 'TCP BBR Congestion Control', config: 'CONFIG_TCP_CONG_BBR=y',    description: 'BBR algorithm maximizes throughput over encrypted proxy tunnels by measuring bottleneck bandwidth.' },
  { name: 'nftables Framework',         config: 'CONFIG_NF_TABLES=y',       description: 'Next-generation packet filter replacing legacy iptables with atomic ruleset updates.' },
  { name: 'Hardware RNG Integration',   config: 'CONFIG_HW_RANDOM_INTEL=y', description: 'RDRAND/RDSEED CPU instructions seed the kernel entropy pool at boot for true randomness.' },
];

// ─── SCAN HOSTS ─────────────────────────────────────────────────────────────

export const SCAN_HOSTS: ScanHost[] = [
  { ip: '192.168.1.1',   mac: 'AA:BB:CC:11:22:33', vendor: 'ASUS',        hostname: 'gateway.local',     status: 'online',   latency: '1ms',  os: 'Embedded Linux' },
  { ip: '192.168.1.12',  mac: 'DE:AD:BE:EF:00:01', vendor: 'Apple',       hostname: 'macbook-pro.local', status: 'online',   latency: '3ms',  os: 'macOS 14.x' },
  { ip: '192.168.1.24',  mac: '00:11:22:33:44:55', vendor: 'Dell',        hostname: 'workstation-01',    status: 'online',   latency: '5ms',  os: 'Ubuntu 22.04' },
  { ip: '192.168.1.37',  mac: 'F4:AB:CD:88:77:66', vendor: 'Raspberry Pi',hostname: 'rpi-sensor-node',   status: 'online',   latency: '2ms',  os: 'Raspbian 11' },
  { ip: '192.168.1.55',  mac: '08:00:27:AB:CD:EF', vendor: 'VirtualBox',  hostname: 'vm-sandbox-02',     status: 'filtered', latency: '12ms', os: 'Unknown' },
  { ip: '192.168.1.88',  mac: 'B8:27:EB:12:34:56', vendor: 'Unknown',     hostname: '',                  status: 'unknown',  latency: '—',    os: 'Unknown' },
  { ip: '192.168.1.101', mac: '4C:ED:FB:CC:BA:98', vendor: 'Samsung',     hostname: 'galaxy-tab-s9',     status: 'online',   latency: '8ms',  os: 'Android 14' },
  { ip: '192.168.1.200', mac: 'A0:B1:C2:D3:E4:F5', vendor: 'Cisco',       hostname: 'sw-core-01',        status: 'online',   latency: '0ms',  os: 'IOS 15.7' },
];

export const VAULT_ENTRIES: VaultEntry[] = [
  { id: 'LKI-001', timestamp: '2025-07-04 03:12:44', type: 'BREACH',   payload: 'gAAAAABh7xQz...XmK9sL3vN8pQ=', hash: 'sha256:a3f9d1c2', encrypted: true  },
  { id: 'LKI-002', timestamp: '2025-07-04 02:55:18', type: 'AUTH',     payload: 'gAAAAABk2mRt...Pq7nX1eW4oY=', hash: 'sha256:b8e2f4a1', encrypted: true  },
  { id: 'LKI-003', timestamp: '2025-07-03 23:41:02', type: 'STRIKE',   payload: 'CMD: uname -a -> StormRaven/Linux x86_64', hash: 'sha256:c1d3e5f7', encrypted: false },
  { id: 'LKI-004', timestamp: '2025-07-03 21:08:57', type: 'SYSTEM',   payload: 'Sleipnir endpoint rotated via TOR exit node #44', hash: 'sha256:d9a2b4c6', encrypted: false },
  { id: 'LKI-005', timestamp: '2025-07-03 18:33:21', type: 'LOCKDOWN', payload: 'gAAAAABi9sLw...Zk5hM2vR6pJ=', hash: 'sha256:e7f1a3b5', encrypted: true  },
  { id: 'LKI-006', timestamp: '2025-07-03 15:17:09', type: 'AUTH',     payload: 'gAAAAABn4oNx...Yl8iK3cT9dQ=', hash: 'sha256:f2c4d6e8', encrypted: true  },
];

export const SYSTEM_MODULES: SystemModule[] = [
  { id: 'odin',        name: 'Odin',        role: 'Orchestrator',   description: 'SIEM event relay & external alert router',         status: 'active', port: 'Webhook',   uptime: '14d 22h', load: 12 },
  { id: 'leviathan',   name: 'Leviathan',   role: 'UI Controller',  description: 'Dashboard manager & API wrapper',                  status: 'active', port: '5005',      uptime: '14d 22h', load: 34 },
  { id: 'heimdall',    name: 'Heimdall',    role: 'Sanitizer',      description: 'Heuristic regex parsing of shell inputs',          status: 'active', port: 'Middleware', uptime: '14d 22h', load: 8  },
  { id: 'thor',        name: 'Thor',        role: 'Strike Agent',   description: 'Native command execution sub-shell',               status: 'idle',   path: '/bin/bash',  uptime: '14d 21h', load: 2  },
  { id: 'loki',        name: 'Loki',        role: 'Cryptography',   description: 'Shadow logging & AES-256 Fernet envelope manager', status: 'active', path: '/var/logs',  uptime: '14d 22h', load: 5  },
  { id: 'mjolnir',     name: 'Mjolnir',     role: 'Net Auditor',    description: 'High-speed active ARP host discoverer',            status: 'idle',   port: 'wlan0',      uptime: '14d 20h', load: 0  },
  { id: 'fenrir',      name: 'Fenrir',      role: 'TCP Mapper',     description: 'Connect-level stealth socket mapping',             status: 'idle',   port: 'Dynamic',    uptime: '14d 20h', load: 0  },
  { id: 'sleipnir',    name: 'Sleipnir',    role: 'Router',         description: 'VPN endpoint rotation & MAC shifting',             status: 'active', path: '/etc/wg',    uptime: '14d 22h', load: 18 },
  { id: 'demogorgon',  name: 'Demogorgon',  role: 'Containment',    description: 'Multi-threaded TCP tarpit honeypot trap',          status: 'active', port: '2222',       uptime: '14d 22h', load: 41 },
  { id: 'jormungandr', name: 'Jormungandr', role: 'Quarantine',     description: 'System isolation wrapper & OSINT collection',      status: 'idle',   port: 'iptables',   uptime: '14d 22h', load: 0  },
  { id: 'ginnungagap', name: 'Ginnungagap', role: 'Sentinel',       description: 'Background-resident integrity monitor',            status: 'active', port: 'systemd',    uptime: '14d 22h', load: 7  },
];

export const NEOFETCH_OUTPUT = `
+======================================+
|  STORMRAVEN OS  .  ITERATION III    |
+======================================+
  OS:       StormRaven/Linux x86_64
  Kernel:   6.6.21-ymir-hardened
  Shell:    /bin/bash 5.2.21
  CPU:      Intel Core i9-13900K (24c)
  RAM:      64 GiB DDR5-6000 ECC
  Disk:     2.0 TB NVMe (cryptsetup)
  Net:      wg0 (WireGuard) up 847MB dn 1.2GB
  Uptime:   14 days, 22 hours, 41 minutes
  Modules:  11/11 loaded (Yggdrasil v3.1)
  Security: KASLR + YAMA + SecComp ACTIVE
  Loki:     AES-256-Fernet SEALED
`;

export const HELP_OUTPUT = `
+==========================================+
|  STORMRAVEN TERMINAL -- COMMAND CATALOG  |
+==========================================+

  help              List terminal instruction metadata
  neofetch          Output system performance specifications
  scan              Execute Mjolnir subnet ARP scan
  fenrir <ip>       Run TCP interrogation on target address
  strike <cmd>      Simulate Thor shell command invocation
  vault             Decrypt and print Loki database entries
  lockdown          Engage absolute network isolation
  clear             Wipe console command history

  Type any command and press ENTER to execute.
`;
