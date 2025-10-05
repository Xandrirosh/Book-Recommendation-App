import { View, Text, Platform, ScrollView, KeyboardAvoidingView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import styles from '../../assets/styles/create.styles'
import COLORS from '../../constants/colors'
import IonIcons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { useAuthStore } from '../../store/authStore'
import { API_BASE_URL } from '../../constants/api'

const Create = () => {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [rating, setRating] = useState(3)
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  const { token } = useAuthStore()

  const router = useRouter()

  const pickImage = async () => {
    try {
      // request permission and pick image from gallery
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
          return;
        }
      }

      //launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, //lower quality for faster upload and smaller base64
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        //if base64 is available directly use it, otherwise convert
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // convert to base64 if not provided
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("ImagePicker Error: ", error);
      Alert.alert('Error', 'An error occurred while picking the image. Please try again.');
    }
  }

  const handleSubmit = async () => {
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert('Missing Fields', 'Please fill in all fields and select an image.');
      return;
    }
    try {
      setLoading(true);

      // get file extension from uri or default to jpg
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : 'image/jpeg';

      const imageDataUri = `data:${imageType};base64,${imageBase64}`;

      const response = await fetch(`${API_BASE_URL}/books/create-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create book recommendation');
      }
      Alert.alert('Success', 'Book recommendation created successfully!');
      //reset form
      setTitle('');
      setCaption('');
      setRating(3);
      setImage(null);
      setImageBase64(null);
      //navigate back to home or feed
      router.push('/(tabs)');


    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while creating the book recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const renderRatingPicker = () => {
    const ratings = [];
    for (let i = 1; i <= 5; i++) {
      ratings.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <IonIcons
            name={i <= rating ? "star" : "star-outline"}
            size={30}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      )
    }
    return <View style={styles.ratingContainer}>{ratings}</View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}
        style={styles.scrollView}>

        <View style={styles.card}>
          {/*Header*/}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>Share your favorite books with the community!</Text>
          </View>

          {/*Form*/}
          <View style={styles.form}>
            {/* Title Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}> Book Title</Text>
              <View style={styles.inputContainer}>
                <IonIcons name="book-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>
            {/* rating */}
            <View style={styles.formGroup}>
              <Text style={styles.label}> Your Rating</Text>
              {renderRatingPicker()}
            </View>
            {/* image*/}
            <View style={styles.formGroup}>
              <Text style={styles.label}> Book Cover Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <IonIcons name="image-outline" size={50} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Tap to select an image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {/* caption */}
            <View style={styles.formGroup}>
              <Text style={styles.label}> Caption</Text>
              <TextInput
                style={styles.textArea}
                value={caption}
                onChangeText={setCaption}
                placeholder="Write a brief review or comment about the book..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
              />
            </View>
            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {
                loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <IonIcons
                      name="cloud-upload-outline"
                      size={20}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Share</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Create