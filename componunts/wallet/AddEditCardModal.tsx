import * as ImagePicker from 'expo-image-picker';
// import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView, // અહી ScrollView ઉમેર્યું છે
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { CARD_THEMES } from '../../constants/constant';
import type { ModalProps } from '../../types';

export const AddEditCardModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, initialData }: ModalProps) => {
  const [formData, setFormData] = useState({
    type: '',
    issuer: '',
    number: '',
    name: '',
    emoji: '',
    gradientColors: CARD_THEMES[0].gradientColors,
    textColor: CARD_THEMES[0].textColor,
    themeName: CARD_THEMES[0].name,
    imageUri: '',
  });

  useEffect(() => {
    if (initialData) {
      const theme = CARD_THEMES.find(t =>
        JSON.stringify(t.gradientColors) === JSON.stringify(initialData.gradientColors)
      ) || CARD_THEMES[0];
      
      setFormData({
        type: initialData.type,
        issuer: initialData.issuer,
        number: initialData.number,
        name: initialData.name,
        emoji: initialData.emoji,
        gradientColors: initialData.gradientColors,
        textColor: initialData.textColor,
        themeName: theme.name,
        imageUri: initialData.imageUri || '',
      });
    } else {
      setFormData({
        type: '', issuer: '', number: '', name: '', emoji: '',
        gradientColors: CARD_THEMES[0].gradientColors,
        textColor: CARD_THEMES[0].textColor,
        themeName: CARD_THEMES[0].name,
        imageUri: '',
      });
    }
  }, [initialData, isOpen]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, imageUri: result.assets[0].uri }));
    }
  };

  const handleThemeChange = (theme: typeof CARD_THEMES[0]) => {
    setFormData(prev => ({
      ...prev,
      gradientColors: theme.gradientColors,
      textColor: theme.textColor,
      themeName: theme.name
    }));
  };

  const handleSubmit = () => {
    if (!formData.type) {
      Alert.alert("Missing Information", "Please enter at least the Card Type.");
      return;
    }
    const { themeName, ...cardDetails } = formData;
    // @ts-ignore
    onSave(cardDetails);
  };

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
      {/* 1. KeyboardAvoidingView ને Main Container બનાવ્યું */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 1}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50 justify-center items-center p-4" onPress={onClose}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            
            {/* 2. અહી મહત્તમ ઊંચાઈ આપી દીધી */}
            <View className="bg-white rounded-2xl shadow-xl w-full max-h-[85%] min-h-[60%]">
              
              <View className="p-5 border-b border-gray-200 bg-gray-50">
                <Text className="text-xl font-bold text-gray-900">{initialData ? 'Edit Card' : 'Add New Card'}</Text>
              </View>

              {/* 3. ScrollView ઉમેર્યું જેથી કીબોર્ડ આવે તો સ્ક્રોલ થાય */}
              <ScrollView className="p-5 flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                
                {/* Image Picker */}
                <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-gray-100 rounded-xl mb-6 justify-center items-center overflow-hidden border border-gray-300 border-dashed">
                  {formData.imageUri ? (
                    <Image source={{ uri: formData.imageUri }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="items-center">
                      <Text className="text-4xl text-gray-400 mb-2">📷</Text>
                      <Text className="text-gray-500 font-medium">Tap to Upload Card Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* 4. Inputs માં Placeholder અને PlaceholderTextColor ઉમેર્યા */}
                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-500 text-xs font-semibold ml-1 mb-1">CARD TYPE</Text>
                        <TextInput 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base" 
                            placeholder="e.g. Aadhar Card, Visa, RC Book" 
                            placeholderTextColor="#9CA3AF"
                            value={formData.type} 
                            onChangeText={(text) => updateField('type', text)} 
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-xs font-semibold ml-1 mb-1">ISSUER (Optional)</Text>
                        <TextInput 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base" 
                            placeholder="e.g. Govt of India, HDFC" 
                            placeholderTextColor="#9CA3AF"
                            value={formData.issuer} 
                            onChangeText={(text) => updateField('issuer', text)} 
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-xs font-semibold ml-1 mb-1">CARD NUMBER</Text>
                        <TextInput 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base" 
                            placeholder="XXXX XXXX XXXX" 
                            placeholderTextColor="#9CA3AF"
                            value={formData.number} 
                            onChangeText={(text) => updateField('number', text)} 
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-xs font-semibold ml-1 mb-1">NAME ON CARD</Text>
                        <TextInput 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base" 
                            placeholder="Your Name" 
                            placeholderTextColor="#9CA3AF"
                            value={formData.name} 
                            onChangeText={(text) => updateField('name', text)} 
                        />
                    </View>
                </View>
                
                {/* <View className="mt-6 mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-3">Card Color (Behind Photo)</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {CARD_THEMES.map(theme => (
                      <TouchableOpacity 
                        key={theme.name} 
                        onPress={() => handleThemeChange(theme)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 ${formData.themeName === theme.name ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                      >
                          <LinearGradient colors={theme.gradientColors as [string, string]} className="w-full h-full" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View> */}

                {/* નીચે થોડી જગ્યા જેથી બટન સ્ક્રોલ કરીને જોઈ શકાય */}
                <View className="h-4" />
              </ScrollView>

              {/* Footer Buttons (Fixed at Bottom) */}
              <View className="p-5 border-t border-gray-200 flex-row gap-3 bg-gray-50">
                  <TouchableOpacity onPress={onClose} className="flex-1 py-3.5 rounded-xl bg-white border border-gray-300">
                      <Text className="font-semibold text-gray-700 text-center">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSubmit} className="flex-1 py-3.5 rounded-xl bg-black shadow-sm">
                      <Text className="font-semibold text-white text-center">Save Card</Text>
                  </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};