import axios from "./axios";

export async function lastFiveUsersAdded() {
  try {
    const token = localStorage.getItem("WATER_USER_TOKEN");
    const response = await axios.get(`user/v1/LastFiveUsersAdded`, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function highFiveUsersCharging() {
  try {
    const token = localStorage.getItem("WATER_USER_TOKEN");
    const response = await axios.get(`user/v1/HighFiveUsersCharging`, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}
