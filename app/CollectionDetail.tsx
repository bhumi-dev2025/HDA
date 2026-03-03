import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Text,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 4000;

export default function CollectionDetail() {
  const { collectionId } = useLocalSearchParams();
  const router = useRouter();

  const [images, setImages] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const progress = useRef(new Animated.Value(0)).current;

  const fetchImages = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("collection_images")
      .select("*")
      .eq("collection_id", collectionId);

    setImages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // 🔥 Auto story animation
  useEffect(() => {
    if (images.length === 0) return;

    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        nextStory();
      }
    });

    return () => animation.stop();
  }, [currentIndex, images]);

  const nextStory = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // ==========================
  // 🔵 LOADING STATE
  // ==========================
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // ==========================
  // 🔴 EMPTY STATE
  // ==========================
  if (images.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-white text-lg font-semibold text-center">
          No Images in this Collection
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-white px-6 py-3 rounded-full"
        >
          <Text className="text-black font-semibold">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================
  // 🟢 STORY VIEW
  // ==========================
  return (
    <View className="flex-1 bg-black">

      <Image
        source={{ uri: images[currentIndex].image_url }}
        style={{ width, height }}
        resizeMode="contain"
      />

      {/* Progress Bars */}
      <View className="absolute top-14 left-4 right-4 flex-row space-x-2">
        {images.map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {index === currentIndex ? (
              <Animated.View
                style={{
                  height: 3,
                  backgroundColor: "white",
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            ) : index < currentIndex ? (
              <View
                style={{
                  height: 3,
                  backgroundColor: "white",
                  width: "100%",
                }}
              />
            ) : null}
          </View>
        ))}
      </View>

      {/* Tap Areas */}
      <View className="absolute inset-0 flex-row">
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={prevStory}
        />
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={nextStory}
        />
      </View>

      {/* Close */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-16 right-6"
      >
        <View className="bg-black/60 rounded-full px-4 py-2">
          <Text className="text-white text-lg">✕</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}