import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import authenticationAPI from "@/apis/authAPI";
import { toast } from "sonner-native";
import { useAuth } from "@/hooks/useAuth";
import { useFacility } from '@/contexts/FacilityContext';
import { USER_ROLE, STAFF_ROLES } from '@/constants/userRole';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { updateFacilityData } = useFacility();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setIsLoading(true);
      const response = await authenticationAPI.HandleAuthentication(
        "/sign-in",
        { email, password },
        "post"
      );
      if (response.status === 200) {
        const userData = response.data.user;
        
        // If user is staff (manager, doctor, nurse), store facility data
        if (STAFF_ROLES.includes(userData.position)) {
          await updateFacilityData({
            facilityId: userData.facilityId,
            position: userData.position,
            facilityName: userData.facilityName,
          });
        }
        
        await login(response.data.tokens.accessToken, userData);
        toast.success("Đăng nhập thành công");
        // Navigation is handled automatically by AppRouters
      } else {
        toast.error(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={24}
              color="#95A5A6"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={24}
              color="#95A5A6"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#95A5A6"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#636E72",
  },
  form: {
    flex: 1,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#2D3436",
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#FF6B6B",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#636E72",
    fontSize: 16,
  },
  registerLink: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
  },
});
