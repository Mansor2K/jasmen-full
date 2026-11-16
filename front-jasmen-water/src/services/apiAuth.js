import axios from "./axios";

export async function login({ email, password }) {
  try {
    const response = await axios.post("auth/v1/Login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function signUp({ email, password }) {
  try {
    const response = await axios.post("auth/v1/SignUp", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("WATER_USER_TOKEN");

    const response = await axios.post("auth/v1/verfiyUser", {
      token,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function logout(id) {
  try {
    const response = await axios.post(`auth/v1/LogOut/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
