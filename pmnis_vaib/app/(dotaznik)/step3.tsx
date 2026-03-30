// step3.tsx
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const budgets = [
  { label: 'Up to €30', value: 'low' },
  { label: '€30 – €80', value: 'mid' },
  { label: '€80 – €150', value: 'high' },
  { label: '€150+', value: 'luxury' },
];

export default function Step3() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleFinish = async () => {
    if (!selected) return;
    const existing = await AsyncStorage.getItem('userProfile');
    const profile = existing ? JSON.parse(existing) : {};
    profile.budget = selected;
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    await AsyncStorage.removeItem('skippedOnboarding'); // dokoncil dotaznik = nie je skip
    router.replace('/(tabs)/home');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('skippedOnboarding', 'true');
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.topRow}>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={[styles.progressDot, styles.progressActive]} />
          </View>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Budget</Text>
        <Text style={styles.subtitle}>How much do you usually spend on a single clothing item?</Text>

        <View style={styles.optionsGrid}>
          {budgets.map((b) => (
            <TouchableOpacity
              key={b.value}
              style={[styles.option, selected === b.value && styles.optionSelected]}
              onPress={() => setSelected(b.value)}
            >
              <Text style={[styles.optionText, selected === b.value && styles.optionTextSelected]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={!selected}
        >
          <Text style={styles.buttonText}>START EXPLORING</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, gap: 12 },
  progressRow: { flexDirection: 'row', gap: 8, flex: 1 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0' },
  progressActive: { backgroundColor: '#111' },
  skip: { fontSize: 13, color: '#111', fontWeight: '700', borderWidth: 1.5, borderColor: '#111', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  title: { fontSize: 32, fontWeight: '700', color: '#111', marginBottom: 8, letterSpacing: -0.7 },
  subtitle: { fontSize: 14, color: '#393939', marginBottom: 36 },
  optionsGrid: { gap: 12 },
  option: { backgroundColor: '#e9e9e9', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  optionSelected: { borderColor: '#111', backgroundColor: '#fff' },
  optionText: { fontSize: 18, color: '#393939', fontWeight: '500' },
  optionTextSelected: { color: '#111', fontWeight: '700' },
  button: { backgroundColor: '#111', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});