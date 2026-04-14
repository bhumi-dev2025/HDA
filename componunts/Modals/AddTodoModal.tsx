import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSaved: (tasks: { text: string }[]) => void; // called after successful save
  onSave: (tasks: { text: string }[]) => Promise<void>; // actual save function
}

const EMPTY_ROW = { text: "" };

export default function AddTodoModal({ isVisible, onClose, onSaved, onSave }: Props) {
  const [tasks, setTasks] = useState([{ ...EMPTY_ROW }, { ...EMPTY_ROW }, { ...EMPTY_ROW }]);
  const [saving, setSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Reset when modal opens
  useEffect(() => {
    if (isVisible) {
      setTasks([{ ...EMPTY_ROW }, { ...EMPTY_ROW }, { ...EMPTY_ROW }]);
      setSaving(false);
    }
  }, [isVisible]);

  // Keyboard height tracking
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const updateTask = (index: number, text: string) => {
    const updated = [...tasks];
    updated[index] = { text };
    setTasks(updated);
  };

  const addRow = () => {
    setTasks((prev) => [...prev, { ...EMPTY_ROW }]);
  };

  const removeRow = (index: number) => {
    if (tasks.length === 1) return; // keep at least 1 row
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const filled = tasks.filter((t) => t.text.trim().length > 0);
    if (filled.length === 0) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      await onSave(filled);
      onSaved(filled);
      onClose();
    } catch (err: any) {
      // error handling delegated to parent via onSave throwing
    } finally {
      setSaving(false);
    }
  };

  const filledCount = tasks.filter((t) => t.text.trim().length > 0).length;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      avoidKeyboard
      style={{ justifyContent: "flex-end", margin: 0 }}
      useNativeDriverForBackdrop
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          className="bg-white rounded-t-3xl px-5 pt-5"
          style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 16 : 40 }}
        >
          {/* Handle bar */}
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-gray-900">Add Todos</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Task rows */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
            {tasks.map((task, index) => (
              <View
                key={index}
                className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mb-3"
              >
                <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3" />
                <TextInput
                  className="flex-1 text-base text-gray-900 py-0"
                  placeholder={`Task ${index + 1}`}
                  placeholderTextColor="#c7c7cc"
                  value={task.text}
                  onChangeText={(val) => updateTask(index, val)}
                  returnKeyType="next"
                />
                {tasks.length > 1 && (
                  <TouchableOpacity onPress={() => removeRow(index)} className="ml-2 p-1">
                    <Ionicons name="close-circle" size={18} color="#d1d5db" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Add row button */}
          <TouchableOpacity
            onPress={addRow}
            className="flex-row items-center justify-center py-3 mb-4"
          >
            <Ionicons name="add-circle-outline" size={18} color="#6b7280" />
            <Text className="text-gray-500 text-sm ml-1">Add another task</Text>
          </TouchableOpacity>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || filledCount === 0}
            className={`py-4 rounded-2xl items-center ${
              filledCount > 0 && !saving ? "bg-black" : "bg-gray-200"
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`font-bold text-base ${
                  filledCount > 0 ? "text-white" : "text-gray-400"
                }`}
              >
                Save {filledCount > 0 ? `${filledCount} Task${filledCount > 1 ? "s" : ""}` : ""}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
