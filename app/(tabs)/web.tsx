import React, { useMemo, useState, useRef } from "react";
import { View, Dimensions, ScrollView, Text, Image, TouchableOpacity, Modal, ImageSourcePropType, PanResponder, Animated, PanResponderInstance } from "react-native";
// ✅ Skia કાઢી નાખ્યું છે
// ✅ NEW IMPORT: react-native-svg added
import Svg, { Path as SvgPath, G } from "react-native-svg";
import { SvgProps } from "react-native-svg";

import { Sparkles, GitGraph, Bot, Heart, Lightbulb, Code, Package, Link, SquareTerminal, LineSquiggle, GitCompareArrows, Cog, Layers2, Bubbles, Video, AudioLines, MicVocal, ChartNetwork, Film, Images, Wand, LayoutTemplate, Boxes, Earth, Smartphone } from 'lucide-react-native';
import { useRouter } from "expo-router";

// તમારી Constants ફાઈલ માંથી આ ડેટા આવે છે એમ માની લઉં છું
import { ROADMAP_PATH_STRING, ROADMAP_ITEMS} from "../../constants/roadmapData";
import { getIconComponent } from "../../componunts/RoadmapIcons";
import { ModalDataType,RoadmapItemType } from "../../types";

const { width: screenWidth } = Dimensions.get("window");
const SVG_HEIGHT = 5509;

// --- List Icon Component ---
const ListIcon = ({ name }: { name: string }) => {
  if (name === 'bot') return <Bot size={24} color="#333" />;
  if (name === 'diagram') return <GitGraph size={24} color="#333" />;
  if (name === 'ai') return <Sparkles size={24} color="#333" />;
  if (name === 'idea') return <Lightbulb size={24} color="#333" />;
  if (name === 'code') return <Code size={24} color="#333" />;
  if (name === 'model') return <Package size={24} color="#333" />;
  if (name === 'api') return <Link size={24} color="#333" />;
  if (name === 'settings') return <SquareTerminal size={24} color="#333" />;
  if (name === 'design') return <LineSquiggle size={24} color="#333" />;
  if (name === 'prototype') return <GitCompareArrows size={24} color="#333" />;
  if (name === 'system') return <Cog size={24} color="#333" />;
  if (name === 'layout') return <Layers2 size={24} color="#333" />;
  if (name === 'animation') return <Bubbles size={24} color="#333" />;
  if (name === 'video') return <Video size={24} color="#333" />;
  if (name === 'audio') return <AudioLines size={24} color="#333" />;
  if (name === 'mic') return <MicVocal size={24} color="#333" />;
  if (name === 'graph') return <ChartNetwork size={24} color="#333" />;
  if (name === 'reel') return <Film size={24} color="#333" />;
  if (name === 'image') return <Images size={24} color="#333" />;
  if (name === 'magic') return <Wand size={24} color="#333" />;
  if (name === 'template') return <LayoutTemplate size={24} color="#333" />;
  if (name === 'cube') return <Boxes size={24} color="#333" />;
  if (name === 'web') return <Earth size={24} color="#333" />;
  if (name === 'export') return <Smartphone size={24} color="#333" />;
  return <View className="w-6 h-6 bg-gray-400 rounded-full" />;
};

export default function RoadmapScreen() {
  const router = useRouter();
  
  // ❌ Removed Skia Path logic
  // const skiaPath = useMemo(() => Skia.Path.MakeFromSVGString(ROADMAP_PATH_STRING), []);

  const xOffset = (screenWidth - 305) / 2;
  const yOffset = 50;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<ModalDataType | null>(null);

  // --- Animation Value for Swipe Down ---
  const panY = useRef(new Animated.Value(0)).current;

  // --- PanResponder for Handling Swipe Gestures ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // માત્ર નીચે તરફ (Positive Y) ડ્રેગ કરવા દઈએ
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // જો યુઝરે 150 પિક્સેલ થી વધારે નીચે ખેંચ્યું હોય તો મોડલ બંધ કરો
        if (gestureState.dy > 150) {
          setModalVisible(false);
          panY.setValue(0); // Reset position
        } else {
          // નહિતર પાછું ઉપર સ્પ્રિંગ જેવું લાવો
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 10
          }).start();
        }
      },
    })
  ).current;

  const handleButtonPress = (item: any) => {
    if (item.modalData) {
      setSelectedData(item.modalData);
      setModalVisible(true);
      panY.setValue(0); // Reset animation when opening
    }
  };

  const renderItem = (item: RoadmapItemType) => {
    const rotationDegree = item.rotation || 0;
    const itemScale = item.scale || 1;

    // TypeScript: dynamicStyle definition
    const dynamicStyle: any = {
      position: 'absolute',
      top: item.y + yOffset,
      left: item.x + xOffset,
      transform: [
        { rotate: `${rotationDegree}deg` },
        { scale: itemScale }
      ]
    };

    const labelX = item.labelConfig?.x ?? 0;
    const labelY = item.labelConfig?.y ?? 0;
    const labelRotation = item.labelConfig?.rotation ?? 0;
    const labelColor = item.labelConfig?.color ?? 'black';
    const labelSize = item.labelConfig?.fontSize ?? 12;

    // --- SIMPLE IMAGE TYPE ---
    if (item.type === 'simple-image') {
      const imgWidth = item.width || 50;
      const imgHeight = item.height || 50;
      const isSvg = typeof item.image === 'function';
      const SvgComponent = item.image as React.FC<SvgProps>;

      return (
        <View key={item.id} style={[dynamicStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          {isSvg ? (
            <SvgComponent width={imgWidth} height={imgHeight} />
          ) : (
            <Image
              source={item.image as ImageSourcePropType}
              style={{
                width: imgWidth,
                height: imgHeight,
                resizeMode: 'contain'
              }}
            />
          )}
          {item.label && (
            <Text style={{
              position: 'absolute',
              color: labelColor,
              fontWeight: 'bold',
              fontSize: labelSize,
              transform: [{ rotate: `${labelRotation}deg` }],
              top: labelY || imgHeight + 5,
              left: labelX,
              textAlign: 'center',
              width: 150, marginLeft: -75
            }}>
              {item.label}
            </Text>
          )}
        </View>
      );
    }

    // --- PHOTO TYPE ---
    if (item.type === 'photo') {
      const icon = getIconComponent(item);
      return (
        <View key={item.id} style={[dynamicStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          {icon}
          {item.label && (
            <Text style={{
              position: 'absolute',
              color: labelColor,
              fontWeight: 'bold',
              fontSize: labelSize,
              transform: [{ rotate: `${labelRotation}deg` }],
              top: labelY,
              left: labelX,
              textAlign: 'center',
              width: 150, marginLeft: -75
            }}>
              {item.label}
            </Text>
          )}
        </View>
      );
    }

    // --- BUTTON TYPE ---
    if (item.type === 'button') {
      const icon = getIconComponent(item);
      return (
        <TouchableOpacity
          key={item.id}
          style={[dynamicStyle, { alignItems: 'center', justifyContent: 'center' }]}
          onPress={() => handleButtonPress(item)}
          activeOpacity={0.8}
        >
          {icon}
          {item.label && (
            <Text style={{
              position: 'absolute',
              color: labelColor,
              fontWeight: 'bold',
              fontSize: labelSize,
              transform: [{ rotate: `${labelRotation}deg` }],
              top: labelY,
              left: labelX,
              textAlign: 'center',
              width: 120, marginLeft: -60
            }}>
              {item.label}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    // --- OTHER ICONS ---
    const iconComponent = getIconComponent(item);
    if (iconComponent) {
      return (
        <View key={item.id} style={[dynamicStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          {iconComponent}
          {item.label && (
            <Text style={{
              position: 'absolute',
              color: labelColor,
              fontWeight: 'bold',
              fontSize: labelSize,
              transform: [{ rotate: `${labelRotation}deg` }],
              top: labelY,
              left: labelX,
              textAlign: 'center',
              width: 120, marginLeft: -60
            }}>
              {item.label}
            </Text>
          )}
        </View>
      );
    }

    // --- LABEL TYPE ---
    if (item.type === 'label') {
      const boxBackgroundColor = item.style?.backgroundColor || 'white';
      const defaultTextColor = boxBackgroundColor === 'black' ? 'white' : 'black';

      return (
        <View key={item.id} style={[dynamicStyle, { padding: 10, ...item.style }]}>
          <Text style={[
            {
              fontWeight: 'bold',
              color: defaultTextColor,
              textAlign: 'center',
            },
            item.textStyle
          ]}>
            {item.label}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black", paddingTop: 50 }}>
      <ScrollView contentContainerStyle={{ height: SVG_HEIGHT + yOffset + 200 }}>
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={{ width: screenWidth, height: SVG_HEIGHT + yOffset }}>

            {/* ✅ UPDATED: Used react-native-svg instead of Skia */}
            <Svg 
              height={SVG_HEIGHT + yOffset} 
              width={screenWidth} 
              style={{ position: 'absolute', top: 50, left: 0 }}
            >
              <G x={xOffset} y={yOffset}>
                {/* 1. Shadow Layer */}
                <SvgPath
                  d={ROADMAP_PATH_STRING}
                  stroke="rgba(0,0,0,0.08)" // Light shadow color
                  strokeWidth="80"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                
                {/* 2. White Border Layer */}
                <SvgPath
                  d={ROADMAP_PATH_STRING}
                  stroke="white"
                  strokeWidth="60"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* 3. Black Inner Line Layer */}
                <SvgPath
                  d={ROADMAP_PATH_STRING}
                  stroke="black"
                  strokeWidth="50"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </G>
            </Svg>

            {/* Items Rendering (No Changes needed here) */}
            {ROADMAP_ITEMS.map((item) => renderItem(item))}

          </View>
        </ScrollView>
      </ScrollView>
      
      {/* --- Modal Section --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <Animated.View 
            style={{ 
              transform: [{ translateY: panY }] 
            }}
            className="bg-white w-full h-[85%] rounded-t-[35px] overflow-hidden"
          >
            {/* Header / Grab Bar */}
            <View 
              {...panResponder.panHandlers} 
              className="items-center pt-4 pb-2 w-full bg-white z-10"
            >
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {selectedData && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                <View className="mx-5 mt-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  {selectedData.image && (
                    <Image source={selectedData.image} className="w-full h-40 resize-cover" />
                  )}
                  <View className="flex-row items-center p-4">
                    {selectedData.logo ? (
                      <Image source={selectedData.logo} className="w-12 h-12 rounded-full mr-3 border border-gray-100" />
                    ) : (
                      <View className="w-12 h-12 bg-gray-200 rounded-full mr-3" />
                    )}
                    <View>
                      <Text className="text-xl font-bold text-black">{selectedData.title}</Text>
                      {selectedData.subtitle && <Text className="text-gray-500 text-sm font-medium">{selectedData.subtitle}</Text>}
                    </View>
                  </View>
                </View>

                <Text className="text-center text-lg font-bold text-black mt-8 mb-4">What you will learn?</Text>

                <View className="px-5">
                  {selectedData.learningList?.map((item, index) => (
                    <View key={item.id || index} className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3">
                      <View className="w-10 h-10 items-center justify-center mr-4">
                        <ListIcon name={item.iconName} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-black">{item.title}</Text>
                        <Text className="text-gray-500 text-sm mt-0.5">{item.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View className="items-center mt-10 mb-5">
                  <Heart size={24} color="#FF4D4D" fill="#FF4D4D" />
                  <Text className="text-gray-400 text-xs font-medium mt-2">Human Design Academy</Text>
                  <Text className="text-gray-300 text-[10px] mt-0.5">Designed by Simple Studio</Text>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}