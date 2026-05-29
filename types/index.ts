import React from 'react';
import { ViewStyle, ImageSourcePropType } from 'react-native';
import { SvgProps } from 'react-native-svg';

// database types..(backend data types)
export interface PortfolioItem {
  id: string;
  link: string;
  title: string;
  image_url?: string;
}

export interface TaskItem {
  text: string;
  isDone: boolean;
}

export type TimeData = {
  hour: string;
  minute: string;
  // Sleep mate — exact bedtime/wakeup restore karva
  bedH?: number;
  bedM?: number;
  wakeH?: number;
  wakeM?: number;
};

// TrackerService
export type DailyData = {
  meditation?: string;
  water?: number;
  steps?: string;
  sleep?: TimeData;
  workout?: TimeData;
  todos?: TaskItem[];
  score?: number;
};

//roadmapData.ts
export interface LearningItem {
  id: string;
  title: string;
  desc: string;
  iconName: string;
}

export interface ModalDataType {
  title: string;
  subtitle?: string;
  description: string;
  image: any;      
  logo?: any;      
  link?: string;
  learningList?: LearningItem[];
}

export interface RoadmapItemType {
    id: number;
    type: 'start' | 'end' | 'lock' | 'flag' | 'photo' | 'button' | 'simple-image' | 'label';
    x: number;
    y: number;
    label?: string;
    rotation?: number;
    scale?: number;
    width?: number;
    height?: number;
    image?: ImageSourcePropType | React.FC<SvgProps>;
    labelConfig?: {
        x: number;
        y: number;
        rotation: number;
        fontSize: number;
        color: string;
    };
    style?: ViewStyle;
    textStyle?: any;
    modalData?: ModalDataType;
}

// home.tsx
// Home Screen Types
export type HomeModalType = 'meditation' | 'water' | 'todo' | 'step' | 'sleep' | 'workout'| null;
export type HomeModalData = string | number | TimeData | TaskItem[];
export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  heightClass?: string;
  className?: string;
}

//components prompt..

// Ruler.tsx
export interface RulerProps {
  min: number;
  max: number;
  initialValue: number;
  onValueChange: (value: string) => void;
}

// Score.tsx
export interface ScoreChartProps {
  score?: number;
}

//timePicker.tsx
export interface CustomTimePickerProps {
  onTimeChange: (hour: string, minute: string) => void;
  initialHour?: string;
  initialMinute?: string;
}

//modals...
// base modal je badha ma use thy
export interface BaseModalProps {
  isVisible: boolean;
  onClose: () => void;
}

//universalModal.tsx
export interface UniversalModalProps extends BaseModalProps {
  children: React.ReactNode;
  modalClassName?: string;
  customStyle?: ViewStyle;
}

//AddprotfolioModal.tsx
export interface PortfolioModalProps extends BaseModalProps {
  onSave: (link: string, title: string, image: string) => void; 
}

//AddSkils.tsx
export interface ExpertiseModalProps extends BaseModalProps {
  onSave: (selectedIds: string[]) => void;
  initialSelectedSkills: string[];
}

//MaditationModal.tsx
export interface MeditationModalProps extends BaseModalProps {
  onSave: (time: string) => void;
  initialValue?: string;
}

//SleepModel.tsx
export interface SleepModalProps extends BaseModalProps {
  onSave: (time: { hour: string; minute: string }) => void;
  initialValue?: { hour: string; minute: string };
}

//stepsModel.tsx
export interface StepPickerModalProps extends BaseModalProps {
  onSave: (value: string) => void;
  initialValue?: string;
}

//TodoModal.tsx
export interface TaskModalProps extends BaseModalProps {
  onSave: (tasks: TaskItem[]) => void;
  initialTasks?: any[];
}

//waterModal.tsx
export interface WaterTrackerModalProps extends BaseModalProps{
    onSave: (liters: number) => void;
  initialValue?: number;
}

//workoutModel.tsx
export interface WorkoutModalProps extends BaseModalProps {
    isVisible: boolean;
  onSave: (time: { hour: string; minute: string }) => void;
  initialValue?: { hour: string; minute: string };
}

//setting Screens...

//unit.tsx
export type UnitOption = string;
export interface UnitSectionProps {
  title: string;
  options: UnitOption[];
  selected: UnitOption;
  onSelect: (option: UnitOption) => void;
}

//wallet mate 
export interface CardData {
  id: number;
  type: string;
  issuer: string;
  number: string;
  name: string;
  emoji: string;
  gradientColors: [string, string, ...string[]];
  textColor: string;
  isCustom?: boolean;
  imageUri?: string;
}

//AddEditCardModal.tsx
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CardData, 'id' | 'isCustom'>) => void;
  initialData: CardData | null;
}

//card.tsx
export interface CardPro {
  card: CardData;
  isSelected: boolean;
  index: number;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

