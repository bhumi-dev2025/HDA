import { Search } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MASTER_SKILLS } from "../../constants/skillData";
import { ExpertiseModalProps } from "../../types";

const buttonBg = require("../../assets/2.0/model/button.png");
const modalBg = require("../../assets/2.0/model/bg.png");

const { height } = Dimensions.get("window");
export const AddExpertiseModal: React.FC<ExpertiseModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialSelectedSkills,
}: ExpertiseModalProps) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // --- Animation & Drag Logic Start ---
  const panY = useRef(new Animated.Value(0)).current;

  // મોડલ ખૂલે ત્યારે પોઝિશન રીસેટ કરો
  useEffect(() => {
    if (isVisible) {
      panY.setValue(0);
    }
  }, [isVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // ખાલી નીચે તરફ ડ્રેગ કરવા દેવું
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // જો 20% કરતા વધારે નીચે ખેંચ્યું હોય તો બંધ કરવું
        if (gestureState.dy > height * 0.2) {
          onClose();
        } else {
          // નહીંતર પાછું ઉપર લાવી દેવું
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;
  // --- Animation Logic End ---

  // ડેટા લોડિંગ
  useEffect(() => {
    setSelectedSkills(initialSelectedSkills || []);
  }, [isVisible, initialSelectedSkills]);

  // કીબોર્ડ હેન્ડલિંગ
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
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
    onSave(selectedSkills);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* 1. Backdrop — BlurView */}
      <Pressable
        className="absolute top-0 bottom-0 left-0 right-0"
        onPress={onClose}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={28} tint="dark" style={{ flex: 1 }} />
        ) : (
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }} />
        )}
      </Pressable>

      {/* 2. Main Content Wrapper */}
      <View className="flex-1 justify-end" pointerEvents="box-none">
        <Animated.View
          style={{
            transform: [{ translateY: panY }],
            paddingBottom: Platform.OS === "android" ? keyboardHeight : 0,
            marginBottom: Platform.OS === "ios" ? keyboardHeight : 0,
          }}
          className="rounded-t-[40px] w-full max-h-[80%] min-h-[60%] shadow-2xl overflow-hidden flex-1 mt-20"
        >
          <ImageBackground
            source={modalBg}
            resizeMode="cover"
            style={{ flex: 1 }}
            imageStyle={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
          >
          {/* --- 3. DRAG HANDLE (Swipe Area) --- */}
          <View
            {...panResponder.panHandlers}
            className="w-full h-14 items-center justify-center z-50 absolute top-0"
          >
            <View className="w-12 h-1.5 bg-[#636366] rounded-full" />
          </View>
          {/* ---------------------------------- */}

          {/* 4. Scrollable Content */}
          <View className="flex-1 pt-14 pb-8 px-6">
            <Text className="text-xl font-bold text-center text-white mb-6">
              Add Expertise
            </Text>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Search Box */}
              <View className="flex-row items-center bg-[#2B2B2B] rounded-lg px-4 py-3 mb-6">
                <Search size={20} color="#636366" />
                <TextInput
                  className="flex-1 ml-3 text-base text-white p-0"
                  placeholder="Search"
                  placeholderTextColor="#636366"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {/* Skills List */}
              <View className="flex-row flex-wrap gap-3 mb-8">
                {MASTER_SKILLS.filter((item) =>
                  item.name.toLowerCase().includes(search.toLowerCase()),
                ).map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id);
                  const IconComponent = skill.icon;

                  return (
                    <TouchableOpacity
                      key={skill.id}
                      onPress={() => toggleSkill(skill.id)}
                      className={`p-3 flex-row items-center justify-center self-start gap-2 border-2 rounded-xl ${
                        isSelected
                          ? "bg-[#2B2B2B] border-white"
                          : "bg-[#2B2B2B] border-[#3F3F3F]"
                      }`}
                    >
                      {skill.type === "svg" ? (
                        // @ts-ignore
                        <IconComponent
                          height={20}
                          width={20}
                          opacity={isSelected ? 1 : 0.4}
                        />
                      ) : (
                        <IconComponent
                          size={20}
                          color={isSelected ? "#FFFFFF" : "#636366"}
                        />
                      )}

                      <Text
                        className={`text-lg font-medium ${isSelected ? "text-white" : "text-[#636366]"}`}
                      >
                        {skill.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              style={{ width: "100%", marginTop: 8 }}
            >
              <ImageBackground
                source={buttonBg}
                style={{ width: "100%", height: 56, alignItems: "center", justifyContent: "center", borderRadius: 18, overflow: "hidden" }}
                imageStyle={{ borderRadius: 18 }}
                resizeMode="cover"
              >
                <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "600", letterSpacing: 0.3 }}>Save</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
          </ImageBackground>
        </Animated.View>
      </View>
    </Modal>
  );
};
