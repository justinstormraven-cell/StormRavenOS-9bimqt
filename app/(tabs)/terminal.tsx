// Powered by OnSpace.AI — StormRaven Terminal
import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { useTerminal } from '../../hooks/useTerminal';
import { GlowText } from '../../components/ui/GlowText';
import { TerminalLineItem } from '../../components/feature/TerminalLine';

const QUICK_COMMANDS = ['help', 'neofetch', 'scan', 'vault', 'clear'];

export default function TerminalScreen() {
  const {
    lines,
    input,
    setInput,
    isProcessing,
    isLockdown,
    isScanStreaming,
    executeCommand,
    resetLockdown,
  } = useTerminal();

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [lines]);

  const handleSubmit = useCallback(() => {
    if (input.trim() || input === '') {
      executeCommand(input);
    }
  }, [input, executeCommand]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.dot, { backgroundColor: Colors.coral }]} />
            <View style={[styles.dot, { backgroundColor: Colors.statusWarning }]} />
            <View style={[styles.dot, { backgroundColor: Colors.statusOnline }]} />
          </View>
          <GlowText color={Colors.textSecondary} size={Typography.sizes.xs} weight="600" style={styles.headerTitle}>
            STORMRAVEN TERMINAL — THOR/HEIMDALL LAYER
          </GlowText>
          <View style={styles.headerRight}>
            {(isProcessing || isScanStreaming) && (
              <ActivityIndicator size="small" color={Colors.cyan} />
            )}
          </View>
        </View>

        {/* Lockdown Overlay */}
        {isLockdown && (
          <Pressable style={styles.lockdownBanner} onPress={resetLockdown}>
            <MaterialIcons name="lock" size={14} color={Colors.coral} />
            <GlowText color={Colors.coral} size={Typography.sizes.xs} weight="700" style={styles.lockdownText}>
              LOCKDOWN ACTIVE — TAP TO LIFT ISOLATION
            </GlowText>
          </Pressable>
        )}

        {/* Output */}
        <ScrollView
          ref={scrollRef}
          style={styles.output}
          contentContainerStyle={styles.outputContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {lines.map(line => (
            <TerminalLineItem key={line.id} line={line} />
          ))}
          {(isProcessing && !isScanStreaming) && (
            <View style={styles.processingRow}>
              <GlowText color={Colors.amethyst} size={Typography.sizes.sm}>{'  ▶ processing...'}</GlowText>
            </View>
          )}
        </ScrollView>

        {/* Quick Commands */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickBar}
          contentContainerStyle={styles.quickBarContent}
        >
          {QUICK_COMMANDS.map(cmd => (
            <Pressable
              key={cmd}
              style={({ pressed }) => [styles.quickBtn, pressed && styles.quickBtnPressed]}
              onPress={() => executeCommand(cmd)}
              disabled={isProcessing || isLockdown}
            >
              <GlowText color={Colors.textCyan} size={Typography.sizes.xs} weight="600" style={styles.quickBtnText}>
                {cmd}
              </GlowText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Input Row */}
        <View style={[styles.inputRow, isLockdown && styles.inputRowLocked]}>
          <GlowText
            color={isLockdown ? Colors.coral : Colors.textCyan}
            size={Typography.sizes.sm}
            weight="600"
            style={styles.prompt}
          >
            {isLockdown ? '[LOCKED]#' : 'root@raven:~#'}
          </GlowText>
          <TextInput
            ref={inputRef}
            style={[styles.input, isLockdown && styles.inputLocked]}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            editable={!isLockdown && !isProcessing}
            placeholder={isLockdown ? 'NETWORK ISOLATED' : 'enter command...'}
            placeholderTextColor={isLockdown ? Colors.coralDim : Colors.textMuted}
            selectionColor={Colors.amethyst}
            blurOnSubmit={false}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              pressed && styles.sendBtnPressed,
              (isLockdown || isProcessing) && styles.sendBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLockdown || isProcessing}
          >
            <MaterialIcons name="keyboard-return" size={18} color={isLockdown ? Colors.textMuted : Colors.amethyst} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.matteBlack,
  },
  kav: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.charcoal,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    letterSpacing: 0.8,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 24,
    alignItems: 'flex-end',
  },
  lockdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coralGlow,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.coral + '44',
  },
  lockdownText: {
    letterSpacing: 1,
  },
  output: {
    flex: 1,
    backgroundColor: Colors.obsidian,
  },
  outputContent: {
    paddingVertical: Spacing.md,
  },
  processingRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 2,
  },
  quickBar: {
    maxHeight: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.charcoal,
  },
  quickBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  quickBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    backgroundColor: Colors.cyanGlow,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.cyanDim + '55',
  },
  quickBtnPressed: {
    backgroundColor: Colors.cyan + '22',
  },
  quickBtnText: {
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.charcoal,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    minHeight: 52,
  },
  inputRowLocked: {
    borderTopColor: Colors.coral + '55',
    backgroundColor: Colors.coralGlow,
  },
  prompt: {
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    fontFamily: Typography.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    includeFontPadding: false,
    paddingVertical: 0,
  },
  inputLocked: {
    color: Colors.coral,
  },
  sendBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.amethystGlow,
    borderWidth: 1,
    borderColor: Colors.amethyst + '44',
  },
  sendBtnPressed: {
    backgroundColor: Colors.amethyst + '33',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
