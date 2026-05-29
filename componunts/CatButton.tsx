import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import OKButton from '../assets/2.0/path/OK.svg';

const ICON_SIZE = 60;
const BUTTON_W = 82;
const BUTTON_H = 38;

interface CatButtonProps {
  onPress: () => void;
}

export default function CatButton({ onPress }: CatButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        width: BUTTON_W,
        height: BUTTON_H + ICON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {/* Cat icon — થોડું ઉપર */}
      <View
        style={{
          position: 'absolute',
          top: -10,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <Image
          source={require('../assets/2.0/path/cat.png')}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          resizeMode="contain"
        />
      </View>

      {/* OK.svg disc */}
      <OKButton width={BUTTON_W} height={BUTTON_H} />
    </TouchableOpacity>
  );
}
