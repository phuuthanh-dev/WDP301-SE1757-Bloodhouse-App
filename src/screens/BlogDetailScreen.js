import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function BlogDetailScreen({ route, navigation }) {
  const { blog } = route.params;
  const [isLiked, setIsLiked] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${blog.title}\n\nĐọc thêm tại Bloodhouse App`,
        title: blog.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const relatedPosts = [
    {
      id: 1,
      title: 'Tầm quan trọng của việc hiến máu định kỳ',
      image: 'https://example.com/image1.jpg',
      date: '2024-03-15',
    },
    {
      id: 2,
      title: 'Những điều cần biết trước khi hiến máu',
      image: 'https://example.com/image2.jpg',
      date: '2024-03-14',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <MaterialIcons name="share" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Featured Image */}
      <Image
        source={{ uri: blog.image }}
        style={styles.featuredImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Meta */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{blog.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.date}>{blog.date}</Text>
            <View style={styles.dot} />
            <Text style={styles.author}>{blog.author}</Text>
          </View>
        </View>

        {/* Body Content */}
        <Text style={styles.bodyText}>{blog.content}</Text>

        {/* Interaction Buttons */}
        <View style={styles.interactionBar}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => setIsLiked(!isLiked)}
          >
            <MaterialIcons
              name={isLiked ? 'favorite' : 'favorite-border'}
              size={24}
              color={isLiked ? '#FF6B6B' : '#95A5A6'}
            />
            <Text style={[styles.likeCount, isLiked && styles.likedText]}>
              {blog.likes} lượt thích
            </Text>
          </TouchableOpacity>
        </View>

        {/* Related Posts */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Bài viết liên quan</Text>
          {relatedPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.relatedPost}
              onPress={() => navigation.push('BlogDetail', { blog: post })}
            >
              <Image
                source={{ uri: post.image }}
                style={styles.relatedImage}
                resizeMode="cover"
              />
              <View style={styles.relatedContent}>
                <Text style={styles.relatedPostTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                <Text style={styles.relatedDate}>{post.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredImage: {
    width: width,
    height: width * 0.6,
  },
  content: {
    padding: 16,
    marginTop: -20,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#95A5A6',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#95A5A6',
    marginHorizontal: 8,
  },
  author: {
    fontSize: 14,
    color: '#95A5A6',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2D3436',
    marginBottom: 20,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 20,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 8,
    fontSize: 14,
    color: '#95A5A6',
  },
  likedText: {
    color: '#FF6B6B',
  },
  relatedSection: {
    marginTop: 20,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  relatedPost: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  relatedImage: {
    width: 100,
    height: 100,
  },
  relatedContent: {
    flex: 1,
    padding: 12,
  },
  relatedPostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  relatedDate: {
    fontSize: 14,
    color: '#95A5A6',
  },
});