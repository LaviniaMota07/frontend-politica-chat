import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const schema = z.object({
  email: z.string("E-mail é um campo obrigatório")
  .email("E-mail inválido"),
  permission: z.number("permissão é um campo obrigatório")
  .positive("Permissão invalida"),
  userId:z.coerce.number("ID do usuário é um campo obrigatório")
});

export type ShareChatFormData = z.infer<typeof schema>;

export const useShareChatForm = () => {
    return useForm({
        resolver: zodResolver(schema),
        defaultValues:{
            email: "",
            permission: undefined,
        }
    })
};