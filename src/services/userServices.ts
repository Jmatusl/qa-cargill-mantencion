import { User, Role } from "@prisma/client";

interface UserData extends User {
  role: Role;
}

export async function fetchUsers() {
  try {
    const res = await fetch("/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await res.json();
    if (response.message) {
      throw new Error(response.message);
    }
    return response;
  } catch (error) {
    console.error("SignIn error:", error);
    throw error;
  }
}

export async function createUser(data: UserData) {
  try {
    const res = await fetch("/api/newuser", {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        email: data.email,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await res.json();
    return response;
  } catch (error) {
    console.error("SignIn error:", error);
    throw error;
  }
}

export async function editUser(data: UserData) {
  try {
    const res = await fetch("/api/users", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await res.json();
    return response;
  } catch (error) {
    console.error("SignIn error:", error);
    throw error;
  }
}
export async function deleteUser(id: number) {
  try {
    const res = await fetch(`/api/users/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const response = await res.json();
    return response;
  } catch (error) {
    console.error("SignIn error:", error);
    throw error;
  }
}

export async function sePasswordActiveUser(
  email: string,
  password: string,
  token: string
) {
  try {
    const res = await fetch(`/api/set-password/`, {
      method: "POST",
      body: JSON.stringify({ email, password, token }), //TODO: pass token type function
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await res.json();
    return response;
  } catch (error) {
    console.error("SignIn error:", error);
    throw error;
  }
}
