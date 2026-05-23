// components/wallet/Header.tsx
import React from 'react';
import { Text, TouchableOpacity, View,Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PlusIcon } from './Icons'; // Icon ઈમ્પોર્ટ કરો

// અહી આપણે Type વ્યાખ્યાયિત કરીએ છીએ કે onAddPress એક ફંક્શન હશે
interface HeaderProps {
  onAddPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddPress }) => {
  const router = useRouter();
  
  return (
      <View className="flex-row items-center justify-between p-5 pt-2">
        {/* Left: Back Button */}
        <TouchableOpacity 
            onPress={() => router.back()} 
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: 8,
              borderRadius: 50,
            }}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        
        {/* Center: Title */}
        <Text className="text-2xl text-center font-bold text-white absolute left-0 right-0 -z-10">
          Wallet
        </Text>
        
        {/* Right: Add Button */}
        <TouchableOpacity 
          onPress={() => Alert.alert("Limit Reached", "You can only edit the existing 6 cards.")}
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: 8, borderRadius: 50, opacity: 0.5 }}
        >
           <PlusIcon className="w-6 h-6 text-white" />
        </TouchableOpacity>
      </View>
  );
};