import React from 'react';
import Svg, { Path } from 'react-native-svg';
// native wind ne svg ma use krva mate ..
import { cssInterop } from 'nativewind';

// Enable className support for Svg component
cssInterop(Svg, {
  className: {
    target: "style",
  },
});

export const BackArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </Svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12m6-6H6" />
  </Svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </Svg>
);

export const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </Svg>
);