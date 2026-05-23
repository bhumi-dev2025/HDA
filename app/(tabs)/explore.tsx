import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Trash2 } from "lucide-react-native";
import AddLinkModal from "../AddLink";
import AddCollectionModal from "../AddCollection";
import AddCollectionImagesModal from "../AddCollectionImagesModal";

const homeBg = require("../../assets/photo/login/2.0/home.png");

const ADMIN_EMAIL = [
  "simplebhumidev@gmail.com",
  "kalsariyadhaval@gmail.com"
];

export default function Explore() {
  const [links, setLinks] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addCollectionVisible, setAddCollectionVisible] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [addImagesVisible, setAddImagesVisible] = useState(false);
  const [adminAvatar, setAdminAvatar] = useState<string | null>(null);

  const router = useRouter();

  // ===========================
  // FETCH LINKS
  // ===========================
  const fetchLinks = async () => {
    const { data } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    setLinks(data || []);
  };

  // ===========================
  // FETCH COLLECTIONS
  // ===========================
  const fetchCollections = async () => {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    setCollections(data || []);
  };

  // ===========================
  // CHECK ADMIN
  // ===========================
  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user && ADMIN_EMAIL.includes(user.email || "")) {
      setIsAdmin(true);
      setAdminAvatar(user.user_metadata?.avatar_url || null);
    }
  };

  // First load
  useFocusEffect(
    useCallback(() => {
      fetchLinks();
      fetchCollections();
      checkUser();
    }, [])
  );

  // ===========================
  // 🔥 REALTIME LISTENER
  // ===========================
  useEffect(() => {
    const channel = supabase
      .channel("realtime-explore")

      // Links realtime
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "links",
        },
        () => {
          fetchLinks();
        }
      )

      // Collections realtime
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collections",
        },
        () => {
          fetchCollections();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ===========================
  // DELETE LINK
  // ===========================
  const handleDelete = async (id: string) => {
    Alert.alert("Delete Post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("links").delete().eq("id", id);
        },
      },
    ]);
  };

  // ===========================
  // STORY HEADER
  // ===========================
  const renderHeader = () => (
    <View className="mb-6">

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={collections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 4 }}

        ListHeaderComponent={
          isAdmin ? (
            <TouchableOpacity
              onPress={() => {
                setEditingCollectionId(null);
                setAddCollectionVisible(true);
              }}
              className="mr-5 items-center"
            >
              <View className="relative ">

                {/* Outer soft circle */}
                <View className="w-[80px] h-[80px] rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <View className="w-[70px] h-[70px] rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <Image
                      source={{
                        uri: adminAvatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"
                      }}
                      className="w-[68px] h-[68px] rounded-full"
                    />
                  </View>
                </View>

                {/* Floating + */}
                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center shadow-md" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <Plus size={20} color="#FFFFFF" />
                </View>

              </View>

              <Text className="text-xs mt-2 text-[#636366]">
                Create New
              </Text>
            </TouchableOpacity>
          ) : null
        }

        renderItem={({ item }) => (
          <View className="mr-5 items-center">
            <TouchableOpacity
              onPress={async () => {
                // 🔥 Check if collection has images
                const { data } = await supabase
                  .from("collection_images")
                  .select("id")
                  .eq("collection_id", item.id);

                if (data && data.length > 0) {
                  router.push({
                    pathname: "/CollectionDetail",
                    params: {
                      collectionId: item.id,
                      mode: "view",
                    },
                  });
                } else {
                  Alert.alert(
                    "No Images",
                    "This collection has no images yet."
                  );
                }
              }}
              onLongPress={() => {
                if (isAdmin) {
                  setSelectedCollection(item);
                  setMenuVisible(true);
                }
              }}
            >
              {/* Gradient Outer Ring */}
              <LinearGradient
                colors={["#FF7373", "#FCA5A5", "#8CE1FB"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                {/* Dark gap */}
                <View className="w-[74px] h-[74px] rounded-full items-center justify-center" style={{ backgroundColor: '#19181B' }}>
                  {/* Profile Image */}
                  <Image
                    source={{ uri: item.cover_url }}
                    className="w-[68px] h-[68px] rounded-full"
                  />
                </View>

              </LinearGradient>
            </TouchableOpacity>

            <Text
              className="text-xs mt-2 text-[#AFAFAF] text-center w-20"
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>)}
      />
    </View>
  );

  // ===========================
  // RENDER
  // ===========================
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
    <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-6">

        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-2xl font-extrabold text-white">
            Alumni Posts
          </Text>
        </View>

        <FlatList
          data={links}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.url)}
              onLongPress={() => {
                if (isAdmin) {
                  setSelectedPost(item.id);
                }
              }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 8 }}>

                {/* TOP IMAGE */}
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-52 rounded-t-2xl"
                  resizeMode="cover"
                />

                {/* BOTTOM SECTION */}
                <View className="px-4 py-4">
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: item.logo }}
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    />
                    <Text
                      className="ml-3 text-sm flex-1"
                      style={{ color: '#AFAFAF' }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>

              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {isAdmin && (
        <TouchableOpacity
          onPress={() => {
            if (selectedPost) {
              handleDelete(selectedPost);
              setSelectedPost(null);
            } else {
              // router.push("/AddLink");
              setAddModalVisible(true);
            }
          }}
          className={`absolute bottom-32 right-5 w-16 h-16 rounded-full items-center justify-center shadow-lg 
    ${selectedPost ? "bg-[#FF4F4F]" : "bg-[#569EE5]"}`}
        >
          {selectedPost ? (
            <Trash2 size={28} color="white" />
          ) : (
            <Plus size={35} color="white" />
          )}
        </TouchableOpacity>
      )}

      {/* Modal same as before */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={{ backgroundColor: '#19181B', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>

            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 24 }}>
              Manage Collection
            </Text>

            <TouchableOpacity
              style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}
              onPress={() => {
                setMenuVisible(false);
                setEditingCollectionId(selectedCollection?.id);
                setAddCollectionVisible(true);
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>Update Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}
              onPress={() => {
                setMenuVisible(false);
                setAddImagesVisible(true);
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>Add Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 16 }}
              onPress={() => {
                if (!selectedCollection?.id) return;
                Alert.alert("Delete Collection", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete", style: "destructive",
                    onPress: async () => {
                      const { error } = await supabase.from("collections").delete().eq("id", selectedCollection.id);
                      if (error) { Alert.alert("Error", "Something went wrong."); return; }
                      setMenuVisible(false);
                      setSelectedCollection(null);
                      fetchCollections();
                    },
                  },
                ]);
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#FF453A' }}>Delete Collection</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>
      <AddLinkModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
      <AddCollectionModal
        visible={addCollectionVisible}
        collectionId={editingCollectionId}
        onClose={() => {
          setAddCollectionVisible(false);
          setEditingCollectionId(null);
        }}
      />
      <AddCollectionImagesModal
        visible={addImagesVisible}
        collectionId={selectedCollection?.id}
        onClose={() => setAddImagesVisible(false)}
      />
    </SafeAreaView>
    </ImageBackground>
    </View>
  );
}