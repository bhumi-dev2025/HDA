// constant.ts
import type { CardData } from '../types';

export const INITIAL_CARDS: CardData[] = [
  {
    id: 1,
    type: 'Aadhar Card',
    issuer: 'UIDAI',
    number: 'XXXX XXXX 1234',
    name: 'Citizen Name',
    emoji: '🆔',
    gradientColors: ['#4ade80', '#14b8a6'], // Green to Teal
    textColor: 'text-white',
    isCustom: false,
  },
  {
    id: 2,
    type: 'PAN Card',
    issuer: 'Income Tax Dept.',
    number: 'ABCDE1234F',
    name: 'Citizen Name',
    emoji: '💳',
    gradientColors: ['#60a5fa', '#6366f1'], // Blue to Indigo
    textColor: 'text-white',
    isCustom: false,
  },
  {
    id: 3,
    type: "Driver's License",
    issuer: 'Transport Dept.',
    number: 'DL-XX-YYYY-ZZZZZZZ',
    name: 'Citizen Name',
    emoji: '🚗',
    gradientColors: ['#fb923c', '#eab308'], // Orange to Yellow
    textColor: 'text-black',
    isCustom: false,
  },
  {
    id: 4,
    type: 'Passport',
    issuer: 'Govt. of India',
    number: 'X1234567',
    name: 'Citizen Name',
    emoji: '🛂',
    gradientColors: ['#8b5cf6', '#2563eb'], // Purple to Blue
    textColor: 'text-white',
    isCustom: false,
  },
  {
    id: 5,
    type: 'Voter ID',
    issuer: 'Election Commission',
    number: 'XYZ1234567',
    name: 'Citizen Name',
    emoji: '🗳️',
    gradientColors: ['#374151', '#000000'], // Gray to Black
    textColor: 'text-white',
    isCustom: false,
  },
  {
    id: 6,
    type: 'RC Book',
    issuer: 'Transport Dept.',
    number: 'MH XX XX 1234',
    name: 'Citizen Name',
    emoji: '🏍️',
    gradientColors: ['#ef4444', '#b91c1c'], // Red to Dark Red
    textColor: 'text-white',
    isCustom: false,
  },
];

export const CARD_THEMES = [
  { name: 'Sky', gradientColors: ['#38bdf8', '#3b82f6'], textColor: 'text-white' },
  { name: 'Rose', gradientColors: ['#fb7185', '#ef4444'], textColor: 'text-white' },
  { name: 'Amber', gradientColors: ['#fcd34d', '#fb923c'], textColor: 'text-black' },
  { name: 'Lime', gradientColors: ['#bef264', '#4ade80'], textColor: 'text-black' },
  { name: 'Violet', gradientColors: ['#8b5cf6', '#9333ea'], textColor: 'text-white' },
  { name: 'Slate', gradientColors: ['#64748b', '#4b5563'], textColor: 'text-white' },
];