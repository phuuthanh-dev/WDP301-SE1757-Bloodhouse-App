import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import bloodDeliveryAPI from "@/apis/bloodDeliveryAPI";
import Header from "@/components/Header";

const ISSUE_TYPES = [
  {
    id: "wrong_address",
    label: "Địa chỉ không chính xác",
    icon: "location-off",
  },
  {
    id: "no_receiver",
    label: "Không liên hệ được người nhận",
    icon: "person-off",
  },
  {
    id: "damaged",
    label: "Hàng bị hư hỏng",
    icon: "warning",
  },
  {
    id: "other",
    label: "Vấn đề khác",
    icon: "error",
  },
];

const DeliveryReportScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Cần quyền truy cập thư viện ảnh để chọn ảnh"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Cần quyền truy cập camera để chụp ảnh"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!selectedIssue) {
      Alert.alert("Lỗi", "Vui lòng chọn loại sự cố");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Lỗi", "Vui lòng mô tả chi tiết sự cố");
      return;
    }

    try {
      setUploading(true);
      // TODO: Implement API call to report issue
      // const formData = new FormData();
      // formData.append("issueType", selectedIssue);
      // formData.append("description", description);
      // images.forEach((image, index) => {
      //   formData.append("images", {
      //     uri: image,
      //     type: "image/jpeg",
      //     name: `image-${index}.jpg`,
      //   });
      // });
      // await bloodDeliveryAPI.reportIssue(id, formData);

      Alert.alert("Thành công", "Đã gửi báo cáo sự cố", [
        {
          text: "OK",
          onPress: () => navigation.navigate("DeliveryList"),
        },
      ]);
    } catch (error) {
      console.error("Error reporting issue:", error);
      Alert.alert("Lỗi", "Không thể gửi báo cáo. Vui lòng thử lại sau.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Báo cáo sự cố" showBackButton />
      <ScrollView style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.subtitle}>
            Vui lòng chọn loại sự cố và mô tả chi tiết vấn đề bạn gặp phải
          </Text>
        </View>

        {/* Issue Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại sự cố</Text>
          <View style={styles.issueGrid}>
            {ISSUE_TYPES.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[
                  styles.issueButton,
                  selectedIssue === issue.id && styles.issueButtonActive,
                ]}
                onPress={() => setSelectedIssue(issue.id)}
              >
                <MaterialIcons
                  name={issue.icon}
                  size={24}
                  color={selectedIssue === issue.id ? "white" : "#636E72"}
                />
                <Text
                  style={[
                    styles.issueButtonText,
                    selectedIssue === issue.id && styles.issueButtonTextActive,
                  ]}
                >
                  {issue.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Mô tả chi tiết sự cố bạn gặp phải..."
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình ảnh đính kèm</Text>
          <View style={styles.imageContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <MaterialIcons name="camera-alt" size={24} color="white" />
              <Text style={styles.buttonText}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Text style={styles.buttonText}>Chọn ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (uploading || !selectedIssue || !description.trim()) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={uploading || !selectedIssue || !description.trim()}
        >
          {uploading ? (
            <Text style={styles.submitButtonText}>Đang gửi...</Text>
          ) : (
            <>
              <MaterialIcons name="send" size={24} color="white" />
              <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#636E72",
    textAlign: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  issueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  issueButton: {
    width: "50%",
    padding: 16,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  issueButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  issueButtonText: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 8,
    textAlign: "center",
  },
  issueButtonTextActive: {
    color: "white",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  imageWrapper: {
    width: "50%",
    padding: 8,
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#B2BEC3",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default DeliveryReportScreen; 