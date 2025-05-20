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
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { formatDateTime } from '@/utils/formatHelpers';
import RenderHtml from 'react-native-render-html';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Image with Gradient Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: blog.image }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          
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
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Tag */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>
              {blog.categoryId?.name?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          {/* Title and Meta */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{blog.title}</Text>
            <View style={styles.meta}>
              <View style={styles.authorInfo}>
                <Image source={{ uri: blog.authorId?.avatar }} style={styles.authorAvatar} />
                <View>
                  <Text style={styles.authorName}>{blog.authorId?.fullName}</Text>
                  <Text style={styles.date}>{formatDateTime(blog.createdAt)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Summary */}
          {blog.summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>{blog.summary}</Text>
            </View>
          )}

          {/* Body Content */}
          <View style={styles.bodyContainer}>
            <RenderHtml
              contentWidth={width - 32}
              source={{ html: blog.content }}
              tagsStyles={{
                p: styles.paragraph,
                h1: styles.heading1,
                h2: styles.heading2,
                h3: styles.heading3,
                ul: styles.list,
                ol: styles.list,
                li: styles.listItem,
                img: styles.contentImage,
              }}
            />
          </View>

          {/* Interaction Bar */}
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
                {blog.likes || 0} lượt thích
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: width * 0.7,
  },
  featuredImage: {
    width: width,
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    marginTop: -20,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  categoryContainer: {
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
    lineHeight: 32,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2D3436',
  },
  authorInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#95A5A6',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#636E72',
    fontStyle: 'italic',
  },
  bodyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2D3436',
    marginBottom: 16,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  list: {
    marginBottom: 16,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2D3436',
    marginBottom: 8,
  },
  contentImage: {
    width: '100%',
    height: '80%',
    borderRadius: 12,
    marginVertical: 16,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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