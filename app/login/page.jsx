"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/"); 
      router.refresh();
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafc" }}>
      <Paper elevation={3} sx={{ p: 5, width: "100%", maxWidth: 400, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4} color="primary">
          Finderight Admin
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}

          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 4 }}>
            Sign In
          </Button>
        </form>
      </Paper>
    </Box>
  );
}