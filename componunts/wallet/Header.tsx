import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BackArrowIcon } from '../wallet/Icons';

export const Header: React.FC = () => {
  return (
    <View className="bg-gray-50 flex-row items-center justify-between p-4 z-50 border-b border-gray-200 shrink-0">
      <TouchableOpacity className="p-2" accessibilityLabel="Go back">
        <BackArrowIcon className="w-6 h-6 text-black" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-black">Wallet</Text>
      <View className="w-8 h-8" />
    </View>
  );
}; 