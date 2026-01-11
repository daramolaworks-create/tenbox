
import React from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput as RNTextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  style,
  ...props
}) => {
  const buttonStyles = [
    styles.btnBase,
    styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as ViewStyle,
    styles[`btnSize${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as ViewStyle,
    style
  ];

  const textStyles = [
    styles.btnText,
    variant === 'outline' ? { color: '#0223E6' } : variant === 'secondary' ? { color: '#000' } : variant === 'ghost' ? { color: '#0223E6' } : variant === 'danger' ? { color: '#dc2626' } : { color: '#fff' }
  ] as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={isLoading || props.disabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={textStyles[0].color} />
      ) : (
        <>
          {props.icon && <View style={{ marginRight: 8 }}>{props.icon}</View>}
          <Text style={textStyles}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

interface InputProps extends TextInputProps {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ style, label, ...props }) => {
  return (
    <View style={[{ width: '100%' }, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <RNTextInput
        placeholderTextColor="#8E8E93"
        style={[styles.input, { width: '100%' }]}
        {...props}
      />
    </View>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  btnBase: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#0223E6', // System Blue
  },
  btnSecondary: {
    backgroundColor: '#E5E5EA', // System Fill
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  btnDanger: {
    backgroundColor: 'rgba(254, 202, 202, 0.5)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnSizeSm: { paddingVertical: 8, paddingHorizontal: 16 },
  btnSizeMd: { paddingVertical: 14, paddingHorizontal: 20 },
  btnSizeLg: { paddingVertical: 18, paddingHorizontal: 24 },
  btnSizeIcon: { width: 54, height: 54 },
  btnText: {
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    color: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, // Android
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    marginLeft: 4,
  },
});
