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
    borderRadius: 30, // Pill shape / Squircle
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C39BB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  btnPrimary: {
    backgroundColor: '#1C39BB', // System Blue
    shadowOpacity: 0.3,
  },
  btnSecondary: {
    backgroundColor: '#F2F2F7', // System Gray 6
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  btnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  btnDanger: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
  },
  btnSizeSm: { paddingVertical: 10, paddingHorizontal: 16 },
  btnSizeMd: { paddingVertical: 16, paddingHorizontal: 24 },
  btnSizeLg: { paddingVertical: 20, paddingHorizontal: 32 },
  btnSizeIcon: { width: 56, height: 56, padding: 0 },
  btnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 56,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
    marginRight: -10
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
});

