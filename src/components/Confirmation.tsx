import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button, Icon, usePalette } from '../ui/components';
export interface ConfirmationRequest {
  title: string;
  message: string;
  label: string;
  danger?: boolean;
  confirm: () => void;
}
export function Confirmation({
  request,
  onClose,
}: {
  request: ConfirmationRequest | null;
  onClose: () => void;
}) {
  const p = usePalette();
  return (
    <Modal transparent visible={!!request} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          accessibilityViewIsModal
          style={[styles.dialog, { backgroundColor: p.surface, borderColor: p.border }]}
        >
          <Icon
            name={request?.danger ? 'alert-circle-outline' : 'eye-outline'}
            size={32}
            color={request?.danger ? p.danger : p.accent}
          />
          <Text accessibilityRole="header" style={[styles.title, { color: p.text }]}>
            {request?.title}
          </Text>
          <Text style={[styles.message, { color: p.muted }]}>{request?.message}</Text>
          <Button
            label={request?.label ?? 'Confirmar'}
            variant={request?.danger ? 'danger' : 'primary'}
            onPress={() => {
              const action = request?.confirm;
              onClose();
              action?.();
            }}
          />
          <Button label="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  dialog: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    borderRadius: 28,
    borderWidth: 1,
    padding: 26,
    gap: 18,
  },
  title: { fontSize: 25, fontWeight: '800' },
  message: { fontSize: 16, lineHeight: 24 },
});
