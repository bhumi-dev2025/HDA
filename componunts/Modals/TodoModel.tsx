import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { UniversalModal } from '../../componunts/Modals/UniversalModal';
import C2 from '../../assets/photo/home/C2.svg';
import C1 from '../../assets/photo/home/C1.svg';
import {TaskModalProps} from '../../types'

const TaskModal: React.FC<TaskModalProps> = ({isVisible, onClose, onSave, initialTasks }:TaskModalProps) => {
  const defaultTasks = [
    { text: '', isDone: false },
    { text: '', isDone: false },
    { text: '', isDone: false },
  ];
  const [tasks, setTasks] = useState(defaultTasks);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (isVisible) {
        if (initialTasks && initialTasks.length > 0) {
            setTasks(initialTasks);
        } else {
            setTasks(defaultTasks);
        }
    }
  }, [isVisible, initialTasks]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const toggleTask = (index: number) => {
    setTasks(prev => {
      const newTasks = prev.map((t, i) =>
        i === index ? { ...t, isDone: !t.isDone } : t
      );
      return newTasks;
    });
  };

  const updateTaskText = (index: number, val: string) => {
    const newTasks = [...tasks];
    newTasks[index].text = val;
    setTasks(newTasks);
  };

  return (
    <UniversalModal 
      isVisible={isVisible} 
      onClose={onClose}
      customStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 40 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="w-full">
            <Text className="text-center text-xl font-bold mb-6 text-black">Enter Notes</Text>

            <View className="space-y-4 mb-6">
              {tasks.map((task, index) => (
                <View key={index} className="flex-row items-center bg-[#18181B05] p-5 rounded-2xl border border-gray-100 mb-3">
                  <TouchableOpacity onPress={() => toggleTask(index)}>
                    {task.isDone ? <C2 height={24} width={24} /> : <C1 height={24} width={24} />}
                  </TouchableOpacity>
                  <TextInput
                    placeholder={`${index + 1}st Task`}
                    placeholderTextColor={'#C7C7CC'}
                    value={task.text}
                    onChangeText={(text) => updateTaskText(index, text)}
                    className={`flex-1 ml-3 text-lg py-0 leading-tight ${task.isDone ? 'text-gray-400 line-through' : 'text-black'}`}
                  />
                </View>
              ))}
            </View>

            <View className="flex-row items-center justify-center mb-5">
              <TouchableOpacity
                onPress={() => onSave(tasks)}
                // tasks ref not needed — functional update above ensures latest state
                className="bg-black w-full py-5 rounded-2xl items-center mt-auto"
              >
                <Text className="text-white font-bold text-lg">Save</Text>
              </TouchableOpacity>
            </View>
        </View>
      </TouchableWithoutFeedback>
    </UniversalModal>
  );
};

export default TaskModal;