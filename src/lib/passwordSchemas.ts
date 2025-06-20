
import * as z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Neplatný email" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Neplatný email" }),
  password: z.string().min(6, { message: "Heslo musí mať aspoň 6 znakov" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Heslá sa nezhodujú",
  path: ["confirmPassword"],
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Súčasné heslo je povinné" }),
  newPassword: z.string().min(6, { message: "Nové heslo musí mať aspoň 6 znakov" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Heslá sa nezhodujú",
  path: ["confirmPassword"],
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
