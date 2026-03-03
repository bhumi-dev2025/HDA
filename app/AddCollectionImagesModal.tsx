import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { Trash2 } from "lucide-react-native";

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
      <View className="bg-white rounded-t-3xl p-6 h-[85%]">

        <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4" />

        <Text className="text-lg font-bold text-center mb-5">
          Add Image
        </Text>

        <TouchableOpacity
          onPress={pickImages}
          className="border border-dashed border-gray-300 rounded-xl h-32 items-center justify-center mb-5"
        >
          <Text className="text-gray-400">Add Image</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="black" />}

        <FlatList
          data={[...existingImages, ...newImages]}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          numColumns={3}
          renderItem={({ item, index }) => {
            const isNew = !item.id;

            return (
              <View className="m-1">
                <Image
                  source={{ uri: isNew ? item.uri : item.image_url }}
                  className="w-28 h-28 rounded-lg"
                />

                <TouchableOpacity
                  onPress={() =>
                    isNew
                      ? deleteNewImage(index - existingImages.length)
                      : deleteExistingImage(item.id, item.image_url)
                  }
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                >
                  <Trash2 size={14} color="white" />
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <TouchableOpacity
          onPress={handleSave}
          className="bg-black h-14 rounded-2xl items-center justify-center mt-5"
        >
          <Text className="text-white font-semibold">
            Save
          </Text>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}