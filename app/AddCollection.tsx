import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
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

const buttonBg = require("../assets/2.0/model/button.png");

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
        style={{
          backgroundColor: '#19181B',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height:
            Platform.OS === "android"
              ? isKeyboardOpen ? "85%" : "70%"
              : "75%",
        }}
      >
        <View style={{ width: 48, height: 6, backgroundColor: '#636366', borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />

        <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 }}>
          {collectionId ? "Edit Collection" : "Add Collection"}
        </Text>

        <View style={{ paddingHorizontal: 24, flex: 1 }}>

          {/* Title */}
          <TextInput
            placeholder="Enter Name"
            placeholderTextColor="#636366"
            value={title}
            onChangeText={setTitle}
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 20, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.06)' }}
          />

          {/* Add Image Button */}
          <TouchableOpacity
            onPress={pickImage}
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', borderRadius: 12, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
          >
            <Text style={{ color: '#636366' }}>Select Image</Text>
          </TouchableOpacity>

          {/* GRID PREVIEW */}
          <FlatList
            data={covers}
            keyExtractor={(_, index) => index.toString()}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={{ margin: 4 }}>
                <Image source={{ uri: item.uri }} style={{ width: 96, height: 96, borderRadius: 8 }} />
                <TouchableOpacity
                  onPress={deleteImage}
                  style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#FF453A', borderRadius: 50, padding: 4 }}
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
            activeOpacity={0.85}
            style={{ height: 56, borderRadius: 18, overflow: 'hidden' }}
          >
            <ImageBackground
              source={buttonBg}
              style={{ width: '100%', height: 56, alignItems: 'center', justifyContent: 'center' }}
              imageStyle={{ borderRadius: 18 }}
              resizeMode="cover"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: 0.3 }}>Save</Text>
              )}
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}