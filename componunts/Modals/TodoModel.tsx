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
import C1 from '../../assets/photo/home/C1.svg';

interface TaskItem {
  text: string;
  isDone: boolean;
}

// 1. Props માં ફેરફાર: onSave હવે string array (ટાસ્કનું લિસ્ટ) લેશે
interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tasks: TaskItem[]) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSave }) => {
  const [tasks, setTasks] = useState([
    { text: '', isDone: false },
    { text: '', isDone: false },
    { text: '', isDone: false },
    ]);

    const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].isDone = !newTasks[index].isDone;
    setTasks(newTasks);
  };

  const updateTaskText = (index: number, val: string) => {
    const newTasks = [...tasks];
    newTasks[index].text = val;
    setTasks(newTasks);
  };
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
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
          <View
            style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight : 20 }}
            className="bg-white rounded-t-[40px] p-6"
          >
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-6" />

            <Text className="text-center text-xl font-bold mb-6 text-black">Enter Notes</Text>

            <View className="space-y-2 mb-36">
              {tasks.map((task, index) => (
                <View key={index} className="flex-row items-center bg-[#18181B05] p-2 rounded-2xl border border-gray-100 mb-3">
                  <TouchableOpacity onPress={() => toggleTask(index)}>
                    {task.isDone ? <C2 height={24} width={24} /> : <C1 height={24} width={24}></C1>} 
                    {/* જો C1 આઈકોન હોય તો એ વાપરો */}
                  </TouchableOpacity>
                  <TextInput
                    placeholder={`${index + 1}st Task`}
                    placeholderTextColor={'#C7C7CC'}
                    value={task.text}
                    onChangeText={(text) => updateTaskText(index, text)}
                    className={`flex-1 ml-3 text-lg ${task.isDone ? 'text-gray-400 line-through' : 'text-black'}`}
                  />
                </View>
              ))}
            </View>

            <View className="flex-row items-center justify-center mt-4">
              {/* 2. Save Button માં ફેરફાર: tasks array પાસ કરવો */}
              <TouchableOpacity
                onPress={() => onSave(tasks)} // અહીં ટાસ્કનું લિસ્ટ મોકલી
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