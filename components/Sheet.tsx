import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors, Radii } from '@/constants/Colors';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const Sheet = ({ visible, title, onClose, children }: SheetProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [renderVisible, setRenderVisible] = useState(visible);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (visible) {
      setRenderVisible(true);
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (renderVisible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setRenderVisible(false);
        }
      });
    }
  }, [visible, renderVisible, screenHeight, translateY, backdropOpacity]);

  return (
    <Modal
      transparent
      presentationStyle="overFullScreen"
      visible={renderVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} pointerEvents="auto">
          <Animated.View style={[styles.backdropContent, { opacity: backdropOpacity }]}>
            <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFillObject} />
            <View style={styles.dimmer} />
          </Animated.View>
        </Pressable>
        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]} pointerEvents="box-none">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
          >
            <View style={[styles.sheet, { paddingBottom: Math.max(24, insets.bottom), maxHeight: undefined }]}>
              <View style={styles.handle} />
              <Text style={styles.title}>{title}</Text>
              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropContent: {
    ...StyleSheet.absoluteFillObject,
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  sheetWrap: {
    width: '100%',
    justifyContent: 'flex-end',
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: Colors.shadowCard,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    overflow: 'hidden',
    marginBottom: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.foreground,
    textAlign: 'center',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
});
