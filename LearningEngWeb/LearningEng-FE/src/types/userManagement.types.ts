export interface Student {
  id: string;
  fullName: string;
  email: string;
  address: string | null;
  phoneNumber: string | null;
  isEnabled: boolean;
}