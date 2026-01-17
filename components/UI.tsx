import React, { useState } from 'react';
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
import { Eye, EyeOff } from 'lucide-react-native';

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
    variant === 'outline' ? { color: '#1C39BB' } : variant === 'secondary' ? { color: '#000' } : variant === 'ghost' ? { color: '#1C39BB' } : variant === 'danger' ? { color: '#dc2626' } : { color: '#fff' }
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
  secureTextToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({ style, label, secureTextToggle, ...props }) => {
  const [isSecure, setIsSecure] = useState(props.secureTextEntry);

  const toggleSecure = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={[{ width: '100%' }, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={styles.inputContainer}>
        <RNTextInput
          placeholderTextColor="#8E8E93"
          style={styles.input}
          {...props}
          secureTextEntry={props.secureTextEntry && secureTextToggle ? isSecure : props.secureTextEntry}
        />
        {secureTextToggle && props.secureTextEntry && (
          <TouchableOpacity onPress={toggleSecure} style={styles.eyeIcon}>
            {isSecure ? <Eye size={20} color="#8E8E93" /> : <EyeOff size={20} color="#8E8E93" />}
          </TouchableOpacity>
        )}
      </View>
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
    backgroundColor: '#1C39BB', // System Blue
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#000000',
    paddingVertical: 14,
    fontSize: 16
    // removed height: '100%' to prevent layout loop crash
  },
  eyeIcon: {
    padding: 10,
    marginRight: -10
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
