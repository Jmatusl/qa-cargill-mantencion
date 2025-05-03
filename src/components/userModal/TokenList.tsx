import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { useUsersStore } from "@/store/usersStore";
import { toast } from "sonner";
import { Role, Token, User } from "@prisma/client";

interface UserRole {
  role: Role;
}

type UserType = User & { roles: UserRole[]; tokens: Token[] };

export const TokenListCard = ({ data }: { data: UserType }) => {
  const [tokens, setTokens] = useState<Token[]>(
    data.tokens?.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    ) ?? []
  );
  const { fetchUsers } = useUsersStore();

  useEffect(() => {
    /* ordenar inversamente la lista de tokens */
    const sortedTokens =
      data.tokens?.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      ) ?? [];
    setTokens(sortedTokens);
  }, [data.tokens]);

  const exampletoken = {
    createdAt: "2024-03-16T04:55:54.757Z",
    expiresAt: "2024-03-16T05:55:53.741Z",
    id: 1,
    token: "116c29d05e062ea064ad51df200edd78",
    type: "resetPassword",
    updatedAt: "2024-03-16T04:56:32.897Z",
    used: true,
    userId: 1,
  };

  const exampleArray = [
    exampletoken,
    exampletoken,
    { ...exampletoken, used: false },
    exampletoken,
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlResponse, setUrlResponse] = useState<string>("");
  const handleResendToken = async () => {
    // Confirma antes de proceder
    const confirmResend = window.confirm(
      `Se creará un nuevo token de autenticación para el usuario ${data.username} y se enviará un correo a ${data.email} para crear una nueva contraseña.`
    );

    if (confirmResend) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/reset-password/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            type: data.verified ? "resetUserPassword" : "newUserPassword",
          }),
        });
        const newToken = await response.json();
        if (newToken?.message) {
          console.error(newToken.message);
          toast.error("Error al reenviar el token");
        }

        // Procesar la respuesta como sea necesario...
        setUrlResponse(newToken.url);
        toast.success("Token reenviado con éxito!");
      } catch (error) {
        console.error(error);
        toast.error("Hubo un problema al reenviar el token.");
      } finally {
        setIsSubmitting(false);
        fetchUsers();
      }
    }
  };

  const getTokenStatus = (token: Token) => {
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    if (token.used) {
      return "bg-green-50"; // Verde para tokens usados exitosamente
    } else if (now < expiresAt) {
      return "bg-yellow-50"; // Amarillo para tokens no usados pero aún válidos
    } else {
      return "bg-red-50"; // Rojo para tokens no usados y expirados
    }
  };

  // Reducir la visualización del token
  const compressToken = (token: string) =>
    `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;

  return (
    <div className="min-h-[300px]">
      <ScrollArea>
        <div className="overflow-y-auto mb-6" style={{ maxHeight: "250px" }}>
          {tokens.map((token, index) => (
            <div className="px-2 " key={index}>
              <div
                className={`p-4 border rounded-lg w-full h-auto overflow-hidden mb-2 ${getTokenStatus(
                  token
                )}`}
              >
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-xs font-medium tracking-wide text-gray-500">
                    Tipo de Token
                  </div>
                  <div className="col-span-2 text-xs">{token.type}</div>

                  <div className="text-xs font-medium tracking-wide text-gray-500">
                    Expira
                  </div>
                  <div className="col-span-2 text-xs">
                    {new Date(token.expiresAt).toLocaleString()}
                  </div>
                  <details className="col-span-3">
                    <summary className="text-xs font-medium tracking-wide text-gray-500 cursor-pointer">
                      Ver Más
                    </summary>
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      <div className="text-xs font-medium tracking-wide text-gray-500">
                        ID
                      </div>
                      <div className="text-xs">{token.id}</div>
                      <div className="text-xs font-medium tracking-wide text-gray-500">
                        Token
                      </div>
                      <div>
                        <div className="text-xs md:hidden">
                          {compressToken(token.token)}
                        </div>
                        <div>
                          <div className="text-xs hidden md:block">
                            {token.token}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-medium tracking-wide text-gray-500">
                        Fecha de Creación
                      </div>
                      <div className="text-xs">
                        {new Date(token.createdAt).toLocaleString()}
                      </div>

                      <div className="text-xs font-medium tracking-wide text-gray-500">
                        Actualizado
                      </div>
                      <div className="text-xs">
                        {new Date(token.updatedAt).toLocaleString()}
                      </div>
                      <div className="text-xs font-medium tracking-wide text-gray-500">
                        Token usado
                      </div>
                      <div className="text-xs">{token.used.toString()}</div>
                      <div className="text-xs font-medium tracking-wide text-gray-500">
                        Id de Usuario
                      </div>
                      <div className="text-xs">{token.userId}</div>
                      <div className="text-xs font-medium tracking-wide text-gray-500">
                        Enlace:
                      </div>
                      <div className="text-xs">{token.url}</div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <section>
        <div className="flex flex-col mt-4 border border-xs shadow-sm py-10 px-2">
          {!urlResponse && // Si no hay respuesta de la URL, mostrar los botones
            (data.verified ? (
              <div className="text-green-500 font-bold">
                <span>Usuario Verificado</span>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleResendToken}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Crear Nuevo Token"}
                </Button>
              </div>
            ) : !data.tokens?.some(
                (token) => new Date(token.expiresAt) > new Date()
              ) ? (
              <div className="text-red-500 font-bold">
                <span>Usuario No Verificado</span>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleResendToken}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Reenviar Token"}
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-lg flex flex-col items-start">
                <span className="text-md font-medium mb-2 text-pretty">
                  Esperando confirmación del usuario {data.email}.
                </span>
              </div>
            ))}

          {urlResponse && ( // Si hay respuesta de la URL, mostrar el enlace
            <div className="bg-blue-50 border border-blue-500 text-blue-700 p-4 rounded-lg flex flex-col items-start">
              <span className="text-xs font-medium mb-2 text-pretty">
                Se envió un correo electrónico al usuario {data.email} con un
                nuevo link de registro
              </span>
              <span className="text-xs break-words mb-4 overflow-hidden">
                {urlResponse}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
