import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { SupabaseService } from '../services/supabaseService';

interface ProfilePictureProps {
  userId: string;
  imageUrl?: string;
  size?: number;
  onImageUpdate?: (newUrl: string) => void;
  editable?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userId,
  imageUrl,
  size = 80,
  onImageUpdate,
  editable = true,
}) => {
  console.log('🔄 ProfilePicture: Rendering with imageUrl:', imageUrl);
  const theme = useColorScheme() ?? 'light';
  const safeTheme = theme === 'light' || theme === 'dark' ? theme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [isUploading, setIsUploading] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl);
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    console.log('🔄 ProfilePicture: imageUrl changed:', imageUrl);
    setLocalImageUrl(imageUrl);
    
    // Test if the URL is accessible
    if (imageUrl) {
      console.log('🔧 ProfilePicture: Testing URL accessibility:', imageUrl);
      fetch(imageUrl, { method: 'HEAD' })
        .then(response => {
          console.log('✅ ProfilePicture: URL is accessible, status:', response.status);
        })
        .catch(error => {
          console.error('❌ ProfilePicture: URL is not accessible:', error);
        });
    }
  }, [imageUrl]);

  const handlePressIn = () => {
    if (!editable) return;
    
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!editable) return;
    
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const requestPermissions = async (forCamera: boolean = false) => {
    if (Platform.OS !== 'web') {
      let permissionResult;
      
      if (forCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      
      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          `Please grant ${forCamera ? 'camera' : 'camera roll'} permissions to ${forCamera ? 'take a photo' : 'upload a profile picture'}.`,
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    if (!editable) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        maxWidth: 512,
        maxHeight: 512,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    if (!editable) return;

    const hasPermission = await requestPermissions(true);
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        maxWidth: 512,
        maxHeight: 512,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);
      startPulseAnimation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newImageUrl = await SupabaseService.uploadProfilePicture(userId, uri);
      
      if (newImageUrl) {
        setLocalImageUrl(newImageUrl);
        onImageUpdate?.(newImageUrl);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUploading(false);
      stopPulseAnimation();
    }
  };

  const showImageOptions = () => {
    if (!editable) return;

    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        ...(localImageUrl ? [{ text: 'Remove Picture', style: 'destructive', onPress: removeImage }] : []),
      ]
    );
  };

  const removeImage = async () => {
    try {
      console.log('🔧 ProfilePicture: Starting image removal...');
      setIsUploading(true);
      await SupabaseService.removeProfilePicture(userId);
      console.log('✅ ProfilePicture: Image removed successfully');
      setLocalImageUrl(undefined);
      onImageUpdate?.('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('❌ ProfilePicture: Error removing image:', error);
      Alert.alert('Error', 'Failed to remove image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={showImageOptions}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={editable ? 0.8 : 1}
        disabled={!editable || isUploading}
      >
                 {localImageUrl ? (
           <Image
             source={{ 
               uri: localImageUrl,
               headers: {
                 'Cache-Control': 'no-cache'
               }
             }}
             style={imageStyle}
             contentFit="cover"
             placeholder={require('../assets/images/adaptive-icon.png')}
             transition={200}
             onError={(error) => {
               console.error('❌ ProfilePicture: Image failed to load:', error);
               console.error('❌ ProfilePicture: Failed URL:', localImageUrl);
               console.error('❌ ProfilePicture: Error details:', JSON.stringify(error, null, 2));
             }}
             onLoad={() => {
               console.log('✅ ProfilePicture: Image loaded successfully:', localImageUrl);
             }}
           />
         ) : (
          <View style={[styles.placeholder, containerStyle, { backgroundColor: themeColors.backgroundTertiary }]}>
            <Ionicons name="person" size={size * 0.4} color={themeColors.textSecondary} />
          </View>
        )}

        {isUploading && (
          <Animated.View 
            style={[
              styles.uploadOverlay, 
              containerStyle,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.uploadContent}>
              <Ionicons name="cloud-upload" size={24} color={themeColors.text} />
              <Text style={[styles.uploadText, { color: themeColors.text }]}>
                Uploading...
              </Text>
            </View>
          </Animated.View>
        )}

        {editable && !isUploading && (
          <View style={[styles.editButton, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="camera" size={12} color={themeColors.text} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'dashed',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ProfilePicture;
