import React, { useMemo, useState } from "react";
import { View, Dimensions, ScrollView, Text, Image, TouchableOpacity, Modal,ImageSourcePropType} from "react-native";
import { Canvas, Path, BlurMask, Skia, Group } from "@shopify/react-native-skia";
import { Sparkles, GitGraph, Bot, Heart, Lightbulb, Code, Package, Link, SquareTerminal, LineSquiggle, GitCompareArrows, Cog, Layers2, Bubbles, Video, AudioLines, MicVocal, ChartNetwork, Film, Images, Wand, LayoutTemplate, Boxes, Earth, Smartphone } from 'lucide-react-native';
import { ROADMAP_PATH_STRING, ROADMAP_ITEMS } from "../../constants/roadmapData";
import { getIconComponent } from "../../componunts/RoadmapIcons";
import { ModalDataType } from "../../constants/roadmapData";
import { SvgProps } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const SVG_HEIGHT = 5509;

const ListIcon = ({ name }: { name: string }) => {
  // સાદા આઈકોન અથવા તમારા SVG અહી વાપરી શકો
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
  const skiaPath = useMemo(() => Skia.Path.MakeFromSVGString(ROADMAP_PATH_STRING), []);
  const xOffset = (screenWidth - 305) / 2;
  const yOffset = 50;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<ModalDataType | null>(null);

  const handleButtonPress = (item: any) => {
    if (item.modalData) {
      setSelectedData(item.modalData);
      setModalVisible(true);
    }
  };

  if (!skiaPath) return <View />;

  const renderItem = (item: any) => {
    const rotationDegree = item.rotation || 0;
    const itemScale = item.scale || 1;

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

    // ✅ --- CHANGE START: Simple Image with SVG & PNG Support ---
    if (item.type === 'simple-image') {
      const imgWidth = item.width || 50;
      const imgHeight = item.height || 50;

      // 1. ચેક કરો કે ઈમેજ SVG છે કે PNG
      const isSvg = typeof item.image === 'function';
      
      // 2. SVG Component માટે Type Cast
      const SvgComponent = item.image as React.FC<SvgProps>;

      return (
        <View key={item.id} style={[dynamicStyle, { alignItems: 'center', justifyContent: 'center' }]}>

          {/* જો SVG હોય તો SvgComponent વાપરો, નહિતર Image */}
          {isSvg ? (
            <SvgComponent width={imgWidth} height={imgHeight} />
          ) : (
            <Image
              // PNG માટે Type Cast
              source={item.image as ImageSourcePropType}
              style={{
                width: imgWidth,
                height: imgHeight,
                resizeMode: 'contain'
              }}
            />
          )}

          {/* લેબલ */}
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
    // ✅ --- CHANGE END ---

    // --- 1. PHOTO TYPE HANDLE ---
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

    // --- 2. BUTTON TYPE HANDLE ---
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

    // --- 3. OTHER ICONS ---
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

    // --- 4. LABEL BOX TYPE ---
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

  // ... બાકીનું return (...) કોડ જેમ હતું તેમ જ રાખો
  return (
    <View style={{ flex: 1, backgroundColor: "#F1F1F1", paddingTop: 50 }}>
      <ScrollView contentContainerStyle={{ height: SVG_HEIGHT + yOffset + 200 }}>
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={{ width: screenWidth, height: SVG_HEIGHT + yOffset }}>

            <Canvas style={{ width: screenWidth, height: SVG_HEIGHT + yOffset, position: 'absolute', top: 50, left: 0 }}>
              <Group transform={[{ translateX: xOffset }, { translateY: yOffset }]}>
                <Path path={skiaPath} color="rgba(0, 0, 0, 0.08)" style="stroke" strokeWidth={80} strokeCap="round" strokeJoin="round">
                  <BlurMask blur={25} style="normal" />
                </Path>
                <Path path={skiaPath} color="white" style="stroke" strokeWidth={60} strokeCap="round" strokeJoin="round" />
                <Path path={skiaPath} color="black" style="stroke" strokeWidth={50} strokeCap="round" strokeJoin="round" />
              </Group>
            </Canvas>

            {ROADMAP_ITEMS.map((item) => renderItem(item))}

          </View>
        </ScrollView>
      </ScrollView>
      
      {/* Modal Component Code... (જેમ હતું તેમ) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
         {/* ... તમારો મોડલ કોડ ... */}
         <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white w-full h-[85%] rounded-t-[35px] overflow-hidden">
            <View className="items-center pt-4 pb-2">
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
                    <View key={item.id} className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3">
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

            <TouchableOpacity className="absolute top-5 right-5 bg-gray-100 p-2 rounded-full" onPress={() => setModalVisible(false)}>
              <Text className="text-gray-500 font-bold text-xs">✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}