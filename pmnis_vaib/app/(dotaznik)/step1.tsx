import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Step1() {
  const router = useRouter();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  };

  const handleNext = async () => {
    if (selectedSizes.length === 0) return;

    try {
      const existing = await AsyncStorage.getItem('userProfile');
      const profile = existing ? JSON.parse(existing) : {};

      profile.sizes = selectedSizes;

      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      router.push('/(dotaznik)/step2');
    } catch (error) {
      console.log('Error saving sizes:', error);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>

          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>What sizes do you wear?</Text>
        <Text style={styles.subtitle}>
          Select all that apply so we can recommend better fitting items
        </Text>

        <View style={styles.mainOptions}>
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);

            return (
              <TouchableOpacity
                key={size}
                style={[
                  styles.mainOption,
                  isSelected && styles.mainOptionSelected,
                ]}
                onPress={() => toggleSize(size)}
              >
                <Text
                  style={[
                    styles.mainOptionText,
                    isSelected && styles.mainOptionTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            selectedSizes.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedSizes.length === 0}
        >
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 20,
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
    marginBottom: 36,
  },
  mainOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  mainOption: {
    width: '30%',
    minWidth: 90,
    backgroundColor: '#e9e9e9',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mainOptionSelected: {
    borderColor: '#111',
    backgroundColor: '#fff',
  },
  mainOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#393939',
  },
  mainOptionTextSelected: {
    color: '#111',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
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