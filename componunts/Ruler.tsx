import { View, Text,Dimensions } from 'react-native'
import React,{useState} from 'react'
import { RulerPicker } from 'react-native-ruler-picker';
const { width } = Dimensions.get('window');
const RULER_WIDTH = width - 60;
import * as Haptics from 'expo-haptics';


const Ruler = () => {
      const [value, setValue] = useState('200');
    

    const handleValueChange = (val: string) => {
        // Haptics will work if available on device
        try{
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        catch(e){
          // ignore error
        }
        setValue(val);
      };
  return (
    <View className="w-full items-center justify-center mb-12">
            <Text className="absolute text-gray-400 mb-20">Steps</Text>
            
            {/* width - 80 karvathi padding baad thai jay ane ruler barabar fit thay */}
            <RulerPicker
              width={RULER_WIDTH} 
              height={100}
              min={100}
              max={10000}
              step={10}
              initialValue={100}
              onValueChange={handleValueChange}
              unit=""
              fractionDigits={0}
              indicatorColor="black"
              shortStepColor="#AEAEB2"
              longStepColor="#AEAEB2"
              indicatorHeight={40}
              longStepHeight={50}
              shortStepHeight={20}
              valueTextStyle={{
                color: 'black',
                fontSize: 40,
                fontWeight: 'bold',
              }}
            />
          </View>
  )
}

export default Ruler