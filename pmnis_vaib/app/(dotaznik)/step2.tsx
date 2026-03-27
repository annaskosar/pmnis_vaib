import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles_options = ['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Boho', 'Sporty', 'Vintage', 'Elegantný'];
const color_options = [
  { label: 'Čierna', color: '#111' },
  { label: 'Biela', color: '#fff' },
  { label: 'Béžová', color: '#d4b896' },
  { label: 'Hnedá', color: '#8B6F47' },
  { label: 'Modrá', color: '#4A90D9' },
  { label: 'Zelená', color: '#5A8A5A' },
  { label: 'Ružová', color: '#E8A0B0' },
  { label: 'Červená', color: '#D94A4A' },
];

export default function Step2() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggleStyle = (s: string) => {
    setSelectedStyles(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const toggleColor = (c: string) => {
    setSelectedColors(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const handleNext = async () => {
    if (!selectedStyles.length || !selectedColors.length) return;
    const existing = await AsyncStorage.getItem('userProfile');
    const profile = existing ? JSON.parse(existing) : {};
    profile.styles = selectedStyles;
    profile.colors = selectedColors;
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    router.push('/(dotaznik)/step3');
  };

  const canContinue = selectedStyles.length > 0 && selectedColors.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.topRow}>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
          </View>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.skip}>Preskočiť</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Tvoj štýl</Text>
        <Text style={styles.subtitle}>Vyber všetky ktoré ti sedia</Text>

        <Text style={styles.sectionLabel}>Štýl oblečenia</Text>
        <View style={styles.optionsWrap}>
          {styles_options.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, selectedStyles.includes(s) && styles.chipSelected]}
              onPress={() => toggleStyle(s)}
            >
              <Text style={[styles.chipText, selectedStyles.includes(s) && styles.chipTextSelected]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Obľúbené farby</Text>
        <View style={styles.colorsWrap}>
          {color_options.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={styles.colorItem}
              onPress={() => toggleColor(c.label)}
            >
              <View style={[
                styles.colorCircle,
                { backgroundColor: c.color },
                c.color === '#fff' && styles.colorCircleBorder,
                selectedColors.includes(c.label) && styles.colorCircleSelected,
              ]} />
              <Text style={styles.colorLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canContinue}
        >
          <Text style={styles.buttonText}>ĎALEJ</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
  container: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  progressRow: { flexDirection: 'row', gap: 8, flex: 1 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0' },
  progressActive: { backgroundColor: '#111' },
  skip: {
  fontSize: 13,
  color: '#111',
  fontWeight: '700',
  borderWidth: 1.5,
  borderColor: '#111',
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 20,
},
  title: { fontSize: 32, fontWeight: '700', color: '#111', marginBottom: 8, letterSpacing: -0.7 },
  subtitle: { fontSize: 14, color: '#393939', marginBottom: 24 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12, marginTop: 8 },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20,
    backgroundColor: '#e9e9e9', borderWidth: 2, borderColor: 'transparent',
  },
  chipSelected: { borderColor: '#111', backgroundColor: '#fff' },
  chipText: { fontSize: 14, color: '#393939', fontWeight: '500' },
  chipTextSelected: { color: '#111', fontWeight: '700' },
  colorsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  colorItem: { alignItems: 'center', gap: 6 },
  colorCircle: { width: 44, height: 44, borderRadius: 22 },
  colorCircleBorder: { borderWidth: 1, borderColor: '#ccc' },
  colorCircleSelected: { borderWidth: 3, borderColor: '#111' },
  colorLabel: { fontSize: 11, color: '#393939' },
  button: {
    backgroundColor: '#111', paddingVertical: 16, borderRadius: 20,
    alignItems: 'center', marginBottom: 12,
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});