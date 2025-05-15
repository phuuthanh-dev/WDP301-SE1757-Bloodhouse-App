import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const slides = [
    {
      key: '1',
      title: 'Chào mừng đến với BloodHouse',
      text: 'Nền tảng kết nối cộng đồng hiến máu',
      image: require('../../../assets/onboarding1.png'),
    },
    {
      key: '2',
      title: 'Hiến máu cứu người',
      text: 'Mỗi giọt máu là một món quà của sự sống',
      image: require('../../../assets/onboarding2.png'),
    },
    {
      key: '3',
      title: 'Tìm kiếm và kết nối',
      text: 'Dễ dàng tìm kiếm người hiến máu phù hợp',
      image: require('../../../assets/onboarding3.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <Swiper
        style={styles.wrapper}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        loop={false}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={styles.slide}>
            <Image source={slide?.image} style={styles.image} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </Swiper>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {},
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  dot: {
    backgroundColor: '#95A5A6',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: '#FF6B6B',
    width: 20,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 