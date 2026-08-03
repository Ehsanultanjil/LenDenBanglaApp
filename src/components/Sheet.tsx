import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Text } from './AppText';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  useEffect(() => {
    if (open) ref.current?.snapToIndex(0);
    else ref.current?.close();
  }, [open]);

  return (
    <View pointerEvents={open ? 'auto' : 'none'} className="absolute inset-0 z-50">
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        onClose={onClose}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: '#111827' }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(148,163,184,0.3)' }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.85} />
        )}
      >
        <BottomSheetView className="pb-8">
          {title && (
            <View className="px-5 pb-4">
              <Text className="text-xl font-bold text-text-primary">{title}</Text>
            </View>
          )}
          {children}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
