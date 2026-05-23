import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
      Alert.alert('Sorry', 'We need camera roll permissions!');
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

  const inputStyle = {
    width: '100%' as const,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  };

  const labelStyle = {
    color: '#636366',
    fontSize: 11,
    fontWeight: '600' as const,
    marginLeft: 4,
    marginBottom: 6,
  };

  return (
    <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 1}
        style={{ flex: 1 }}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 16 }} onPress={onClose}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={{ backgroundColor: '#19181B', borderRadius: 20, width: '100%', maxHeight: '85%', minHeight: '60%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>

              {/* Header */}
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#2B2B2B' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>
                  {initialData ? 'Edit Card' : 'Add New Card'}
                </Text>
              </View>

              {/* Scrollable Content */}
              <ScrollView style={{ padding: 20, flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                {/* Image Picker */}
                <TouchableOpacity onPress={pickImage} style={{ width: '100%', height: 150, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' }}>
                  {formData.imageUri ? (
                    <Image source={{ uri: formData.imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 36, marginBottom: 8 }}>📷</Text>
                      <Text style={{ color: '#636366', fontWeight: '500' }}>Tap to Upload Card Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={labelStyle}>CARD TYPE</Text>
                <TextInput style={inputStyle} placeholder="e.g. Aadhar Card, Visa, RC Book" placeholderTextColor="#636366" value={formData.type} onChangeText={(t) => updateField('type', t)} />

                <Text style={labelStyle}>ISSUER (Optional)</Text>
                <TextInput style={inputStyle} placeholder="e.g. Govt of India, HDFC" placeholderTextColor="#636366" value={formData.issuer} onChangeText={(t) => updateField('issuer', t)} />

                <Text style={labelStyle}>CARD NUMBER</Text>
                <TextInput style={inputStyle} placeholder="XXXX XXXX XXXX" placeholderTextColor="#636366" value={formData.number} onChangeText={(t) => updateField('number', t)} />

                <Text style={labelStyle}>NAME ON CARD</Text>
                <TextInput style={inputStyle} placeholder="Your Name" placeholderTextColor="#636366" value={formData.name} onChangeText={(t) => updateField('name', t)} />

              </ScrollView>

              {/* Footer Buttons */}
              <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#2B2B2B', flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={onClose} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Save Card</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};
