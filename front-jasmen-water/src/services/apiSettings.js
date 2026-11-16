import axios from "./axios";

export async function getSettings() {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.get(`setting/v1/GetSetting`, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function editSettings({ id, data }) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.patch(
      `setting/v1/UpdateSetting/${id}`,
      {
        ...data,
      },
      {
        headers: {
          access_token: token,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}
