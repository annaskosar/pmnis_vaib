import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Step1() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleNext = async () => {
    if (!selected) return;
    const existing = await AsyncStorage.getItem('userProfile');
    const profile = existing ? JSON.parse(existing) : {};
    profile.gender = selected;
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    router.push('/(dotaznik)/step2');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.topRow}>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>This helps us personalise your content better</Text>

        <View style={styles.mainOptions}>
          <TouchableOpacity
            style={[styles.mainOption, selected === 'Woman' && styles.mainOptionSelected]}
            onPress={() => setSelected('Woman')}
          >
            <Text style={[styles.mainOptionText, selected === 'Woman' && styles.mainOptionTextSelected]}>
              Woman
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainOption, selected === 'Man' && styles.mainOptionSelected]}
            onPress={() => setSelected('Man')}
          >
            <Text style={[styles.mainOptionText, selected === 'Man' && styles.mainOptionTextSelected]}>
              Man
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
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
  subtitle: { fontSize: 14, color: '#393939', marginBottom: 36 },
  mainOptions: { flexDirection: 'row', gap: 14 },
  mainOption: {
    flex: 1, backgroundColor: '#e9e9e9', borderRadius: 16,
    paddingVertical: 60, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  mainOptionSelected: { borderColor: '#111', backgroundColor: '#fff' },
  mainOptionText: { fontSize: 18, fontWeight: '600', color: '#393939' },
  mainOptionTextSelected: { color: '#111', fontWeight: '700' },
  button: {
    backgroundColor: '#111', paddingVertical: 16, borderRadius: 20,
    alignItems: 'center', marginTop: 'auto', marginBottom: 20,
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
