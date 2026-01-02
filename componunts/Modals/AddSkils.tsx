import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import { Search, CheckCircle } from 'lucide-react-native';
// import M1...M7 વાળી લાઈનો કાઢી નાખવી, કારણ કે હવે ડેટા skillsData માંથી આવશે.
import { MASTER_SKILLS } from '../../constants/skillData'; // <--- તમારી બનાવેલી ડેટા ફાઈલ

interface ExpertiseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;     // <--- Save Function ઉમેર્યું
  initialSelectedSkills: string[];             // <--- જુનો ડેટા લાવવા માટે
}

export const AddExpertiseModal = ({ isVisible, onClose, onSave, initialSelectedSkills }: ExpertiseModalProps) => {
  // IDs હવે string માં છે એટલે number ની જગ્યાએ string[]
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 1. જુનો ડેટા (Selected Skills) Load કરો
  useEffect(() => {
    setSelectedSkills(initialSelectedSkills || []);
  }, [isVisible, initialSelectedSkills]);

  // 2. Keyboard Setup (તમારો કોડ એમ જ રાખ્યો છે)
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const toggleSkill = (id: string) => {
    if (selectedSkills.includes(id)) {
      setSelectedSkills(selectedSkills.filter((sId) => sId !== id));
    } else {
      setSelectedSkills([...selectedSkills, id]);
    }
  };

  const handleSave = () => {
    onSave(selectedSkills); // ડેટા Profile screen પર મોકલો
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* Backdrop */}
        <Pressable
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/50"
          onPress={onClose}
        />

        {/* Modal Content Wrapper */}
        <View
          className="flex-1 justify-end"
          style={{ paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0 }}
        >
          {/* Main Card */}
          <View
            className="bg-white rounded-t-[32px] w-full max-h-[80%] min-h-[60%] shadow-2xl overflow-hidden p-5 pb-12"
            style={{ marginBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
          >
            <View className="items-center pt-4 pb-2">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            <Text className="text-xl font-bold text-center text-gray-900 mb-6 mt-2">
              Add Expertise
            </Text>

            {/* ScrollView & Search */}
            <ScrollView
              className="px-2 flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Search Box - તમારી સ્ટાઈલ મુજબ */}
              <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-6">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-800 p-0"
                  placeholder="Search"
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {/* Skills List Rendering */}
              <View className='flex-row flex-wrap gap-3'>
                {MASTER_SKILLS.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map((skill) => {
                  
                  const isSelected = selectedSkills.includes(skill.id);
                  const IconComponent = skill.icon;

                  return (
                    <TouchableOpacity
                      key={skill.id}
                      onPress={() => toggleSkill(skill.id)}
                      // અહિયાં Logic મુક્યું: જો Select હોય તો Black, નહીંતર White
                      className={`p-3 flex-row items-center justify-center self-start gap-2 border-2 rounded-xl ${
                        isSelected ? 'bg-white border-black' : 'bg-white border-slate-100'
                      }`}
                    >
                      {/* Icon Logic: SVG હોય તો અલગ, Lucide હોય તો અલગ */}
                      {skill.type === 'svg' ? (
                         // @ts-ignore
                        <IconComponent height={20} width={20} opacity={isSelected ? 1 : 0.5} />
                      ) : (
                        <IconComponent size={20} color={isSelected ? "black" : "#9CA3AF"} />
                      )}
                      
                      {/* Text Color Logic */}
                      <Text className={`text-lg font-medium ${isSelected ? 'text-black' : 'text-slate-300'}`}>
                        {skill.name}
                      </Text>

                      {/* Tick Mark (Optional - જો તમારે જોઈતું હોય તો) */}
                      {/* {isSelected && <CheckCircle size={16} color="white" fill="black" />} */}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Save Button */}
            <View className='p-2 pt-2'>
              <TouchableOpacity
                className="bg-black w-full p-4 rounded-2xl items-center mt-auto shadow-lg"
                onPress={handleSave} // <--- અહિયાં handleSave ફંક્શન મુક્યું
              >
                <Text className="text-white font-bold text-lg">Save</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </View>
    </Modal>
  );
};