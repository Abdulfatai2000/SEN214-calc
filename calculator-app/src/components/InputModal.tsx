import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme';

interface InputModalProps {
  visible: boolean;
  type: 'nPr' | 'nCr' | null;
  onClose: () => void;
  onSubmit: (n: number, r: number) => void;
}

export const InputModal: React.FC<InputModalProps> = ({
  visible,
  type,
  onClose,
  onSubmit,
}) => {
  const [nVal, setNVal] = useState('');
  const [rVal, setRVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      setNVal('');
      setRVal('');
      setErrorMsg('');
    }
  }, [visible]);

  const handleConfirm = () => {
    const n = parseInt(nVal, 10);
    const r = parseInt(rVal, 10);

    if (isNaN(n) || isNaN(r)) {
      setErrorMsg('Please enter valid integers.');
      return;
    }
    if (n < 0 || r < 0) {
      setErrorMsg('Inputs must be non-negative.');
      return;
    }
    if (r > n) {
      setErrorMsg('r cannot be greater than n.');
      return;
    }

    onSubmit(n, r);
  };

  if (!type) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {type === 'nPr' ? 'Permutations (nPr)' : 'Combinations (nCr)'}
            </Text>
            
            <Text style={styles.subtitle}>
              Compute {type === 'nPr' ? 'n! / (n - r)!' : 'n! / (r! × (n - r)!)'}
            </Text>

            <View style={styles.inputsRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>n value</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 5"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  value={nVal}
                  onChangeText={(val) => {
                    setNVal(val.replace(/[^0-9]/g, ''));
                    setErrorMsg('');
                  }}
                  autoFocus
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>r value</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 3"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  value={rVal}
                  onChangeText={(val) => {
                    setRVal(val.replace(/[^0-9]/g, ''));
                    setErrorMsg('');
                  }}
                />
              </View>
            </View>

            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    width: '85%',
    maxWidth: 350,
  },
  modalView: {
    backgroundColor: '#34495E', // surface color matching card
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    marginBottom: 20,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    width: '46%',
  },
  label: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#2C3E50', // background color
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '46%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonConfirm: {
    backgroundColor: theme.colors.accent,
  },
  cancelText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bold,
    fontSize: 15,
  },
  confirmText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
    fontSize: 15,
  },
});
