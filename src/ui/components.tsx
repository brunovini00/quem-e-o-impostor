import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, type PropsWithChildren, type ReactNode } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens, usePalette, useReducedMotion } from './theme';
export { usePalette } from './theme';

export function Icon({ name, size = 22, color }: { name: string; size?: number; color?: string }) {
  const p = usePalette();
  const safeName =
    name in Ionicons.glyphMap ? (name as keyof typeof Ionicons.glyphMap) : 'ellipse-outline';
  return <Ionicons name={safeName} size={size} color={color ?? p.text} accessible={false} />;
}
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  icon?: string;
}) {
  const p = usePalette();
  const bg =
    variant === 'primary'
      ? p.accent
      : variant === 'danger'
        ? p.danger
        : variant === 'secondary'
          ? p.surface2
          : 'transparent';
  const fg = variant === 'primary' ? p.accentText : variant === 'danger' ? p.bg : p.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.42 : pressed ? 0.75 : 1 },
      ]}
    >
      {icon ? <Icon name={icon} color={fg} /> : null}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}
export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const p = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.border }, style]}>
      {children}
    </View>
  );
}
export function Label({ children }: PropsWithChildren) {
  const p = usePalette();
  return <Text style={[styles.label, { color: p.muted }]}>{children}</Text>;
}
export function Page({
  children,
  title,
  subtitle,
  onBack,
  footer,
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  footer?: ReactNode;
}>) {
  const p = usePalette();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.frame}>
          {onBack || title ? (
            <View style={styles.header}>
              {onBack ? (
                <Pressable
                  onPress={onBack}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                  style={[styles.back, { backgroundColor: p.surface }]}
                >
                  <Icon name="arrow-back" />
                </Pressable>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text accessibilityRole="header" style={[styles.title, { color: p.text }]}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={[styles.subtitle, { color: p.muted }]}>{subtitle}</Text>
                ) : null}
              </View>
            </View>
          ) : null}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { borderTopColor: p.border }]}>{footer}</View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function FadeIn({ children }: PropsWithChildren) {
  const reduce = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: reduce ? 0 : tokens.duration.short,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [opacity, reduce]);
  return <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>;
}
const styles = StyleSheet.create({
  frame: { flex: 1, width: '100%', maxWidth: tokens.maxWidth, alignSelf: 'center' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  back: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 25, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 18, flexGrow: 1 },
  footer: { paddingHorizontal: 24, paddingVertical: 14, borderTopWidth: 1, gap: 10 },
  card: { padding: 20, borderRadius: tokens.radius.md, borderWidth: 1, gap: 12 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
  button: {
    minHeight: 56,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
});
