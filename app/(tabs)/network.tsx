// Powered by OnSpace.AI — StormRaven Network Scanner
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { GlowText } from '../../components/ui/GlowText';
import { SCAN_HOSTS, ScanHost } from '../../constants/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'ip' | 'vendor' | 'status' | 'latency';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: ScanHost['status']): string {
  if (status === 'online')   return Colors.statusOnline;
  if (status === 'filtered') return Colors.statusWarning;
  return Colors.textMuted;
}

function statusIcon(status: ScanHost['status']): string {
  if (status === 'online')   return '●';
  if (status === 'filtered') return '◐';
  return '○';
}

function latencyMs(lat: string): number {
  if (lat === '—') return 9999;
  return parseInt(lat.replace('ms', ''), 10) || 0;
}

function sortHosts(hosts: ScanHost[], key: SortKey): ScanHost[] {
  return [...hosts].sort((a, b) => {
    if (key === 'ip') {
      const pa = a.ip.split('.').map(Number);
      const pb = b.ip.split('.').map(Number);
      for (let i = 0; i < 4; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
      return 0;
    }
    if (key === 'vendor') return a.vendor.localeCompare(b.vendor);
    if (key === 'status') {
      const ord: Record<string, number> = { online: 0, filtered: 1, unknown: 2 };
      return (ord[a.status] ?? 2) - (ord[b.status] ?? 2);
    }
    if (key === 'latency') return latencyMs(a.latency) - latencyMs(b.latency);
    return 0;
  });
}

// ─── Host Row ──────────────────────────────────────────────────────────────────

const HostRow = React.memo(function HostRow({
  host,
  index,
  expanded,
  onPress,
}: {
  host: ScanHost;
  index: number;
  expanded: boolean;
  onPress: () => void;
}) {
  const sColor = statusColor(host.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.hostRow,
        index % 2 === 1 && styles.hostRowAlt,
        expanded && styles.hostRowExpanded,
        pressed && { opacity: 0.85 },
      ]}
    >
      {/* Status indicator */}
      <View style={styles.hostStatusCol}>
        <GlowText color={sColor} size={10} style={styles.statusIconText}>{statusIcon(host.status)}</GlowText>
      </View>

      {/* IP */}
      <View style={styles.hostIpCol}>
        <GlowText color={Colors.textCyan} size={Typography.sizes.xs} weight="600" style={styles.hostIp} numberOfLines={1}>
          {host.ip}
        </GlowText>
        {expanded && (
          <GlowText color={Colors.textMuted} size={8} numberOfLines={1}>{host.mac}</GlowText>
        )}
      </View>

      {/* Vendor */}
      <View style={styles.hostVendorCol}>
        <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} numberOfLines={1}>{host.vendor}</GlowText>
        {expanded && (
          <GlowText color={Colors.textMuted} size={8} numberOfLines={1}>{host.os}</GlowText>
        )}
      </View>

      {/* Latency */}
      <View style={styles.hostLatCol}>
        <GlowText
          color={latencyMs(host.latency) > 10 ? Colors.statusWarning : latencyMs(host.latency) === 9999 ? Colors.textMuted : Colors.statusOnline}
          size={Typography.sizes.xs}
          weight="600"
        >
          {host.latency}
        </GlowText>
      </View>

      {/* Expand chevron */}
      <MaterialIcons
        name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
        size={14}
        color={Colors.textMuted}
      />

      {/* Expanded detail */}
      {expanded && (
        <View style={styles.hostDetail}>
          <View style={styles.hostDetailGrid}>
            {[
              { label: 'HOSTNAME', value: host.hostname || '(unknown)' },
              { label: 'MAC',      value: host.mac },
              { label: 'OS',       value: host.os },
              { label: 'STATUS',   value: host.status.toUpperCase() },
            ].map(item => (
              <View key={item.label} style={styles.hostDetailItem}>
                <GlowText color={Colors.textMuted} size={8} weight="600" style={styles.hostDetailLabel}>{item.label}</GlowText>
                <GlowText color={Colors.textPrimary} size={9} weight="500" numberOfLines={1}>{item.value}</GlowText>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
});

// ─── Scan Button ──────────────────────────────────────────────────────────────

const ScanButton = React.memo(function ScanButton({
  scanning,
  onPress,
}: {
  scanning: boolean;
  onPress: () => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.linear })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
    }
  }, [scanning]);

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Pressable
      onPress={onPress}
      disabled={scanning}
      style={({ pressed }) => [styles.scanBtn, pressed && { opacity: 0.85 }]}
    >
      <Animated.View style={[styles.scanBtnInner, { transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={{ transform: [{ rotate: scanning ? rotation : '0deg' }] }}>
          {scanning
            ? <ActivityIndicator size="small" color={Colors.cyan} />
            : <MaterialIcons name="radar" size={22} color={Colors.cyan} />
          }
        </Animated.View>
        <GlowText color={scanning ? Colors.cyanDim : Colors.cyan} size={Typography.sizes.xs} weight="700" style={styles.scanBtnLabel}>
          {scanning ? 'SCANNING...' : 'MJOLNIR SCAN'}
        </GlowText>
      </Animated.View>
    </Pressable>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NetworkScreen() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [subnet, setSubnet] = useState('192.168.1.0/24');
  const [discoveredHosts, setDiscoveredHosts] = useState<ScanHost[]>([]);
  const [streamIndex, setStreamIndex] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('ip');
  const [expandedIp, setExpandedIp] = useState<string | null>(null);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const streamTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sortedHosts = sortHosts(discoveredHosts, sortKey);

  const online  = discoveredHosts.filter(h => h.status === 'online').length;
  const filtered = discoveredHosts.filter(h => h.status === 'filtered').length;
  const unknown = discoveredHosts.filter(h => h.status === 'unknown').length;

  const runScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    setScanned(false);
    setDiscoveredHosts([]);
    setStreamIndex(0);
    setExpandedIp(null);
    setScanLog([]);
    streamTimeouts.current.forEach(clearTimeout);
    streamTimeouts.current = [];

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setScanLog([
      `[Mjolnir] ARP broadcast initiated on subnet ${subnet}`,
      `[Mjolnir] Interface: wlan0  Protocol: ARP`,
      `[Mjolnir] Scan started at ${ts}`,
    ]);

    SCAN_HOSTS.forEach((host, i) => {
      const delay = 600 + i * 320 + Math.random() * 180;
      const to = setTimeout(() => {
        setDiscoveredHosts(prev => [...prev, host]);
        setStreamIndex(i + 1);
        setScanLog(prev => [
          ...prev,
          `  ${statusIcon(host.status)} ${host.ip.padEnd(15)} → ${host.vendor} ${host.status === 'online' ? `(${host.latency})` : `[${host.status}]`}`,
        ]);
        if (i === SCAN_HOSTS.length - 1) {
          const to2 = setTimeout(() => {
            setScanLog(prev => [
              ...prev,
              '',
              `[Mjolnir] Scan complete. ${SCAN_HOSTS.filter(h => h.status === 'online').length} hosts online.`,
            ]);
            setScanning(false);
            setScanned(true);
          }, 400);
          streamTimeouts.current.push(to2);
        }
      }, delay);
      streamTimeouts.current.push(to);
    });
  }, [scanning, subnet]);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'ip',      label: 'IP' },
    { key: 'status',  label: 'STATUS' },
    { key: 'vendor',  label: 'VENDOR' },
    { key: 'latency', label: 'LATENCY' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <GlowText color={Colors.cyan} size={Typography.sizes.lg} weight="700" style={styles.title}>
            MJOLNIR
          </GlowText>
          <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} style={styles.subtitle}>
            Network Auditor — ARP Host Discovery
          </GlowText>
        </View>
        {scanned && (
          <View style={styles.headerBadge}>
            <GlowText color={Colors.statusOnline} size={9} weight="700">{`${online} ONLINE`}</GlowText>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Subnet input */}
        <View style={styles.subnetRow}>
          <View style={styles.subnetInputWrap}>
            <MaterialIcons name="lan" size={14} color={Colors.textMuted} style={styles.subnetIcon} />
            <TextInput
              style={styles.subnetInput}
              value={subnet}
              onChangeText={setSubnet}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={Colors.textMuted}
              selectionColor={Colors.cyan}
              editable={!scanning}
            />
          </View>
          <ScanButton scanning={scanning} onPress={runScan} />
        </View>

        {/* Stats strip */}
        {(scanned || scanning) && (
          <View style={styles.statsStrip}>
            <View style={styles.statChip}>
              <GlowText color={Colors.textMuted} size={8} weight="600">ONLINE</GlowText>
              <GlowText color={Colors.statusOnline} size={Typography.sizes.sm} weight="700">{online}</GlowText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <GlowText color={Colors.textMuted} size={8} weight="600">FILTERED</GlowText>
              <GlowText color={Colors.statusWarning} size={Typography.sizes.sm} weight="700">{filtered}</GlowText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <GlowText color={Colors.textMuted} size={8} weight="600">UNKNOWN</GlowText>
              <GlowText color={Colors.textMuted} size={Typography.sizes.sm} weight="700">{unknown}</GlowText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <GlowText color={Colors.textMuted} size={8} weight="600">TOTAL</GlowText>
              <GlowText color={Colors.textCyan} size={Typography.sizes.sm} weight="700">{discoveredHosts.length}</GlowText>
            </View>
          </View>
        )}

        {/* Scan Log (streaming) */}
        {scanLog.length > 0 && (
          <View style={styles.logPanel}>
            <View style={styles.logHeader}>
              <View style={[styles.logDot, { backgroundColor: scanning ? Colors.cyan : Colors.statusOnline }]} />
              <GlowText color={Colors.textMuted} size={Typography.sizes.xs} weight="600" style={styles.logTitle}>
                {scanning ? 'SCAN IN PROGRESS' : 'SCAN LOG'}
              </GlowText>
              {scanning && <ActivityIndicator size="small" color={Colors.cyan} style={styles.logSpinner} />}
            </View>
            {scanLog.map((line, i) => (
              <GlowText
                key={i}
                color={
                  line.startsWith('[Mjolnir]') ? Colors.textCyan :
                  line.includes('●') ? Colors.statusOnline :
                  line.includes('◐') ? Colors.statusWarning :
                  Colors.textMuted
                }
                size={9}
                style={styles.logLine}
              >
                {line}
              </GlowText>
            ))}
          </View>
        )}

        {/* Host Table */}
        {discoveredHosts.length > 0 && (
          <View style={styles.tableWrap}>
            {/* Table Header + Sort */}
            <View style={styles.tableHeader}>
              <GlowText color={Colors.textMuted} size={8} weight="600" style={styles.tableTitleLabel}>
                ARP HOST TABLE
              </GlowText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
                {SORT_OPTIONS.map(opt => (
                  <Pressable
                    key={opt.key}
                    style={[styles.sortChip, sortKey === opt.key && styles.sortChipActive]}
                    onPress={() => setSortKey(opt.key)}
                  >
                    <GlowText
                      color={sortKey === opt.key ? Colors.matteBlack : Colors.textMuted}
                      size={8}
                      weight="600"
                    >
                      {opt.label}
                    </GlowText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Column Labels */}
            <View style={styles.colLabels}>
              <View style={styles.hostStatusCol}>
                <GlowText color={Colors.textMuted} size={8} weight="600">ST</GlowText>
              </View>
              <View style={styles.hostIpCol}>
                <GlowText color={Colors.textMuted} size={8} weight="600">IP ADDRESS</GlowText>
              </View>
              <View style={styles.hostVendorCol}>
                <GlowText color={Colors.textMuted} size={8} weight="600">VENDOR / OS</GlowText>
              </View>
              <View style={styles.hostLatCol}>
                <GlowText color={Colors.textMuted} size={8} weight="600">LAT</GlowText>
              </View>
              <View style={{ width: 14 }} />
            </View>

            {/* Rows */}
            {sortedHosts.map((host, idx) => (
              <HostRow
                key={host.ip}
                host={host}
                index={idx}
                expanded={expandedIp === host.ip}
                onPress={() => setExpandedIp(expandedIp === host.ip ? null : host.ip)}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!scanned && !scanning && (
          <View style={styles.emptyState}>
            <MaterialIcons name="radar" size={52} color={Colors.textMuted} />
            <GlowText color={Colors.textSecondary} size={Typography.sizes.sm} weight="600" style={styles.emptyTitle}>
              MJOLNIR READY
            </GlowText>
            <GlowText color={Colors.textMuted} size={Typography.sizes.xs} style={styles.emptyHint}>
              Configure subnet and press MJOLNIR SCAN to begin ARP host discovery.
            </GlowText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.obsidian,
  },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { letterSpacing: 4 },
  subtitle: { letterSpacing: 0.5, marginTop: 2 },
  headerBadge: {
    backgroundColor: Colors.statusOnline + '20',
    borderWidth: 1,
    borderColor: Colors.statusOnline + '55',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },

  subnetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  subnetInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 46,
    gap: Spacing.sm,
  },
  subnetIcon: {},
  subnetInput: {
    flex: 1,
    fontFamily: Typography.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.textCyan,
    includeFontPadding: false,
    paddingVertical: 0,
  },

  scanBtn: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cyan + '66',
    backgroundColor: Colors.cyanGlow,
    overflow: 'hidden',
  },
  scanBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    height: 46,
  },
  scanBtnLabel: { letterSpacing: 1 },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  statChip: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },

  logPanel: {
    backgroundColor: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.cyanDim + '44',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logDot: { width: 6, height: 6, borderRadius: 3 },
  logTitle: { flex: 1, letterSpacing: 1.5 },
  logSpinner: { marginLeft: Spacing.xs },
  logLine: { lineHeight: 15, letterSpacing: 0.2 },

  tableWrap: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.charcoal,
    gap: Spacing.sm,
  },
  tableTitleLabel: { letterSpacing: 1.5 },
  sortRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  sortChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },

  colLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.charcoal + 'aa',
    gap: Spacing.sm,
  },
  hostStatusCol: { width: 14, alignItems: 'center' },
  hostIpCol: { width: 110 },
  hostVendorCol: { flex: 1 },
  hostLatCol: { width: 38, alignItems: 'flex-end' },

  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  hostRowAlt: { backgroundColor: Colors.charcoal + '66' },
  hostRowExpanded: {
    backgroundColor: Colors.amethystGlow,
    borderColor: Colors.amethyst + '33',
  },
  statusIconText: {},
  hostIp: { letterSpacing: 0.3 },
  hostDetail: {
    width: '100%',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  hostDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  hostDetailItem: {
    width: '45%',
    gap: 2,
  },
  hostDetailLabel: { letterSpacing: 1 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: Spacing.md,
  },
  emptyTitle: { letterSpacing: 3, marginTop: Spacing.sm },
  emptyHint: { textAlign: 'center', letterSpacing: 0.3, lineHeight: 18, maxWidth: 260 },
});
