import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const requestAccessSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
});

export type RequestAccessFormData = z.infer<typeof requestAccessSchema>;

export const useRequestAccessForm = () => {
    return useForm<RequestAccessFormData>({
        resolver: zodResolver(requestAccessSchema),
        defaultValues: {
            name: "",
            email: "",
        }
    });
};
