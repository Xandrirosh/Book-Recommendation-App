import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from '../../assets/styles/home.styles'
import { API_BASE_URL } from '../../constants/api'
import { Image } from "expo-image"
import Ionicons from '@expo/vector-icons/Ionicons'
import { formatPublishDate } from '../../lib/utils'
import COLORS from '../../constants/colors'
import Loader from '../../components/Loader'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const Home = () => {
  const { token, logout } = useAuthStore()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1)
    }
  }

  const renderItem = ({ item }) => {
    const avatarUrl = item.user.profileImage.replace('/svg?', '/png?')

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookHeader}>
          <View style={styles.userInfo}>
            {item.user.profileImage ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color="#ccc" />
            )}
            <Text style={styles.username}>{item.user.username}</Text>
          </View>
        </View>
        <View style={styles.bookImageContainer}>
          <Image source={{ uri: item.image }} style={styles.bookImage} contentFit="cover" />
        </View>
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <View style={styles.ratingContainer}>{renderRatingPicker(item.rating)}</View>
          <Text style={styles.caption}>{item.caption}</Text>
          <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
        </View>
      </View>
    )
  }

  const renderRatingPicker = (rating) => {
    const ratings = [];
    for (let i = 1; i <= 5; i++) {
      ratings.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={30}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      )
    }
    return <View style={styles.ratingContainer}>{ratings}</View>;
  }

  const fetchBooks = async (pageNumber = 1, refresh = (false)) => {
    try {
      if (refresh) setRefreshing(true)
      else if (pageNumber === 1) setLoading(true)

      const response = await fetch(`${API_BASE_URL}/books/all-books?page=${pageNumber}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to fetch books')

      // setBooks((prevBooks) => [...prevBooks, ...data.books]);

      const uniqueBooks =
        refresh || pageNumber === 1
          ? data.books
          : Array.from(new Set([...books, ...data.books].map((book) => book._id))).map((id) =>
            [...books, ...data.books].find((book) => book._id === id)
          );

      setBooks(uniqueBooks);

      setHasMore(pageNumber < data.totalPages)
      setPage(pageNumber)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      if (refresh) {
        await sleep(800)
        setRefreshing(false)
      } else setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  if (loading) return <Loader />;
  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm 🐛</Text>
            <Text style={styles.headerSubtitle}>Discover great reads from the community👇</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
          </View>
        }
      />
      <TouchableOpacity onPress={logout}>
        <Text>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Home