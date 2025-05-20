import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import contentAPI from '@/apis/contentAPI';
import { formatDateTime } from '@/utils/formatHelpers';

export default function BlogListScreen({ navigation }) {
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const response = await contentAPI.HandleContent();
      setBlogPosts(response.data);
    };
    fetchBlogPosts();
  }, []);
  
  // Mock data for blog posts
  // const blogPosts = [
  //   {
  //     id: 1,
  //     title: "Những điều cần biết trước khi hiến máu",
  //     author: "BS. Nguyễn Văn A",
  //     date: "22/02/2024",
  //     image: "https://vienhuyethoc.vn/wp-content/uploads/2021/07/luu-y-truoc-va-sau-khi-hien-mau-1-1024x628.jpg",
  //     readTime: "5 phút",
  //     preview: "Hiến máu là một hành động cao cả, giúp cứu sống nhiều người. Tuy nhiên, trước khi hiến máu, bạn cần lưu ý một số điều quan trọng...",
  //   },
  //   {
  //     id: 2,
  //     title: "Chế độ ăn uống sau khi hiến máu",
  //     author: "BS. Trần Thị B",
  //     date: "20/02/2024",
  //     image: "https://cdn.tgdd.vn/Files/2022/06/13/1439533/can-luu-y-gi-truoc-va-sau-khi-hien-mau-tinh-nguyen-202206131418440901.jpg",
  //     readTime: "3 phút",
  //     preview: "Sau khi hiến máu, cơ thể cần được bổ sung đầy đủ dinh dưỡng để phục hồi. Hãy tìm hiểu về chế độ ăn uống phù hợp...",
  //   },
  //   {
  //     id: 3,
  //     title: "Tầm quan trọng của việc hiến máu định kỳ",
  //     author: "BS. Lê Văn C",
  //     date: "18/02/2024",
  //     image: "https://image.thanhnien.vn/w2048/Uploaded/2024/zxaijr/2024_01_07/hien-mau-8-1-5752.jpg",
  //     readTime: "4 phút",
  //     preview: "Hiến máu định kỳ không chỉ giúp cứu người mà còn có lợi cho sức khỏe của người hiến. Cùng tìm hiểu về những lợi ích này...",
  //   },
  //   {
  //     id: 4,
  //     title: "Các nhóm máu hiếm và nhu cầu hiến máu",
  //     author: "BS. Phạm Thị D",
  //     date: "15/02/2024",
  //     image: "https://cdn.tuoitre.vn/471584752817336320/2024/2/7/hien-mau-17072331073091459604089.jpg",
  //     readTime: "6 phút",
  //     preview: "Một số nhóm máu rất hiếm gặp và luôn trong tình trạng thiếu hụt. Hãy tìm hiểu về các nhóm máu hiếm và tầm quan trọng của chúng...",
  //   },
  // ];

  const renderBlogPost = (blog) => (
    <TouchableOpacity
      key={blog?._id}
      style={styles.blogCard}
      onPress={() => navigation.navigate("BlogDetail", { blog })}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: blog?.image }} 
        style={styles.blogImage}
        resizeMode="cover"
      />
      <View style={styles.blogContent}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{blog?.categoryId?.name?.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>{blog?.title}</Text>
        <Text style={styles.blogPreview} numberOfLines={2}>
          {blog?.preview}
        </Text>
        <View style={styles.blogMeta}>
          <View style={styles.authorInfo}>
            <Image 
              source={{ uri: blog?.authorId?.avatar }} 
              style={styles.authorAvatar}
              // defaultSource={require("../../assets/default-avatar.png")}
            />
            <View>
              <Text style={styles.blogAuthor}>{blog?.authorId?.fullName}</Text>
              <View style={styles.readTimeContainer}>
                <MaterialIcons name="access-time" size={12} color="#95A5A6" />
                <Text style={styles.blogDate}>{formatDateTime(blog?.createdAt)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.readMoreButton}>
            <Ionicons name="arrow-forward" size={20} color="#FF6B6B" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết & Chia sẻ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {blogPosts?.map(renderBlogPost)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  blogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  blogImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  blogContent: {
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
    lineHeight: 28,
  },
  blogPreview: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 16,
    lineHeight: 20,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  blogAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 4,
  },
  readMoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 