import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, Pressable, Image, ScrollView, 
  Platform, Keyboard, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { getLinkPreview } from 'link-preview-js';

interface PortfolioModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (link: string, title: string, image: string) => void; 
}

export const AddPortfolioModal = ({ isVisible, onClose, onSave }: PortfolioModalProps) => {
  const [link, setLink] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard Logic
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // --- Helper: Domain Name લાવવા માટે (e.g. youtube.com) ---
  const getDomainName = (url: string) => {
    try {
        const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        return domain;
    } catch (e) {
        return 'Website';
    }
  };

  // --- 1. YouTube Thumbnail Logic ---
  const getYouTubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
      : null;
  };

  // --- 2. Link Preview Function ---
  const handleLinkChange = async (text: string) => {
    setLink(text);
    if (text.length > 5 && (text.startsWith('http') || text.startsWith('www'))) {
        setLoading(true);
        try {
            const data = await getLinkPreview(text);
            setPreviewData(data);
        } catch (error) {
            console.log("Preview Error (using fallback):", error);
        } finally {
            setLoading(false);
        }
    } else {
        setPreviewData(null);
    }
  };

  // --- 3. Main Smart Image Logic (NEW: Microlink) ---
  const getSmartImage = () => {
     // Priority 1: લાઈબ્રેરીને સાચો ફોટો મળે તો તે વાપરો
     if (previewData?.images && previewData.images.length > 0) {
        return previewData.images[0];
     }
     
     // Priority 2: YouTube હોય તો થમ્બનેલ
     if (link.includes('youtube.com') || link.includes('youtu.be')) {
        const yt = getYouTubeThumbnail(link);
        if (yt) return yt;
     }

     // Priority 3: બ્રાન્ડ લોગો (Optional)
     if (link.includes('dribbble.com')) return 'https://cdn.dribbble.com/assets/dribbble-ball-icon-4e54c54ee8fcd27209548b31cf0cd64495619138038568f9962779185e94b22c.png';
     if (link.includes('figma.com')) return 'https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b94e1ba1617e09056a969840-1024x1024.png?w=670&h=670&q=75&fit=max&auto=format';
     if (link.includes('github.com')) return 'https://github.blog/wp-content/uploads/2023/01/GitHub-Mark-1200x630-1.png';

     // Priority 4: (IMP) NEW SCREENSHOT TRICK (Microlink) 📸
     // આ સર્વિસ ફાસ્ટ છે અને "WordPress" નો લોગો નહિ બતાવે
     if (link.length > 5) {
        return `https://api.microlink.io/?url=${encodeURIComponent(link)}&screenshot=true&meta=false&embed=screenshot.url`;
     }
     
     return 'https://via.placeholder.com/300';
  };

  const handlePressSave = () => {
    if(link.length > 0) {
       const finalImage = getSmartImage();
       const title = previewData?.title ||getDomainName(link)|| 'Portfolio Link';
       
       onSave(link, title, finalImage);
       
       setLink('');
       setPreviewData(null);
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
        <Pressable 
            className="absolute top-0 bottom-0 left-0 right-0 bg-black/50" 
            onPress={onClose} 
        />

        <View 
            className="flex-1 justify-end"
            style={{ paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0 }} 
        >
          <View 
            className="bg-white rounded-t-[32px] w-full max-h-[85%] shadow-2xl overflow-hidden"
            style={{ marginBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
          >
            <View className="items-center pt-4 pb-2">
               <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            <Text className="text-xl font-bold text-center text-gray-900 mb-6 mt-2">
              Add Portfolio
            </Text>

            <ScrollView 
                className="px-6" 
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Input Field (UI Fix: Matching Design) */}
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 mb-6 bg-white">
                    <TextInput 
                        className="flex-1 text-base text-gray-800 p-0"
                        placeholder="Paste link (https://...)"
                        placeholderTextColor="#9CA3AF"
                        value={link}
                        onChangeText={handleLinkChange} 
                        autoCapitalize="none"
                    />
                    {/* PASTE Text Button inside Input */}
                    {link.length === 0 && (
                        <TouchableOpacity onPress={() => {/* Logic to paste if needed */}}>
                             <Text className="text-gray-400 text-xs font-bold ml-2">PASTE</Text>
                        </TouchableOpacity>
                    )}
                    {loading && <ActivityIndicator size="small" color="#000" />}
                </View>

                {/* --- Dynamic Preview Section --- */}
                {(previewData || link.length > 10) && (
                <View className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    
                    {/* Image logic applied here */}
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
                             {previewData?.title ||previewData?.description || 'Portfolio Link'|| link}
                        </Text>
                    </View>
                </View>
                )}
            </ScrollView>

            <View className='p-5 pt-2 bottom-10'>
                <TouchableOpacity
                className="bg-black w-full p-4 rounded-2xl items-center mt-auto shadow-lg"
                onPress={handlePressSave}
                >
                <Text className="text-white font-bold text-lg">Save</Text>
                </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
};