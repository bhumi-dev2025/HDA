import { View, Text, Dimensions } from 'react-native';
import React, { useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// સ્ક્રીનની પહોળાઈ મેળવો
const { width } = Dimensions.get('window');

// રિસ્પોન્સિવ સાઈઝ ફંક્શન (ફોન્ટ અને આઈકોન માટે)
const scale = (size:any) => (width / 375) * size;

const ComingSoonScreen = () => {
  const video = useRef(null);

  // વિડીયોની સાઈઝ સ્ક્રીનના 70% રાખીએ
  const videoSize = width * 0.7;

  return (
    <SafeAreaView className="flex-1 bg-[#F1F1F1]">
      <StatusBar style="dark" />
      
      {/* Change 1: 'justify-evenly' 
         આનાથી ઉપર, વચ્ચે અને નીચે એકસરખી જગ્યા રહેશે (Margins ની જરૂર નથી)
      */}
      <View className="flex-1 items-center justify-center w-full mb-10">
        
        {/* Title Section */}
        <View className="items-center justify-center mb-10">
          <Text 
            className="text-black font-bold"
            style={{ fontSize: scale(14) }} // Responsive Font
          >
            Superhuman Activities
          </Text>
          
          <Text 
            className="text-gray-300 font-bold "
            style={{ fontSize: scale(40) }} // Responsive Font
          >
            Alumni
          </Text>
        </View>

        {/* Video Section */}
        {/* Change 2: Dynamic Width & Height
           w-64 ને બદલે videoSize વાપર્યું જેથી દરેક ફોનમાં પરફેક્ટ દેખાય
        */}
        <View style={{ width: videoSize, height: videoSize }} className='mb-10'>
          <Video
            ref={video}
            style={{ width: '100%', height: '100%' }}
            source={require('../../assets/video/v2.mp4')} 
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay
            isMuted={true}
          />
        </View>

        {/* Subtitle */}
        <Text 
          className="text-gray-500 font-medium"
          style={{ fontSize: scale(12) }} // Responsive Font
        >
          Coming Soon...
        </Text>

      </View>
    </SafeAreaView>
  );
};

export default ComingSoonScreen;