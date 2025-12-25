import { View, Text,Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' 
import  B1  from '../../assets/photo/login/B1.svg'

const handleGoogleLogin = () => {
  alert('Google Login')
}
const explore = () => {
  const back = require('../../assets/photo/login/back.png')
  const logo = require('../../assets/photo/login/b2.png')
  return (
   <SafeAreaView>
    <View className='h-[100%] w-[100%] justify-center items-center'>
      <Image source={back} className='absolute h-[100%] w-[100%]' resizeMode='cover'></Image>

      <View className='items-center mt-2'>
        <Image source={logo} className='w-[320px] h-[320px]' resizeMode='contain'/>
      </View>

      <View className="absolute w-full px-10 mb-[-150%]">
        <TouchableOpacity onPress={handleGoogleLogin} activeOpacity={0.9} className='bg-black flex-row items-center justify-center py-4 rounded-2xl shadow-lg gap-2'>
          <B1></B1>
          <Text className="text-white font-bold text-lg mr-3">
                Sign in with Google
              </Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  )
}

export default explore