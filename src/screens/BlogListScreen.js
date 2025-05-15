import React from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';

export default function BlogListScreen({ navigation }) {
  // Mock data for blog posts
  const blogPosts = [
    {
      id: 1,
      title: "Những điều cần biết trước khi hiến máu",
      author: "BS. Nguyễn Văn A",
      date: "22/02/2024",
      image: "https://vienhuyethoc.vn/wp-content/uploads/2021/07/luu-y-truoc-va-sau-khi-hien-mau-1-1024x628.jpg",
      readTime: "5 phút",
      preview: "Hiến máu là một hành động cao cả, giúp cứu sống nhiều người. Tuy nhiên, trước khi hiến máu, bạn cần lưu ý một số điều quan trọng...",
    },
    {
      id: 2,
      title: "Chế độ ăn uống sau khi hiến máu",
      author: "BS. Trần Thị B",
      date: "20/02/2024",
      image: "https://cdn.tgdd.vn/Files/2022/06/13/1439533/can-luu-y-gi-truoc-va-sau-khi-hien-mau-tinh-nguyen-202206131418440901.jpg",
      readTime: "3 phút",
      preview: "Sau khi hiến máu, cơ thể cần được bổ sung đầy đủ dinh dưỡng để phục hồi. Hãy tìm hiểu về chế độ ăn uống phù hợp...",
    },
    {
      id: 3,
      title: "Tầm quan trọng của việc hiến máu định kỳ",
      author: "BS. Lê Văn C",
      date: "18/02/2024",
      image: "https://image.thanhnien.vn/w2048/Uploaded/2024/zxaijr/2024_01_07/hien-mau-8-1-5752.jpg",
      readTime: "4 phút",
      preview: "Hiến máu định kỳ không chỉ giúp cứu người mà còn có lợi cho sức khỏe của người hiến. Cùng tìm hiểu về những lợi ích này...",
    },
    {
      id: 4,
      title: "Các nhóm máu hiếm và nhu cầu hiến máu",
      author: "BS. Phạm Thị D",
      date: "15/02/2024",
      image: "https://cdn.tuoitre.vn/471584752817336320/2024/2/7/hien-mau-17072331073091459604089.jpg",
      readTime: "6 phút",
      preview: "Một số nhóm máu rất hiếm gặp và luôn trong tình trạng thiếu hụt. Hãy tìm hiểu về các nhóm máu hiếm và tầm quan trọng của chúng...",
    },
  ];

  const renderBlogPost = (post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.blogCard}
      onPress={() => navigation.navigate("BlogDetail", { blog: post })}
    >
      <Image source={{ uri: post.image }} style={styles.blogImage} />
      <View style={styles.blogContent}>
        <Text style={styles.blogTitle}>{post.title}</Text>
        <Text style={styles.blogPreview} numberOfLines={2}>
          {post.preview}
        </Text>
        <View style={styles.blogMeta}>
          <View style={styles.authorDate}>
            <Text style={styles.blogAuthor}>{post.author}</Text>
            <Text style={styles.blogDate}>{post.date}</Text>
          </View>
          <View style={styles.readTimeContainer}>
            <MaterialIcons name="access-time" size={12} color="#95A5A6" />
            <Text style={styles.readTime}>{post.readTime}</Text>
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

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {blogPosts.map(renderBlogPost)}
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
    padding: 16,
  },
  blogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  blogImage: {
    width: '100%',
    height: 200,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  blogPreview: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 12,
    lineHeight: 20,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogAuthor: {
    fontSize: 14,
    color: '#2D3436',
    marginRight: 8,
  },
  blogDate: {
    fontSize: 14,
    color: '#95A5A6',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 14,
    color: '#95A5A6',
    marginLeft: 4,
  },
}); 