"use client";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

/**
 * @description Um componente de botão padronizado para ações primárias.
 * Ele encapsula os estilos de gradiente rosa e o comportamento desativado,
 * garantindo consistência visual em toda a aplicação.
 * Herda todas as props do componente Button base de shadcn/ui.
 */

// Usamos as props do botão original para manter a consistência e flexibilidade.
type PrimaryButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button
      className={cn(
        // Estilos padrão do botão rosa com gradiente.
        "bg-linear-to-r from-pink-500 to-pink-600 text-white font-bold",
        // Estilos de hover e foco para dar feedback ao usuário.
        "hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300",
        // Estilos para quando o botão está desativado (disabled={true}).
        // Remove gradientes e efeitos de hover, tornando-o visualmente inativo.
        "disabled:bg-gray-500/50 disabled:from-gray-500 disabled:to-gray-600 disabled:scale-100 disabled:cursor-not-allowed",
        // Permite que classes adicionais passadas como props sobrescrevam ou complementem os estilos padrão.
        className
      )}
      {...props} // Passa todas as outras props (como onClick, disabled, etc.) para o componente Button.
    />
  );
}