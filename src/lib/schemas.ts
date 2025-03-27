
import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Meno musí mať aspoň 2 znaky" }),
  email: z.string().email({ message: "Neplatný email" }),
  password: z.string().min(6, { message: "Heslo musí mať aspoň 6 znakov" }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Musíte súhlasiť s podmienkami používania"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Heslá sa nezhodujú",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
