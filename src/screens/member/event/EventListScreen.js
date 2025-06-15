import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  Linking,
  Dimensions,
} from "react-native";
import {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatHelpers";
import Toast from "react-native-toast-message";
import eventAPI from "@/apis/eventAPI";
import Header from "@/components/Header";
import { getStatusEventColor } from "@/constants/eventStatus";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_MARGIN * 4; // Subtract total horizontal margin

const EVENT_CATEGORIES = [
  { id: "all", name: "Tất cả", icon: "calendar-month" },
  { id: "upcoming", name: "Sắp diễn ra", icon: "calendar-clock" },
  { id: "ongoing", name: "Đang diễn ra", icon: "calendar-check" },
  { id: "completed", name: "Đã kết thúc", icon: "calendar-remove" },
];

export default function EventListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedCategory, events]);

  const filterEvents = () => {
    if (selectedCategory === "all") {
      setFilteredEvents(events);
      return;
    }

    const now = new Date();
    let filtered = [];

    switch (selectedCategory) {
      case "upcoming":
        filtered = events.filter((event) => new Date(event.startTime) > now);
        break;
      case "ongoing":
        filtered = events.filter((event) => {
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);
          return startTime <= now && endTime >= now;
        });
        break;
      case "completed":
        filtered = events.filter((event) => new Date(event.endTime) < now);
        break;
      default:
        filtered = events;
    }

    setFilteredEvents(filtered);
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventAPI.HandleEvent("?page=1&limit=10");
      setEvents(response.data.data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi khi tải sự kiện",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactPress = (type, value) => {
    if (type === "phone") {
      Linking.openURL(`tel:${value}`);
    } else if (type === "email") {
      Linking.openURL(`mailto:${value}`);
    }
  };

  const renderCategoryFilter = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterContainer}
      >
        {EVENT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? "#FFFFFF" : "#95A5A6"}
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEvent = (event) => (
    <View key={event?._id} style={styles.eventCardContainer}>
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() =>
          navigation.navigate("EventDetail", { eventId: event?._id })
        }
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: event?.bannerUrl }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.eventContent}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusEventColor(event?.status).bg },
              ]}
            >
              <MaterialCommunityIcons
                name={getStatusEventColor(event?.status).icon}
                size={14}
                color={getStatusEventColor(event?.status).text}
                style={styles.statusIcon}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusEventColor(event?.status).text },
                ]}
              >
                {event?.status?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.participantsContainer}>
              <FontAwesome5 name="user-friends" size={12} color="#95A5A6" />
              <Text style={styles.participantsText}>
                {event?.registeredParticipants || 0}/
                {event?.expectedParticipants}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle} numberOfLines={2}>
            {event?.title}
          </Text>

          <View style={styles.facilityRow}>
            <MaterialIcons name="location-on" size={14} color="#FF6B6B" />
            <Text style={styles.facilityName} numberOfLines={1}>
              {event?.address}
            </Text>
          </View>

          <View style={styles.eventMeta}>
            <View style={styles.timeInfo}>
              <MaterialIcons name="access-time" size={14} color="#95A5A6" />
              <Text style={styles.eventTime}>
                {formatDateTime(event?.startTime)}
              </Text>
            </View>
            <View style={styles.contactContainer}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContactPress("phone", event?.contactPhone)}
              >
                <MaterialIcons name="phone" size={16} color="#00B074" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContactPress("email", event?.contactEmail)}
              >
                <MaterialIcons name="email" size={16} color="#FF6B6B" />
              </TouchableOpacity>
              <View style={styles.readMoreButton}>
                <Ionicons name="arrow-forward" size={20} color="#FF6B6B" />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Sự kiện hiến máu" showBackButton />
      {renderCategoryFilter()}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchEvents} />
        }
      >
        {filteredEvents?.map(renderEvent)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: CARD_MARGIN,
    paddingBottom: 32,
  },
  categoryFilterContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  categoryButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: "#95A5A6",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  eventCardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  eventImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventContent: {
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsText: {
    fontSize: 12,
    color: "#95A5A6",
    marginLeft: 6,
    fontWeight: "500",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 12,
    lineHeight: 22,
  },
  facilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  facilityName: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
  eventMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  eventTime: {
    fontSize: 12,
    color: "#95A5A6",
    marginLeft: 6,
    fontWeight: "500",
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  readMoreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
});
