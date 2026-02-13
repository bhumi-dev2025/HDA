import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { 
  BottomSheetModal, 
  BottomSheetView, 
  BottomSheetBackdrop, 
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';

// Props નો Type (જો ભવિષ્યમાં કંઈ ડેટા પાસ કરવો હોય તો)
interface DeleteAccountModalProps {
  onConfirm: () => void; // Delete બટન દબાવે ત્યારે શું કરવું
}

const DeleteAccountModal = forwardRef<BottomSheetModal, DeleteAccountModalProps>(({ onConfirm }, ref) => {
  
  // --- Snap Points (38% Height) ---
  const snapPoints = useMemo(() => ['38%'], []);

  // --- Backdrop (Dim Background) ---
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  // --- Close Function (Internal) ---
  const handleClose = () => {
    // @ts-ignore
    ref?.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={{ borderRadius: 24 }}
    >
      <BottomSheetView className="flex-1 items-center px-6 pt-4 pb-6 justify-between">
        
        <View className="items-center w-full">
          {/* Icon */}
          <View className="bg-red-50 p-4 rounded-full mb-8">
            <TriangleAlert size={32} color="#EF4444" />
          </View>

          {/* Title */}
          <Text className="text-lg font-bold text-center text-black mb-2">
            Are you sure you want to delete your account?
          </Text>

          {/* Description */}
          <Text className="text-center text-gray-500 text-sm mb-8 leading-5 px-2">
            This action will begin the deletion process. All of your data will be permanently removed.
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full mb-6">
          <TouchableOpacity 
            className="bg-black w-full py-4 rounded-xl items-center mb-3"
            onPress={() => {
              onConfirm(); // Parent ને જાણ કરો
              handleClose();
            }}
          >
            <Text className="text-white font-semibold text-base">Confirm Deletion</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleClose} 
            className="py-2 w-full items-center"
          >
            <Text className="text-gray-600 font-medium text-base">Cancel now</Text>
          </TouchableOpacity>
        </View>

      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default DeleteAccountModal;