import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const generateTempPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const verifyPassword = async (inputPassword: string, storedHash: string): Promise<boolean> => {
  if (!storedHash) return false;
  return bcrypt.compare(inputPassword, storedHash);
};

export const generateResetToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const resetPassword = async (email: string): Promise<string> => {
  try {
    const { data: user, error: userError } = await supabase
      .from('custom_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    const { error: updateError } = await supabase
      .from('custom_users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpiry.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('Failed to generate reset token');
    }

    return resetToken;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to reset password');
  }
};

export const verifyResetToken = async (token: string): Promise<boolean> => {
  try {
    const { data: user, error } = await supabase
      .from('custom_users')
      .select('reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle();

    if (error || !user) {
      return false;
    }

    const tokenExpiry = new Date(user.reset_token_expires);
    return tokenExpiry > new Date();
  } catch (error) {
    return false;
  }
};

export const updatePasswordWithToken = async (token: string, newPassword: string): Promise<void> => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    const { error } = await supabase
      .from('custom_users')
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('reset_token', token);

    if (error) {
      throw new Error('Failed to update password');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update password');
  }
};