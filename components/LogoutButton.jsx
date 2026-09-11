"use client";
import { signOut } from "next-auth/react";
import { Button } from "@mui/material";

export default function LogoutButton() {
  return (
    <Button 
      variant="outlined" 
      color="error" 
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      Sign Out
    </Button>
  );
}