import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { Player } from '../domain/types';
import { Icon, usePalette } from '../ui/components';

interface PlayerOrderProps {
  players: Player[];
  onMove: (from: number, to: number) => void;
}

interface OrderRowProps {
  player: Player;
  index: number;
  count: number;
  height: number;
  onMove: PlayerOrderProps['onMove'];
}

function OrderRow({ player, index, count, height, onMove }: OrderRowProps) {
  const palette = usePalette();
  const translation = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,
        onPanResponderGrant: () => setDragging(true),
        onPanResponderMove: (_, gesture) => translation.setValue(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          const destination = Math.max(
            0,
            Math.min(count - 1, index + Math.round(gesture.dy / height)),
          );
          translation.setValue(0);
          setDragging(false);
          if (destination !== index) onMove(index, destination);
        },
        onPanResponderTerminate: () => {
          translation.setValue(0);
          setDragging(false);
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [count, height, index, onMove, translation],
  );

  return (
    <Animated.View
      style={[
        styles.row,
        {
          height: height - 8,
          marginBottom: 8,
          backgroundColor: palette.surface,
          borderColor: dragging ? palette.accent : palette.border,
          zIndex: dragging ? 10 : 0,
          elevation: dragging ? 8 : 0,
          transform: [{ translateY: translation }],
        },
      ]}
    >
      <View style={[styles.number, { backgroundColor: palette.surface2 }]}>
        <Text style={[styles.numberText, { color: palette.accent }]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
      </View>
      <Text numberOfLines={1} style={[styles.name, { color: palette.text }]}>
        {player.name}
      </Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mover ${player.name} para cima`}
          accessibilityState={{ disabled: index === 0 }}
          disabled={index === 0}
          onPress={() => onMove(index, index - 1)}
          style={[styles.moveButton, { opacity: index === 0 ? 0.3 : 1 }]}
        >
          <Icon name="chevron-up" size={20} color={palette.muted} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mover ${player.name} para baixo`}
          accessibilityState={{ disabled: index === count - 1 }}
          disabled={index === count - 1}
          onPress={() => onMove(index, index + 1)}
          style={[styles.moveButton, { opacity: index === count - 1 ? 0.3 : 1 }]}
        >
          <Icon name="chevron-down" size={20} color={palette.muted} />
        </Pressable>
      </View>
      <View
        {...responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Ordem de ${player.name}: ${index + 1} de ${count}`}
        accessibilityHint="Arraste para mudar a posição ou use os botões de mover."
        accessibilityActions={[
          { name: 'decrement', label: 'Mover para cima' },
          { name: 'increment', label: 'Mover para baixo' },
        ]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'decrement' && index > 0) onMove(index, index - 1);
          if (nativeEvent.actionName === 'increment' && index < count - 1) onMove(index, index + 1);
        }}
        style={styles.handle}
      >
        <Icon name="reorder-two" size={26} color={palette.muted} />
      </View>
    </Animated.View>
  );
}

export function PlayerOrder({ players, onMove }: PlayerOrderProps) {
  const { fontScale } = useWindowDimensions();
  const rowHeight = Math.max(82, Math.round(70 * fontScale));
  return (
    <View style={styles.list}>
      {players.map((player, index) => (
        <OrderRow
          key={player.id}
          player={player}
          index={index}
          count={players.length}
          height={rowHeight}
          onMove={onMove}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 3,
  },
  number: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  name: { flex: 1, fontSize: 17, fontWeight: '600' },
  controls: { flexDirection: 'row' },
  moveButton: { width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
