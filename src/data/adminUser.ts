import admin from "./adminUser.json";

export const ADMIN_USER = admin;

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  college: string;
  registrationDate: string;
  accountStatus: string;
  photo: string;
};