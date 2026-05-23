import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { Trash2 } from "lucide-react-native";

const buttonBg = require("../assets/2.0/model/button.png");

interface Props {
  visible: boolean;
  onClose: () => void;
  collectionId: string;
}

export default function AddCollectionImagesModal({
  visible,
  onClose,
  collectionId,
}: Props) {
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("collection_images")
      .select("*")
      .eq("collection_id", collectionId);

    setExistingImages(data || []);
  };

  useEffect(() => {
    if (visible) fetchImages();
  }, [visible]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImages((prev) => [...prev, ...result.assets]);
    }
  };

  const deleteExistingImage = async (id: string, imageUrl: string) => {
    const parts = imageUrl.split("/storage/v1/object/public/collections/");
    const filePath = parts[1];

    await supabase.storage.from("collections").remove([filePath]);
    await supabase.from("collection_images").delete().eq("id", id);

    fetchImages();
  };

  const deleteNewImage = (index: number) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSave = async () => {
    if (newImages.length === 0) {
      onClose();
      return;
    }

    try {
      setLoading(true);

      for (let asset of newImages) {
        const response = await fetch(asset.uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileName = `images/${Date.now()}-${Math.random()}.jpg`;

        await supabase.storage
          .from("collections")
          .upload(fileName, arrayBuffer, {
            contentType: "image/jpeg",
          });

        const { data } = supabase.storage
          .from("collections")
          .getPublicUrl(fileName);

        await supabase.from("collection_images").insert([
          {
            collection_id: collectionId,
            image_url: data.publicUrl,
          },
        ]);
      }

      setNewImages([]);
      onClose();
    } catch {
      Alert.alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <View style={{ backgroundColor: '#19181B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '85%' }}>

        <View style={{ width: 48, height: 6, backgroundColor: '#636366', borderRadius: 3, alignSelf: 'center', marginBottom: 16 }} />

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 }}>
          Add Image
        </Text>

        <TouchableOpacity
          onPress={pickImages}
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', borderRadius: 12, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: '#636366' }}>Add Image</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#FFFFFF" />}

        <FlatList
          data={[...existingImages, ...newImages]}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          numColumns={3}
          renderItem={({ item, index }) => {
            const isNew = !item.id;
            return (
              <View style={{ margin: 4 }}>
                <Image
                  source={{ uri: isNew ? item.uri : item.image_url }}
                  style={{ width: 112, height: 112, borderRadius: 8 }}
                />
                <TouchableOpacity
                  onPress={() =>
                    isNew
                      ? deleteNewImage(index - existingImages.length)
                      : deleteExistingImage(item.id, item.image_url)
                  }
                  style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#FF453A', borderRadius: 50, padding: 4 }}
                >
                  <Trash2 size={14} color="white" />
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={{ marginTop: 20, height: 56, borderRadius: 18, overflow: 'hidden' }}
        >
          <ImageBackground
            source={buttonBg}
            style={{ width: '100%', height: 56, alignItems: 'center', justifyContent: 'center' }}
            imageStyle={{ borderRadius: 18 }}
            resizeMode="cover"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: 0.3 }}>Save</Text>
          </ImageBackground>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}