import React, { useState } from 'react';
import { View, Pressable, Alert, Platform } from 'react-native';
import { Header } from '../../componunts/wallet/Header';
import { Card } from '../../componunts/wallet/Card';
import { AddEditCardModal } from '../../componunts/wallet/AddEditCardModal';
import { INITIAL_CARDS } from '../../constants/constant';
import type { CardData } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';

const index = () => {
  const [cards, setCards] = useState<CardData[]>(INITIAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);

  const handleCardClick = (clickedCardId: number) => {
    if (isModalOpen) return;
    setSelectedCardId(clickedCardId);
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

  const handleSaveCard = (cardData: Omit<CardData, 'id'>) => {
    if (editingCard) {
      // Update existing card
      setCards(cards.map(c => (c.id === editingCard.id ? { ...editingCard, ...cardData } : c)));
    }
    handleCloseModal();
  };

  const handleDeleteCard = (cardId: number) => {
    const cardToDelete = cards.find(c => c.id === cardId);

    // Prevent deleting default cards
    if (cardToDelete && !cardToDelete.isCustom) {
      Alert.alert("Restricted", "Default documents cannot be deleted.");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this card?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setCards(cards.filter(c => c.id !== cardId));
            setSelectedCardId(null);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 flex-col w-full max-w-md mx-auto relative">
        <Header />
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
                onPress={() => {
                  handleCardClick(card.id);
                }}
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