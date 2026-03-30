import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView,
    TouchableOpacity, Alert, TextInput, Modal, ScrollView,
    KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const [showNameModal, setShowNameModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [newName, setNewName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [trackingEnabled, setTrackingEnabled] = useState(false);

    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('currentUser');

        if (!userData) return;

        const user = JSON.parse(userData);
        setUserName(user.name);
        setUserEmail(user.email);

        const savedTracking = await AsyncStorage.getItem(`tracking_preferences_${user.email}`);

        if (savedTracking) {
            try {
                const parsed = JSON.parse(savedTracking);
                setTrackingEnabled(!!parsed?.enabled);
            } catch {
                setTrackingEnabled(false);
            }
        } else {
            setTrackingEnabled(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadUser();
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            'Log out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('currentUser');
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const handleChangeName = async () => {
        if (!newName.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }
        try {
            const userData = await AsyncStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                user.name = newName.trim();
                await AsyncStorage.setItem('currentUser', JSON.stringify(user));
            }
            const usersData = await AsyncStorage.getItem('users');
            if (usersData) {
                const users = JSON.parse(usersData);
                const updated = users.map((u: any) =>
                    u.email === userEmail ? { ...u, name: newName.trim() } : u
                );
                await AsyncStorage.setItem('users', JSON.stringify(updated));
            }
            setUserName(newName.trim());
            setNewName('');
            setShowNameModal(false);
            Alert.alert('Success', 'Name updated successfully.');
        } catch (e) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters.');
            return;
        }
        try {
            const usersData = await AsyncStorage.getItem('users');
            if (!usersData) return;
            const users = JSON.parse(usersData);
            const user = users.find((u: any) => u.email === userEmail);
            if (!user || user.password !== currentPassword) {
                Alert.alert('Error', 'Current password is incorrect.');
                return;
            }
            const updated = users.map((u: any) =>
                u.email === userEmail ? { ...u, password: newPassword } : u
            );
            await AsyncStorage.setItem('users', JSON.stringify(updated));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordModal(false);
            Alert.alert('Success', 'Password updated successfully.');
        } catch (e) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    const handleTrackingToggle = async (value: boolean) => {
        try {
            setTrackingEnabled(value);

            await AsyncStorage.setItem(
                `tracking_preferences_${userEmail}`,
                JSON.stringify({ enabled: value })
            );

            await AsyncStorage.setItem(`track_banner_shown_${userEmail}`, 'true');
        } catch (e) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.container}>

                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
                            <Feather name="arrow-left" size={24} color="#111" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Account</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Feather name="user" size={36} color="#111" />
                        </View>
                        <Text style={styles.name}>{userName}</Text>
                        <Text style={styles.email}>{userEmail}</Text>
                    </View>

                    <View style={styles.infoSection}>
                        <TouchableOpacity
                            style={styles.infoRow}
                            onPress={() => {
                                setNewName(userName);
                                setShowNameModal(true);
                            }}
                        >
                            <View style={styles.infoIconWrapper}>
                                <Feather name="user" size={18} color="#111" />
                            </View>
                            <View style={styles.infoTextWrapper}>
                                <Text style={styles.infoLabel}>Name</Text>
                                <Text style={styles.infoValue}>{userName}</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#aaa" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconWrapper}>
                                <Feather name="mail" size={18} color="#111" />
                            </View>
                            <View style={styles.infoTextWrapper}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{userEmail}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.infoRow}
                            onPress={() => setShowPasswordModal(true)}
                        >
                            <View style={styles.infoIconWrapper}>
                                <Feather name="lock" size={18} color="#111" />
                            </View>
                            <View style={styles.infoTextWrapper}>
                                <Text style={styles.infoLabel}>Password</Text>
                                <Text style={styles.infoValue}>••••••••</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#aaa" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.personalizationCard}>
                        <View style={styles.personalizationTopRow}>
                            <View style={styles.personalizationIconWrap}>
                                <Feather name="star" size={18} color="#111" />
                            </View>

                            <View style={styles.personalizationTextWrap}>
                                <Text style={styles.personalizationTitle}>Personalization</Text>
                                <Text style={styles.personalizationSubtitle}>
                                    Share your shopping activity to get more relevant recommendations, searches and picks.
                                </Text>
                            </View>

                            <Switch
                                value={trackingEnabled}
                                onValueChange={handleTrackingToggle}
                                trackColor={{ false: '#b8b8b8', true: '#111' }}
                                thumbColor="#fff"
                                ios_backgroundColor="#b8b8b8"
                            />
                        </View>

                        <Text style={styles.personalizationStatus}>
                            {trackingEnabled
                                ? 'Your personalized shopping experience is currently on.'
                                : 'Personalization is currently off. You can turn it on anytime.'}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Feather name="log-out" size={18} color="#fff" />
                        <Text style={styles.logoutText}>LOG OUT</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* Change Name Modal */}
            <Modal
                visible={showNameModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowNameModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            onPress={() => setShowNameModal(false)}
                        />
                        <View style={styles.bottomSheet}>
                            <View style={styles.sheetHandle} />
                            <Text style={styles.sheetTitle}>Change name</Text>

                            <View style={styles.inputWrapper}>
                                <Feather name="user" size={16} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="New name"
                                    placeholderTextColor="#999"
                                    value={newName}
                                    onChangeText={setNewName}
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleChangeName}>
                                <Text style={styles.saveButtonText}>SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                visible={showPasswordModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            onPress={() => setShowPasswordModal(false)}
                        />
                        <View style={styles.bottomSheet}>
                            <View style={styles.sheetHandle} />
                            <Text style={styles.sheetTitle}>Change password</Text>

                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={16} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Current password"
                                    placeholderTextColor="#999"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPw}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={() => setShowCurrentPw(p => !p)}>
                                    <Feather name={showCurrentPw ? 'eye-off' : 'eye'} size={16} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={16} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="New password"
                                    placeholderTextColor="#999"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPw}
                                />
                                <TouchableOpacity onPress={() => setShowNewPw(p => !p)}>
                                    <Feather name={showNewPw ? 'eye-off' : 'eye'} size={16} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={16} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#999"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPw}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPw(p => !p)}>
                                    <Feather name={showConfirmPw ? 'eye-off' : 'eye'} size={16} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                                <Text style={styles.saveButtonText}>SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

    profileCard: {
        alignItems: 'center',
        backgroundColor: '#e9e9e9',
        borderRadius: 20,
        paddingVertical: 28,
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#d0d0d0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    name: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
    email: { fontSize: 14, color: '#6a6a6a' },

    infoSection: {
        backgroundColor: '#e9e9e9',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    infoIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#d4d4d4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoTextWrapper: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#8a8a8a', fontWeight: '500', marginBottom: 2 },
    infoValue: { fontSize: 15, color: '#111', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#d0d0d0' },

    logoutButton: {
        backgroundColor: '#111',
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    logoutText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    bottomSheet: {
        backgroundColor: '#f3f3f3',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingBottom: 34,
        paddingTop: 12,
    },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 20,
    },
    sheetTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 20 },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e9e9e9',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 12,
        gap: 10,
    },
    input: { flex: 1, fontSize: 15, color: '#111' },

    saveButton: {
        backgroundColor: '#111',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    personalizationCard: {
        backgroundColor: '#e9e9e9',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },

    personalizationTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    personalizationIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#d4d4d4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    personalizationTextWrap: {
        flex: 1,
        paddingRight: 10,
    },

    personalizationTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        marginBottom: 3,
    },

    personalizationSubtitle: {
        fontSize: 12,
        lineHeight: 17,
        color: '#6a6a6a',
    },

    personalizationStatus: {
        marginTop: 12,
        fontSize: 12,
        lineHeight: 17,
        color: '#5f5f5f',
    },
});