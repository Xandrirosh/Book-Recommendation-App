import { View, Text, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React from 'react'
import styles from '../../assets/styles/signup.styles'
import { useState } from 'react'
import COLORS from '../../constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router';
import { Platform } from 'react-native'
import { useAuthStore } from '../../store/authStore'

const Signup = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { user, isLoading, register } = useAuthStore();

  const router = useRouter()

  const handleSignup = async () => {
    // Handle signup logic here
    const result = await register(username, email, password);

    if (!result.success) Alert.alert('Error', result.message || 'Registration failed');
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <View style={styles.card}>
            {/* header*/}
            <View style={styles.header}>
              <Text style={styles.title}>BookWorm🐛</Text>
              <Text style={styles.subtitle}>Share your favorite books!</Text>
            </View>

            {/* form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter your username"
                    placeholderTextColor={COLORS.placeholderText}
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.placeholderText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.placeholderText}
                    keyboardType="default"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {
                  isLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )
                }
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.link}> Login</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>
      </KeyboardAvoidingView >
    </TouchableWithoutFeedback >
  )
}

export default Signup