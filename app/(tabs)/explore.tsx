import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ImageBackground,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";


const ADMIN_EMAIL = "simplebhumidev@gmail.com";

export default function Explore() {
  const [links, setLinks] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const fetchLinks = async () => {
    const { data } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    setLinks(data || []);
  };

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    const email = data?.user?.email;
    if (email === ADMIN_EMAIL) setIsAdmin(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchLinks();
      checkUser();
    }, [])
  );

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("links").delete().eq("id", id);
          fetchLinks();
        },
      },
    ]);
  };

  // const renderItem = ({ item }: any) =>(
  //     <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
  //       <View className="bg-white rounded-[32px] overflow-hidden shadow-md mb-4">

  //   {/* IMAGE SECTION */}
  //   <View className="relative">
  //     {item.image && (
  //       <ImageBackground
  //         source={{ uri: item.image }}
  //         className="w-full h-64"
  //         resizeMode="cover"
  //       />
  //     )}

  //     {/* Gradient + Title Overlay */}
  //     <LinearGradient
  //       colors={["transparent", "rgba(0,0,0,0.85)"]}
  //       className="absolute bottom-0 left-0 right-0 h-36 px-5 justify-end pb-4"
  //     >
  //       <Text
  //         className="text-white text-xl font-bold"
  //         numberOfLines={2}
  //       >
  //         {item.description}
  //       </Text>
  //     </LinearGradient>
  //   </View>

  //   {/* USER + DELETE ROW */}
  //   <View className="flex-row items-center justify-between px-5 py-4">

  //     <View className="flex-row items-center">
  //       <Image
  //         source={{ uri: item.logo }}
  //         className="w-10 h-10 rounded-full bg-gray-200"
  //       />
  //       <View className="ml-3">
  //         <Text className="text-base font-semibold text-gray-900">
  //           {item.username}
  //         </Text>
  //         <Text className="text-xs text-gray-400">
  //           {/* {new URL(item.url).hostname} */}
  //           Tap to view
  //         </Text>
  //       </View>
  //     </View>

  //     {isAdmin && (
  //       <TouchableOpacity
  //         onPress={() => handleDelete(item.id)}
  //         className="bg-red-500 px-3 py-1 rounded-full"
  //       >
  //         <Text className="text-white text-xs font-bold">
  //           Delete
  //         </Text>
  //       </TouchableOpacity>
  //     )}
  //   </View>

  //   {/* DESCRIPTION */}
  //   {/* {item.description && (
  //     <View className="px-5 pb-5">
  //       <Text
  //         className="text-gray-600"
  //         numberOfLines={2}
  //       >
  //         {item.description}
  //       </Text>
  //     </View>
  //   )} */}

  // </View>
  //     </TouchableOpacity>
  // );
const renderItem = ({ item }: any) => (
  <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
    <View className="bg-white rounded-[32px] overflow-hidden shadow-md mb-4">

      {/* IMAGE BACKGROUND SECTION */}
      <ImageBackground
        source={{ uri: item.image }}
        className="w-full h-64 justify-end"
        resizeMode="cover"
      >
        {/* GRADIENT OVERLAY */}
        <LinearGradient
          colors={["#00000000", "#000000E6"]} 
          className="w-full px-5 pb-5 pt-16"
        >
          <Text
            className={`text-white text-xl font-bold ${Platform.OS === "ios" ? "m-4" : ""}`}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </LinearGradient>
      </ImageBackground>

      {/* USER + DELETE ROW */}
      <View className="flex-row items-center justify-between px-5 py-4">

        <View className="flex-row items-center">
          <Image
            source={{ uri: item.logo }}
            className="w-10 h-10 rounded-full bg-gray-200"
          />
          <View className="ml-3">
            <Text className="text-base font-semibold text-gray-900">
              {item.username}
            </Text>
            <Text className="text-xs text-gray-400">
              Tap to view
            </Text>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="bg-red-500 px-3 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-bold">
              Delete
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  </TouchableOpacity>
);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-6">

        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-2xl font-extrabold text-slate-900">
            Featured Alumni Posts
          </Text>

          {isAdmin && (
            <TouchableOpacity
              onPress={() => router.push("/AddLink")}
              className="bg-black w-9 h-9 rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl">+</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={links}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}