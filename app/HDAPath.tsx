import React, { useState } from 'react';
import {
  View, Text, ScrollView,
  Dimensions, ImageBackground, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlignJustify } from 'lucide-react-native';
import { AppBottomSheet } from '../componunts/Modals/modals2.0/AppBottomSheet';
import PathButton from '../componunts/PathButton';
import { HDA_LESSONS, Lesson } from '../constants/hdaPathData';

const { width: W } = Dimensions.get('window');
const homeBg   = require('../assets/photo/login/2.0/home.png');
const buttonBg = require('../assets/2.0/model/button.png');

const ZIGZAG = [0.5, 0.68, 0.78, 0.68, 0.5, 0.32, 0.22, 0.32];
const VGAP   = 120;

export default function HDAPath() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected]   = useState<Lesson | null>(null);

  const openLesson = (lesson: Lesson) => {
    setSelected(lesson);
    setSheetOpen(true);
  };

  const totalHeight = HDA_LESSONS.length * VGAP + 200;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ImageBackground source={homeBg} resizeMode="cover" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>

          {/* Top Chapter Header */}
          <View style={{
            marginHorizontal: 16, marginTop: 8, marginBottom: 4,
            backgroundColor: 'rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <View>
              <Text style={{ color: '#636366', fontSize: 11, fontWeight: '600', marginBottom: 3 }}>
                {HDA_LESSONS[0].chapter}
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                {HDA_LESSONS[0].chapterTitle}
              </Text>
            </View>
            <AlignJustify size={20} color="#636366" />
          </View>

          {/* Scrollable Path */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ height: totalHeight, paddingTop: 48, paddingBottom: 80 }}
          >
            {HDA_LESSONS.map((lesson, index) => {
              const xFrac    = ZIGZAG[index % ZIGZAG.length];
              const xPos     = W * xFrac - 40;
              const yPos     = index * VGAP + 20;
              const prevWeek = index === 0 ? null : HDA_LESSONS[index - 1].week;
              const showWeek = prevWeek !== lesson.week;

              return (
                <View key={lesson.id}>
                  {/* Week label */}
                  {showWeek && (
                    <View style={{
                      position: 'absolute', top: yPos - 30, left: 16,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                    }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                        Week {lesson.week}
                      </Text>
                    </View>
                  )}

                  {/* Button */}
                  <View style={{ position: 'absolute', top: yPos, left: xPos }}>
                    <PathButton
                      icon={lesson.icon}
                      onPress={() => openLesson(lesson)}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>

        </SafeAreaView>
      </ImageBackground>

      {/* AppBottomSheet — tab bar ની આગળ */}
      <AppBottomSheet
        isVisible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        enableDynamicSizing
      >
        {selected && (
          <View style={{ paddingTop: 8, paddingBottom: 16 }}>

            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
              }}>
                <Image source={selected.icon} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
            </View>

            <Text style={{ color: '#636366', fontSize: 12, textAlign: 'center', marginBottom: 4 }}>
              {selected.chapter}
            </Text>

            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 }}>
              {selected.title}
            </Text>

            <View style={{ marginBottom: 28, gap: 10 }}>
              {selected.bullets.map((b, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#636366', marginTop: 7 }} />
                  <Text style={{ color: '#AFAFAF', fontSize: 14, flex: 1, lineHeight: 22 }}>{b}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={() => setSheetOpen(false)} activeOpacity={0.85}>
              <ImageBackground
                source={buttonBg}
                style={{ width: '100%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 18, overflow: 'hidden' }}
                imageStyle={{ borderRadius: 18 }}
                resizeMode="cover"
              >
                <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: 0.3 }}>
                  Continue
                </Text>
              </ImageBackground>
            </TouchableOpacity>

          </View>
        )}
      </AppBottomSheet>

    </View>
  );
}
