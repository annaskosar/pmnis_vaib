import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Chyba', 'Vyplň všetky polia');
      return;
    }

    const existing = await AsyncStorage.getItem('users');
    const users = existing ? JSON.parse(existing) : [];

    if (users.find((u: any) => u.email === email)) {
      Alert.alert('Chyba', 'Tento email už existuje');
      return;
    }

    users.push({ name, email, password });
    await AsyncStorage.setItem('users', JSON.stringify(users));

    Alert.alert('Hotovo!', 'Účet vytvorený!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
    ]);
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Vytvor účet</Text>
          <Text style={styles.subtitle}>Registruj sa a začni objavovať</Text>

          <TextInput
            style={styles.input}
            placeholder="Meno"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Heslo"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>REGISTROVAŤ SA</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.link}>Máš účet? <Text style={styles.linkBold}>Prihlás sa</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 14,
    color: '#393939',
    marginBottom: 36,
  },
  input: {
    backgroundColor: '#e9e9e9',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111',
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  link: {
    textAlign: 'center',
    color: '#393939',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: '700',
    color: '#111',
  },
});