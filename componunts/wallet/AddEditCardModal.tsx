// components/AddEditCardModal.tsx
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import { CARD_THEMES } from '../../constants/constant';
import type { ModalProps } from '../../types';

export const AddEditCardModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, initialData }:ModalProps) => {
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
      //data hoy to bhro
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
      //edit hoy to khaali karo
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
      mediaTypes:['images'], // images, videos, all
      allowsEditing: true, // true , false crop na option mate 
      aspect: [16, 10], //[1,1] [4,3] [16,9]
      quality: 1, // o to 1 best quality
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
    // જો ફોટો અપલોડ કર્યો હોય તો બાકીની વિગત ઓપ્શનલ રાખી શકાય, પણ અત્યારે આપણે રિક્વાયર્ડ રાખીએ
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
      <Pressable className="flex-1 bg-black/50 justify-center items-center p-4" onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full max-w-sm">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-2xl shadow-xl w-full max-h-[90%]">
              <View className="p-6 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">{initialData ? 'Edit Card' : 'Add New Card'}</Text>
              </View>

              <View className="p-6">
                {/* 3. ઈમેજ પિકર બટન અને પ્રિવ્યુ */}
                <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-gray-100 rounded-xl mb-4 justify-center items-center overflow-hidden border border-gray-300 border-dashed">
                  {formData.imageUri ? (
                    <Image source={{ uri: formData.imageUri }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="items-center">
                      <Text className="text-4xl text-gray-400 mb-2">📷</Text>
                      <Text className="text-gray-500 font-medium">Tap to Upload Card Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TextInput className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 mb-2" placeholder="Card Type (e.g. Aadhar)" value={formData.type} onChangeText={(text) => updateField('type', text)} />
                <TextInput className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 mb-2" placeholder="Issuer" value={formData.issuer} onChangeText={(text) => updateField('issuer', text)} />
                <TextInput className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 mb-2" placeholder="Card Number" value={formData.number} onChangeText={(text) => updateField('number', text)} />
                <TextInput className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 mb-2" placeholder="Name" value={formData.name} onChangeText={(text) => updateField('name', text)} />
                
                <View className="mt-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Card Color (Behind Photo)</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {CARD_THEMES.map(theme => (
                      <TouchableOpacity 
                        key={theme.name} 
                        onPress={() => handleThemeChange(theme)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 ${formData.themeName === theme.name ? 'border-blue-500' : 'border-transparent'}`}
                      >
                         <LinearGradient colors={theme.gradientColors as [string, string]} className="w-full h-full" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row justify-end gap-3 pt-6">
                  <TouchableOpacity onPress={onClose} className="px-6 py-2 rounded-lg bg-gray-200"><Text className="font-semibold text-gray-700">Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleSubmit} className="px-6 py-2 rounded-lg bg-blue-500"><Text className="font-semibold text-white">Save</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};