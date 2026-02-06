// wallet/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Pressable, Alert, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
// FileSystem નો ઈમ્પોર્ટ નીચે મુજબ જ રાખજો (Error ફિક્સ કરવા)
import * as FileSystem from 'expo-file-system/legacy';

import { Header } from '../../componunts/wallet/Header';
import { Card } from '../../componunts/wallet/Card';
import { AddEditCardModal } from '../../componunts/wallet/AddEditCardModal';
import { INITIAL_CARDS } from '../../constants/constant';
import type { CardData } from '../../types';

const STORAGE_KEY = 'wallet_cards'; // મેં કી બદલી છે જેથી જૂનો ખરાબ ડેટા પ્રોબ્લેમ ન કરે

const index = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);

  // --- 1. એપ ખુલે ત્યારે ડેટા લોડ કરો ---
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      console.log("Loading cards...");
      const storedCards = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedCards !== null) {
        const parsedCards = JSON.parse(storedCards);
        setCards(parsedCards);
        console.log("Found saved cards:", parsedCards.length);
      } else {
        console.log("No saved cards, loading defaults.");
        setCards(INITIAL_CARDS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CARDS));
      }
    } catch (e) {
      console.error("Failed to load cards:", e);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. ફોટો સેવ કરવાનું ફંક્શન (વધારે સુરક્ષિત) ---
  const saveImagePermanently = async (uri: string) => {
    if (!uri) return '';
    try {
      if (uri.startsWith('http') || uri.startsWith('https')) {
        return uri;
      }
      // @ts-ignore
      if (uri.includes(FileSystem.documentDirectory)) {
        return uri;
      }

      const filename = uri.split('/').pop();
      // @ts-ignore
      const newPath = FileSystem.documentDirectory + (filename || `card_${Date.now()}.jpg`);

      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });
      
      console.log("Image saved to:", newPath);
      return newPath;
    } catch (error) {
      console.log("Image save error (keeping original):", error);
      return uri;
    }
  };

  // --- 3. સ્ટોરેજમાં સેવ કરવાનું ફંક્શન ---
  const saveCardsToStorage = async (newCards: CardData[]) => {
    try {
      setCards(newCards); // UI અપડેટ
      const jsonValue = JSON.stringify(newCards);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue); // મેમરીમાં સેવ
      console.log("Data Saved Successfully!"); // ટર્મિનલમાં ચેક કરજો
    } catch (e) {
      console.error("Save error:", e);
      Alert.alert("Error", "Could not save data.");
    }
  };

  // --- UI Handlers ---

  const handleCardClick = (clickedCardId: number) => {
    if (isModalOpen) return;
    setSelectedCardId(clickedCardId);
    
    // કાર્ડને ક્લિક કરવા પર ઉપર લાવવું (Optional)
    setCards(prevCards => {
      const clickedCard = prevCards.find(c => c.id === clickedCardId);
      if (!clickedCard) return prevCards;
      const otherCards = prevCards.filter(c => c.id !== clickedCardId);
      return [clickedCard, ...otherCards];
    });
  };

  const handleBackgroundClick = () => {
    if (isModalOpen) return;
    setSelectedCardId(null);
  };

  const handleOpenEditModal = (card: CardData) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  // --- Save Button Click ---
  const handleSaveCard = async (cardData: Omit<CardData, 'id'>) => {
    try {
      // 1. ફોટો સેવ કરવાનો પ્રયત્ન
      let finalImageUri = cardData.imageUri;
      if (cardData.imageUri) {
          finalImageUri = await saveImagePermanently(cardData.imageUri);
      }

      // 2. ડેટા તૈયાર કરો (જો કલર ન હોય તો ડિફોલ્ટ મૂકો)
      const safeCardData = {
        ...cardData,
        imageUri: finalImageUri,
        // જો કલર પસંદ કરવાનું કાઢી નાખ્યું હોય, તો ડિફોલ્ટ કલર અહીં સેટ થશે
        gradientColors: cardData.gradientColors || ['#38bdf8', '#3b82f6'], 
        textColor: cardData.textColor || 'text-white'
      };

      let newCardsList: CardData[];

      if (editingCard) {
        // Edit Mode
        newCardsList = cards.map(c => (c.id === editingCard.id ? { ...editingCard, ...safeCardData } : c));
      } else {
        // Add Mode (નવું કાર્ડ લિસ્ટમાં સૌથી ઉપર)
        const newCard: CardData = {
          id: Date.now(),
          ...safeCardData,
          isCustom: true
        };
        newCardsList = [newCard, ...cards];
      }

      // 3. ફાઈનલ સેવ
      await saveCardsToStorage(newCardsList);
      handleCloseModal();
      
    } catch (error) {
      console.error("Error in handleSaveCard:", error);
      Alert.alert("Error", "Something went wrong while saving.");
    }
  };

  const handleDeleteCard = (cardId: number) => {
    // Alert.alert("Confirm Delete", "Are you sure?", [
    //   { text: "Cancel", style: "cancel" },
    //   {
    //     text: "Delete",
    //     style: "destructive",
    //     onPress: async () => {
    //       const newCardsList = cards.filter(c => c.id !== cardId);
    //       await saveCardsToStorage(newCardsList);
    //       setSelectedCardId(null);
    //     }
    //   }
    // ]);
    Alert.alert("Cannot Delete", "Default cards cannot be deleted.");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F2F2F2]">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-500">Loading Wallet...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2]">
      <Header onAddPress={() => {
          setEditingCard(null);
          setIsModalOpen(true);
      }} />
      
      <View className="flex-1 flex-col w-full max-w-md mx-auto relative">
        <Pressable 
          className="flex-1 p-4 relative"
          onPress={handleBackgroundClick}
        >
          <View className="relative h-full">
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                isSelected={selectedCardId === card.id}
                index={index}
                onPress={() => handleCardClick(card.id)}
                onEdit={() => handleOpenEditModal(card)}
                onDelete={() => handleDeleteCard(card.id)}
              />
            ))}
          </View>
        </Pressable>

        <AddEditCardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCard}
          initialData={editingCard}
        />
      </View>
    </SafeAreaView>
  );
};

export default index;