import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  FlatList,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { Trash2 } from "lucide-react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  collectionId?: string | null;
}

export default function AddCollectionModal({
  visible,
  onClose,
  collectionId,
}: Props) {
  const [title, setTitle] = useState("");
  const [covers, setCovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // ==========================
  // FETCH IF EDIT
  // ==========================
  useEffect(() => {
    if (collectionId) fetchCollection();
  }, [collectionId]);

  const fetchCollection = async () => {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (data) {
      setTitle(data.title);
      if (data.cover_url) {
        setCovers([{ uri: data.cover_url }]);
      }
    }
  };

  // ==========================
  // KEYBOARD LISTENER
  // ==========================
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardOpen(true);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      setIsKeyboardOpen(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ==========================
  // IMAGE PICKER (ONLY ONE)
  // ==========================
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });

    if (!result.canceled) {
      setCovers([{ uri: result.assets[0].uri }]); // only one
    }
  };

  const deleteImage = () => {
    setCovers([]);
  };

  // ==========================
  // SAVE
  // ==========================
  const handleSave = async () => {
    if (!title || covers.length === 0) {
      Alert.alert("Title & Cover required");
      return;
    }

    try {
      setLoading(true);

      let publicUrl = covers[0].uri;

      if (covers[0].uri.startsWith("file")) {
        const response = await fetch(covers[0].uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileName = `covers/${Date.now()}.jpg`;

        await supabase.storage
          .from("collections")
          .upload(fileName, arrayBuffer, {
            contentType: "image/jpeg",
          });

        const { data } = supabase.storage
          .from("collections")
          .getPublicUrl(fileName);

        publicUrl = data.publicUrl;
      }

      if (collectionId) {
        await supabase
          .from("collections")
          .update({
            title,
            cover_url: publicUrl,
          })
          .eq("id", collectionId);
      } else {
        await supabase.from("collections").insert([
          {
            title,
            cover_url: publicUrl,
          },
        ]);
      }

      setTitle("");
      setCovers([]);
      onClose();
    } catch {
      Alert.alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="bg-white rounded-t-3xl"
        style={{
          height:
            Platform.OS === "android"
              ? isKeyboardOpen
                ? "85%"
                : "70%"
              : "75%",
        }}
      >
        <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mt-3 mb-4" />

        <Text className="text-lg font-semibold text-center mb-5">
          {collectionId ? "Edit Collection" : "Add Collection"}
        </Text>

        <View className="px-6 flex-1">

          {/* Title */}
          <TextInput
            placeholder="Enter Name"
            placeholderTextColor="#AEAEB2"
            value={title}
            onChangeText={setTitle}
            className="border border-gray-300 rounded-xl px-4 h-12 mb-5"
          />

          {/* Add Image Button */}
          <TouchableOpacity
            onPress={pickImage}
            className="border border-dashed border-gray-300 rounded-xl h-24 items-center justify-center mb-4"
          >
            <Text className="text-gray-400">Select Image</Text>
          </TouchableOpacity>

          {/* GRID PREVIEW */}
          <FlatList
            data={covers}
            keyExtractor={(_, index) => index.toString()}
            numColumns={3}
            renderItem={({ item }) => (
              <View className="m-1">
                <Image
                  source={{ uri: item.uri }}
                  className="w-24 h-24 rounded-lg"
                />
                <TouchableOpacity
                  onPress={deleteImage}
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                >
                  <Trash2 size={14} color="white" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View
          style={{
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 30,
            paddingHorizontal: 24,
            paddingTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={handleSave}
            className="bg-black h-14 rounded-2xl items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}