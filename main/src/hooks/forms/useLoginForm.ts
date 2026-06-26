import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema } from "../../validation/zod";


const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
    return useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });
};