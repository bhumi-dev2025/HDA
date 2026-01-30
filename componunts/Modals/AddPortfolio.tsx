import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  Image, 
  ScrollView, 
  Platform, 
  Keyboard, 
  TouchableOpacity, 
  ActivityIndicator,
  PanResponder,
  Animated,
  Dimensions,
  Pressable
} from 'react-native';
import { getLinkPreview } from 'link-preview-js';
import * as Clipboard from 'expo-clipboard';
import {PortfolioModalProps} from '../../types'

const { height } = Dimensions.get('window');

export const AddPortfolioModal:React.FC<PortfolioModalProps> = ({ isVisible, onClose, onSave }: PortfolioModalProps) => {
  const [link, setLink] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // --- Animation & Drag Logic Start ---
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      panY.setValue(0);
    }
  }, [isVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > height * 0.2) {
          onClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;
  // --- Animation Logic End ---

  // Keyboard Handling
  useEffect(() => {
    const showSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSubscription.remove(); hideSubscription.remove(); };
  }, []);

  // --- Helpers ---
  const getDomainName = (url: string) => {
    try {
        const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        return domain;
    } catch (e) { return 'Website'; }
  };

  const getYouTubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg` : null;
  };

  const handleLinkChange = async (text: string) => {
    setLink(text);
    if (text.length > 5 && (text.startsWith('http') || text.startsWith('www'))) {
        setLoading(true);
        try {
            const data = await getLinkPreview(text);
            setPreviewData(data);
        } catch (error) {
            console.log("Preview Error:", error);
        } finally {
            setLoading(false);
        }
    } else {
        setPreviewData(null);
    }
  };

  const getSmartImage = () => {
     if (previewData?.images && previewData.images.length > 0) return previewData.images[0];
     if (link.includes('youtube.com') || link.includes('youtu.be')) {
        const yt = getYouTubeThumbnail(link);
        if (yt) return yt;
     }
     if (link.includes('dribbble.com')) return 'https://cdn.dribbble.com/assets/dribbble-ball-icon-4e54c54ee8fcd27209548b31cf0cd64495619138038568f9962779185e94b22c.png';
     if (link.includes('figma.com')) return 'https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b94e1ba1617e09056a969840-1024x1024.png?w=670&h=670&q=75&fit=max&auto=format';
     if (link.includes('github.com')) return 'https://github.blog/wp-content/uploads/2023/01/GitHub-Mark-1200x630-1.png';
     if (link.length > 5) return `https://api.microlink.io/?url=${encodeURIComponent(link)}&screenshot=true&meta=false&embed=screenshot.url`;
     return 'https://via.placeholder.com/300';
  };

  const handlePressSave = () => {
    if(link.length > 0) {
       const finalImage = getSmartImage();
       const title = previewData?.title || getDomainName(link) || 'Portfolio Link';
       onSave(link, title, finalImage);
       setLink('');
       setPreviewData(null);
    }
  };
  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      handleLinkChange(text); // લિંક સેટ કરો અને પ્રિવ્યૂ ફેચ કરો
    }
  };

  const previewImageUri = getSmartImage();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
        <View className="flex-1">
      {/* 1. Backdrop */}
      <Pressable 
        className="absolute top-0 bottom-0 left-0 right-0 bg-black/40" 
        onPress={onClose} 
      />

      {/* 2. Main Content Wrapper */}
      <View className="flex-1 justify-end" pointerEvents="box-none">
        
        <Animated.View 
          style={{ 
            transform: [{ translateY: panY }],
            // Android padding fix
            paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0, 
            // iOS margin fix
            marginBottom: Platform.OS === 'ios' ? keyboardHeight : 0 
          }}
          className="bg-white rounded-t-[40px] w-full max-h-[80%] shadow-2xl overflow-hidden mt-20"
        >
          
          {/* --- 3. DRAG HANDLE --- */}
          {/* Only this area is draggable */}
          <View 
            {...panResponder.panHandlers} 
            className="w-full h-14 items-center justify-center bg-white z-50 absolute top-0 border-b border-transparent"
          >
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </View>
          {/* ---------------------- */}

          {/* 4. Content Area */}
          <View className="pt-14 pb-8 px-6 h-full">
             
            <Text className="text-xl font-bold text-center text-gray-900 mb-6">
              Add Portfolio
            </Text>

            <ScrollView 
                className="w-full flex-1" 
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Input Field */}
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 mb-6 bg-white w-full">
                    <TextInput 
                        className="flex-1 text-base text-gray-800 p-2 no-underline"
                        placeholder="Paste link (https://...)"
                        placeholderTextColor="#9CA3AF"
                        value={link}
                        onChangeText={handleLinkChange} 
                        autoCapitalize="none"
                    />
                    {link.length === 0 && (
                        <TouchableOpacity onPress={handlePaste}>
                            <Text className="text-gray-400 text-xs font-bold ml-2">PASTE</Text>
                        </TouchableOpacity>
                    )}
                    {loading && <ActivityIndicator size="small" color="#000" />}
                </View>

                {/* Preview Section */}
                {(previewData || link.length > 10) && (
                <View className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <Image 
                        source={{ uri: previewImageUri || 'https://via.placeholder.com/300' }} 
                        className="w-full h-36 bg-gray-100"
                        resizeMode="cover"
                    />
                    <View className="p-4 bg-[#FAFAFA]">
                        <View className="flex-row items-center mb-1">
                            {previewData?.favicons?.[0] ? (
                                <Image source={{ uri: previewData.favicons[0] }} className="w-5 h-5 rounded-full mr-2" />
                            ) : (
                                <View className="w-5 h-5 rounded-full bg-gray-200 mr-2 items-center justify-center"><Text className="text-[10px]">📑</Text></View>
                            )}
                            <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                                {previewData?.siteName || getDomainName(link)}
                            </Text>
                        </View>
                        <Text className="text-gray-900 font-semibold text-sm mt-1" numberOfLines={2}>
                             {previewData?.title || previewData?.description || 'Portfolio Link' || link}
                        </Text>
                    </View>
                </View>
                )}
            </ScrollView>

            <TouchableOpacity
                disabled={link.length === 0} // લિંક ખાલી હોય તો બટન ડિસેબલ
                className={`w-full p-4 rounded-2xl items-center mt-2 mb-2 ${
                    link.length > 0 ? 'bg-black' : 'bg-gray-300' // કલર ચેન્જ લોજીક
                }`}
                onPress={handlePressSave}
            >
                <Text className="text-white font-bold text-lg">Save</Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      </View>
      </View>
    </Modal>
  );
};