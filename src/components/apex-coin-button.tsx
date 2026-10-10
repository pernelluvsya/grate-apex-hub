import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Interactive } from '@/components/ui/interactive';
import { Sheet } from '@/components/ui/sheet';
import { Type, type ThemeColors } from '@/constants/theme';
import { readApexCoinBalance } from '@/data/apex-coins';
import { useAuth } from '@/hooks/use-auth';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

/** A compact GA coin in the Home toolbar, opening balance and earning details. */
export function ApexCoinButton() {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setBalance(null); return; }
    try { setBalance(await readApexCoinBalance()); } catch { setBalance(null); }
  }, [user]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(timer);
  }, [refresh]);

  if (!user) return null;
  return (
    <>
      <Interactive onPress={() => { void refresh(); setVisible(true); }} accessibilityLabel="Apex Coins" accessibilityHint="Shows your coin balance and how to earn coins" style={styles.button}>
        <View style={styles.coin}>
          <Image source={require('@/assets/images/grateapex-mark-letters.png')} style={styles.logoLayer} tintColor="#0A1F5C" resizeMode="contain" />
          <Image source={require('@/assets/images/grateapex-mark-gold.png')} style={styles.logoLayer} resizeMode="contain" />
        </View>
      </Interactive>
      <Sheet visible={visible} onClose={() => setVisible(false)} title="Apex Coins" subtitle="Your balance and ways to earn." footer={null}>
        <View style={styles.content}>
          <View style={styles.balancePanel}>
            <Text style={styles.balanceLabel}>YOUR BALANCE</Text>
            <Text style={styles.balance}>{balance === null ? '—' : balance.toLocaleString()}</Text>
            <Text style={styles.balanceLabel}>APEX COINS</Text>
          </View>
          <Text style={styles.heading}>How to earn coins</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardText}>Complete an Apex Challenge</Text>
            <Text style={styles.rewardAmount}>+5</Text>
          </View>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardText}>Complete a topic</Text>
            <Text style={styles.rewardAmount}>+10</Text>
          </View>
          <Text style={styles.note}>You can also share Apex Coins with accepted friends from your Profile.</Text>
        </View>
      </Sheet>
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    coin: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.accentText, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    logoLayer: { position: 'absolute', width: 23, height: 19 },
    content: { gap: 10 },
    balancePanel: { alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 18, borderRadius: 16, backgroundColor: colors.accentSubtle },
    balanceLabel: { ...Type.overline, color: colors.accentText, letterSpacing: 1 },
    balance: { ...Type.display, color: colors.text, fontSize: 32 },
    heading: { ...Type.callout, color: colors.text, fontWeight: '800', marginTop: 6 },
    rewardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.hairline },
    rewardText: { ...Type.callout, color: colors.textSecondary },
    rewardAmount: { ...Type.callout, color: colors.accentText, fontWeight: '900' },
    note: { ...Type.caption, color: colors.textTertiary, marginTop: 4 },
  });
}
