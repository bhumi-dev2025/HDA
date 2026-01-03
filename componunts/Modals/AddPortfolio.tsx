import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  Image, 
  ScrollView, 
  Platform,
  Keyboard, // <--- Import
  TouchableOpacity
} from 'react-native';

interface PortfolioModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AddPortfolioModal = ({ isVisible, onClose }: PortfolioModalProps) => {
  const [link, setLink] = useState('');
  const showPreview = link.length > 5; 
  
  // Keyboard Logic
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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

        {/* Keyboard Adjustments */}
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
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 mb-6 bg-white">
                    <TextInput 
                        className="flex-1 text-base text-gray-800 p-0"
                        placeholder="Enter portfolio link"
                        placeholderTextColor="#9CA3AF"
                        value={link}
                        onChangeText={setLink}
                        autoCapitalize="none"
                    />
                    <Pressable onPress={() => setLink('https://dribbble.com')} className="ml-2">
                        <Text className="text-xs font-bold text-gray-900 tracking-wider">PASTE</Text>
                    </Pressable>
                </View>

                {showPreview && (
                <View className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <Image 
                        source={{ uri: 'https://cdn.dribbble.com/users/123/screenshots/456/cover.png' }} 
                        className="w-full h-36 bg-gray-100"
                        resizeMode="cover"
                    />
                    <View className="p-4">
                        <View className="flex-row items-center mb-1">
                            <View className="w-5 h-5 bg-[#ea4c89] rounded-full mr-2 items-center justify-center">
                                <Text className="text-white text-[10px] font-bold">Dr</Text>
                            </View>
                            <Text className="text-gray-900 font-bold text-base">Dribbble</Text>
                        </View>
                        <Text className="text-gray-500 text-sm mt-1">
                            Design for people not for Machine
                        </Text>
                    </View>
                </View>
                )}
            </ScrollView>
            <View className='p-5 pt-2 bottom-10'>
                          <TouchableOpacity
                            className="bg-black w-full p-4 rounded-2xl items-center mt-auto shadow-lg"
                            onPress={onClose} // <--- અહિયાં handleSave ફંક્શન મુક્યું
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