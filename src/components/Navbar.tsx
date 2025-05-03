// components/Navbar.tsx

"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Package2Icon, UserCircleIcon } from "@/components/icons/icons";
import { DropdownPanel } from "./DropdownPanel";
import useUserRoles from "@/hooks/useUserRoles";

export function Navbar() {
  const { data: session } = useSession();
  const usuariosRoles = [3];
  const { isAllowed: canViewUsuarios } = useUserRoles(usuariosRoles);

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres salir?")) {
      await signOut({ redirect: false, callbackUrl: "/auth/login" });
      sessionStorage.clear();
    }
  };

  return (
    <header
      className="flex items-center h-16 pl-10 pr-4 md:pl-10 md:pr-6 border-b border-gray-200 shrink-0"
      style={{ backgroundColor: "#284893" }}
    >
      <h3 className="text-m font-bold text-gray-100">Sistema de Mantención</h3>

      <div className="flex items-center ml-auto gap-4">
        <UserCircleIcon className="h-6 w-6 text-gray-100" />
        {session && <span className="lg:block text-gray-100">{(session.user as { username?: string }).username}</span>}
        <div className="relative inline-block text-left">
          <DropdownPanel isAdmin={true} />
        </div>
      </div>
    </header>
  );
}
