// components/Card.tsx
import React from 'react';
import { Text, TouchableOpacity, View, Pressable, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  FadeIn,
  Easing
} from 'react-native-reanimated';
import { DeleteIcon, EditIcon } from '../wallet/Icons';
import type { CardPro } from '../../types';

const CARD_HEIGHT = 224;
const VISIBLE_CARDS = 6;

export const Card: React.FC<CardPro> = ({ card, isSelected, index, onPress, onEdit, onDelete }:CardPro) => {
  
  const animatedStyle = useAnimatedStyle(() => {
    const targetMarginTop = isSelected ? -CARD_HEIGHT / 2 : -CARD_HEIGHT / 2 - (index * 45);
    const targetScale = isSelected ? 1.05 : 1 - index * 0.05;
    const targetOpacity = index < VISIBLE_CARDS ? 1 : 0;

    return {
      top: '50%',
      marginTop: withTiming(targetMarginTop, { duration: 350, easing: Easing.out(Easing.cubic) }),
      transform: [{ scale: withTiming(targetScale, { duration: 350, easing: Easing.out(Easing.cubic) }) }],
      opacity: withTiming(targetOpacity, { duration: 300 }),
      zIndex: isSelected ? 1000 : 100 - index,
    };
  }, [isSelected, index]);

  const shadowStyle = Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  } : { elevation: 5 };

  return (
    <Animated.View 
      className="absolute"
      style={[{ height: CARD_HEIGHT,width:'100%',left:0,right:0 }, animatedStyle]}
    >
      <Pressable onPress={onPress} className="w-full h-full rounded-3xl shadow-lg bg-white" style={shadowStyle}>
        
        {card.imageUri ? (
          <View className="w-full h-full rounded-3xl overflow-hidden relative bg-black">
             <Image 
                source={{ uri: card.imageUri }} 
                className="w-full h-full"
                resizeMode="cover"
             />
             {/* shedow */}
             {/* <View className="absolute top-0 w-full h-20 bg-black/30" /> */}
          </View>
        ) : (
          <LinearGradient
            colors={card.gradientColors && card.gradientColors.length > 1 
                    ? card.gradientColors 
                    : ['#4b5563', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, width: '100%', height: '100%' }}
            className="flex flex-col justify-between overflow-hidden relative"
          >
            <View className="flex-row items-start justify-between mb-28">
              <View>
                <Text className={`font-semibold text-lg ${card.textColor}`}>{card.type}</Text>
                <Text className={`text-sm opacity-80 ${card.textColor}`}>{card.issuer}</Text>
              </View>
              <Text className="text-4xl">{card.emoji}</Text>
            </View>
            <View className="items-end">
              <Text className={`font-semibold text-xl ${card.textColor}`}>{card.name}</Text>
              <Text className={`font-mono text-sm opacity-80 ${card.textColor}`}>{card.number}</Text>
            </View>
          </LinearGradient>
        )}

        {/* Edit/Delete બટન્સ હંમેશા ઉપર દેખાશે */}
        {isSelected && (
            <Animated.View 
              entering={FadeIn.duration(300)}
              className="absolute top-4 right-4 flex-row gap-2 z-10"
            >
              <TouchableOpacity onPress={onEdit} className="p-2 bg-black/40 rounded-full active:bg-black/60 border border-white/20">
                <EditIcon className="w-5 h-5 text-white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} className="p-2 bg-black/40 rounded-full active:bg-black/60 border border-white/20">
                <DeleteIcon className="w-5 h-5 text-white" />
              </TouchableOpacity>
            </Animated.View>
        )}

      </Pressable>
    </Animated.View>
  );
};