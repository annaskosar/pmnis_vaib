import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        const existing = await AsyncStorage.getItem('users');
        const users = existing ? JSON.parse(existing) : [];
        if (users.find((u: any) => u.email === email)) {
            Alert.alert('Error', 'This email already exists');
            return;
        }
        users.push({ name, email, password });
        await AsyncStorage.setItem('users', JSON.stringify(users));
        await AsyncStorage.setItem('currentUser', JSON.stringify({ name, email }));
        Alert.alert('Done!', 'Account created!', [
            { text: 'OK', onPress: () => router.replace('/(dotaznik)/step1') }
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

                    <Text style={styles.title}>Create account</Text>
                    <Text style={styles.subtitle}>Sign up and start exploring</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Name"
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

                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={16} color="#999" />
                        <TextInput
                            style={styles.inputInner}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                            <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#999" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>SIGN UP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                        <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Log in</Text></Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 },
    logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 24 },
    title: { fontSize: 32, fontWeight: '700', color: '#111', marginBottom: 6, letterSpacing: -0.7 },
    subtitle: { fontSize: 14, color: '#393939', marginBottom: 36 },
    input: {
        backgroundColor: '#e9e9e9', borderRadius: 12,
        padding: 14, fontSize: 15, color: '#111', marginBottom: 14,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e9e9e9',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 14,
        gap: 10,
    },
    inputInner: { flex: 1, fontSize: 15, color: '#111' },
    button: {
        backgroundColor: '#111', paddingVertical: 16, borderRadius: 20,
        alignItems: 'center', marginTop: 8, marginBottom: 20,
    },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    link: { textAlign: 'center', color: '#393939', fontSize: 14 },
    linkBold: { fontWeight: '700', color: '#111' },
});