import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STYLE_OPTIONS = [
  'Casual',
  'Formal',
  'Streetwear',
  'Minimalist',
  'Boho',
  'Sporty',
  'Vintage',
  'Elegant',
];

export default function Step2() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((item) => item !== style)
        : [...prev, style]
    );
  };

  const handleNext = async () => {
    if (!selectedStyles.length) return;

    try {
      const existing = await AsyncStorage.getItem('userProfile');
      const profile = existing ? JSON.parse(existing) : {};

      profile.styles = selectedStyles;

      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      router.push('/(dotaznik)/step3');
    } catch (error) {
      console.log('Error saving styles:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('skippedOnboarding', 'true');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.log('Error skipping onboarding:', error);
    }
  };

  const canContinue = selectedStyles.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, styles.progressActive]} />
              <View style={[styles.progressDot, styles.progressActive]} />
              <View style={styles.progressDot} />
            </View>

            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Your style</Text>
          <Text style={styles.subtitle}>Pick all that suit you</Text>

          <Text style={styles.sectionLabel}>Clothing style</Text>

          <View style={styles.optionsWrap}>
            {STYLE_OPTIONS.map((style) => {
              const isSelected = selectedStyles.includes(style);

              return (
                <TouchableOpacity
                  key={style}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleStyle(style)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomButtonWrap}>
          <TouchableOpacity
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canContinue}
          >
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
  },
  progressActive: {
    backgroundColor: '#111',
  },
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 14,
    color: '#393939',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    marginTop: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#e9e9e9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: '#111',
    backgroundColor: '#fff',
  },
  chipText: {
    fontSize: 14,
    color: '#393939',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#111',
    fontWeight: '700',
  },
  bottomButtonWrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#f3f3f3',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});