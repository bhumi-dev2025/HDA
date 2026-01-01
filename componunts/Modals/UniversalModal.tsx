import React from 'react';
import { 
  Modal, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  Pressable 
} from 'react-native';

interface UniversalModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const UniversalModal = ({ isVisible, onClose, children }: UniversalModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      > */}
        {/* 1. Backdrop (પાછળનું કાળું બેકગ્રાઉન્ડ - Absolute) */}
        {/* આ લેયર સૌથી પાછળ રહેશે અને ક્લિક કરવાથી મોડલ બંધ થશે */}
        <Pressable 
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/40" 
          onPress={onClose} 
        />

        {/* 2. Content Wrapper */}
        {/* pointerEvents="box-none" નો અર્થ છે કે ખાલી જગ્યામાં ક્લિક આરપાર જશે, પણ કન્ટેન્ટ પર અટકશે */}
        <View className="flex-1 justify-end" pointerEvents="box-none">
          
          {/* 3. Main White Card */}
          {/* અહીં આપણે કોઈ Pressable નથી વાપર્યું, એટલે ScrollView કે Ruler બરાબર ચાલશે */}
          <View className="bg-white rounded-t-[40px] p-6 pb-10 w-full items-center shadow-2xl min-h-[50%]">
            
            {/* Handle Bar */}
            <View className="w-12 h-1 bg-gray-300 rounded-full mb-14" />
            
            {children}

          </View>
        </View>
      {/* </KeyboardAvoidingView> */}
    </Modal>
  );
};