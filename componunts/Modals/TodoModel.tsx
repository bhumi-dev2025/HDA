import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Keyboard,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import C2 from '../../assets/photo/home/C2.svg';

const TaskModal = ({ visible, onClose,onSave }: { visible: boolean; onClose: () => void,onSave:()=>void }) => {
  const [tasks, setTasks] = useState(['', '', '']);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // કીબોર્ડ જ્યારે ખુલે ત્યારે તેની હાઇટ માપવી
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    // કીબોર્ડ બંધ થાય ત્યારે હાઇટ 0 કરી દેવી
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Modal 
    visible={visible}
     animationType="slide" 
     transparent={true}
     onRequestClose={onClose}
     >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/40 justify-end">

          {/* અંહી આપણે ડાયનેમિકલી પેડિંગ આપીએ છીએ */}
          <View
            style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight : 20 }}
            className="bg-white rounded-t-[40px] p-6"
          >
            {/* Handle Bar */}
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-6" />

            <Text className="text-center text-xl font-bold mb-6 text-black">Enter Notes</Text>

            <View className="space-y-2 mb-36">
              {tasks.map((task, index) => (
                <View
                  key={index}
                  className="flex-row items-center bg-[#18181B05] p-1 rounded-2xl border border-gray-100 mb-3"
                >
                  <C2 height={24} width={24}></C2>
                  <TextInput
                    placeholder={`${index + 1}st Task`}
                    placeholderTextColor={'#C7C7CC'}
                    value={task}
                    onChangeText={(text) => {
                      const newTasks = [...tasks];
                      newTasks[index] = text;
                      setTasks(newTasks);
                    }}
                    className="flex-1 ml-3 text-[black] text-lg"
                  />
                </View>
              ))}
            </View>

            <View className="flex-row items-center justify-center mt-4">

              <TouchableOpacity
                onPress={onSave}
                className="bg-black w-full py-4 rounded-2xl items-center absolute bottom-10 mx-6"
              >
                <Text className="text-white font-bold text-lg">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default TaskModal;