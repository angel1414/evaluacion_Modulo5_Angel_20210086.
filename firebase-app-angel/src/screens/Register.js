import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

export default function Register({ navigation }) {
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());
  const isYearValid = /^\d{4}$/.test(String(gradYear)) && Number(gradYear) >= 1950 && Number(gradYear) <= 2100;
  const canSubmit =
    name.trim() && degree.trim() && isYearValid && isEmailValid && password.length >= 6;

  const onRegister = async () => {
    try {
      if (!canSubmit) {
        Alert.alert('Revisa los campos', 'Completa todos los campos válidos.');
        return;
      }
      setLoading(true);

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Guarda nombre visible en Auth (opcional)
      await updateProfile(user, { displayName: name.trim() });

      // Guarda perfil en Firestore
      await setDoc(doc(database, 'users', user.uid), {
        name: name.trim(),
        email: user.email,
        degree: degree.trim(),
        gradYear: Number(gradYear),
        createdAt: serverTimestamp(),
      });

      // Forzar pasar por Login
      await signOut(auth);
      Alert.alert('Cuenta creada', 'Ahora inicia sesión con tus credenciales');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para continuar</Text>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Pérez"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={[styles.input, !isEmailValid && email ? styles.inputError : null]}
                placeholder="tu@correo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
              {!isEmailValid && email ? (
                <Text style={styles.helpText}>Ingresa un correo válido.</Text>
              ) : null}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  style={[styles.input, { paddingRight: 90 }]}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={secure}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.showBtn}
                  onPress={() => setSecure((s) => !s)}
                >
                  <Text style={styles.showBtnText}>
                    {secure ? 'Mostrar' : 'Ocultar'}
                  </Text>
                </TouchableOpacity>
              </View>
              {password && password.length < 6 ? (
                <Text style={styles.helpText}>Debe tener al menos 6 caracteres.</Text>
              ) : null}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Título universitario</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Ingeniería en Sistemas"
                value={degree}
                onChangeText={setDegree}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Año de graduación</Text>
              <TextInput
                style={[styles.input, !isYearValid && gradYear ? styles.inputError : null]}
                placeholder="Ej: 2026"
                keyboardType="numeric"
                value={String(gradYear)}
                onChangeText={setGradYear}
                maxLength={4}
                returnKeyType="done"
              />
              {!isYearValid && gradYear ? (
                <Text style={styles.helpText}>Usa un año entre 1950 y 2100.</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, !canSubmit && { opacity: 0.5 }]}
              activeOpacity={0.8}
              disabled={!canSubmit || loading}
              onPress={onRegister}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.primaryBtnText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center', // ✅ centrado vertical en móvil
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 18,
  },
  inputBlock: { marginBottom: 14 },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  helpText: {
    marginTop: 6,
    color: '#EF4444',
    fontSize: 12,
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  showBtn: {
    position: 'absolute',
    right: 10,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  showBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#0288d1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
});
