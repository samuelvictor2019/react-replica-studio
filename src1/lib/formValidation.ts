export const sanitizePhoneInput = (value: string): string => value.replace(/\D/g, '');

export const isValidEmail = (value: string): boolean => {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
