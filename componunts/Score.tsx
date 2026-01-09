import '../global.css';
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
// 1. Skia remove karyu ane Lottie import karyu
import LottieView from 'lottie-react-native'; 
import I5 from '../assets/photo/home/I5.svg';

const { width } = Dimensions.get('window');
const SIZE = width * 0.7; // Chart ni size (Screen width na 70%)

interface ScoreChartProps {
  score?: number;
}

export default function ScoreChart({ score = 71 }: ScoreChartProps) {
  // Ahiya thi badhu Skia logic (rotation, renderDots) kadhi nakhyu che.

  return (
    <View className="items-center justify-center bg-transparent relative">
      
      {/* 2. Skia Canvas ni jagya e Lottie View */}
      <View style={{ width: SIZE, height: SIZE }}>
        <LottieView
          // TAMARE AHIYA TAMARI FILE NO PATH AAPVO
          source={require('../assets/lottie/score.json')} 
          autoPlay
          loop
          renderMode="SOFTWARE" // renderMode="HARDWARE"
          //  renderMode="HARDWARE"
          style={{ width: '100%', height: '100%'}}
          resizeMode="contain" // athva 'cover'
        />
      </View>

      {/* 3. Text Overlay (Score ane Text) - Jem hatu tem aj */}
      <View className='absolute justify-center items-center'>
        <View className="flex-row items-center">
          <Text className='text-5xl font-extrabold'>{score}<Text className='text-2xl font-bold'>%</Text></Text>
        </View>
        <Text style={{ color: '#666', fontSize: 10, fontWeight: '800' }}>Out of 100</Text>
        
        {/* Logo Icon */}
        <View className="absolute mt-36">
             <I5 width={30} height={30}></I5>
        </View>     
      </View>
    </View>
  );
}