import axios from "./axios";

export async function getUsers(page = 1) {
  const token = localStorage.getItem("WATER_USER_TOKEN");
  try {
    const response = await axios.get(`user/v1/GetAllUser?page=${page}`, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to get users!");
  }
}

export async function getUser(id) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.get(
      `user/v1/GetOneUser/${id}`,

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

export async function createUser(user) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.post(
      "user/v1/AddUser",
      {
        ...user,
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

export async function editUser({ id, data }) {
  try {
    const response = await axios.patch(`user/v1/UpdateUser/${id}`, {
      ...data,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteUser({ id }) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.delete(`user/v1/DeleteOneUser/${id}`, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function addChargeToUser({ id, money, limit }) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.post(
      `user/v1/addChargeToUser/${id}`,
      {
        money,
        limit: Number(limit),
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

export async function addTax({ id, data }) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.post(
      `user/v1/AddTaxToUser/${id}`,
      {
        value: Number(data?.value),
        reason: data.reason,
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

export async function editTax({ id, data, objectId }) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.patch(
      `user/v1/UpdateTaxToUser/${id}/${objectId}`,
      {
        value: Number(data?.value),
        reason: data.reason,
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

export async function deleteTax({ id, taxId }) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.delete(
      `user/v1/DeleteTaxafromUser/${id}/${taxId}`,
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

export async function getClient(id) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const response = await axios.get(
      `user/v1/GetOneUser2/${id}`,

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

export async function getConsumptionByPeriod(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append("period", params.period);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.includeProjections) queryParams.append("includeProjections", params.includeProjections);
    if (params.exportFormat) queryParams.append("exportFormat", params.exportFormat);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionByPeriod/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConsumptionAnalysis(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.comparePeriod) queryParams.append("comparePeriod", params.comparePeriod);
    if (params.compareCount) queryParams.append("compareCount", params.compareCount);
    if (params.includeForecast) queryParams.append("includeForecast", params.includeForecast);
    if (params.includeSeasonality) queryParams.append("includeSeasonality", params.includeSeasonality);
    if (params.statisticalLevel) queryParams.append("statisticalLevel", params.statisticalLevel);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionAnalysis/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConsumptionForecast(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.forecastPeriods) queryParams.append("forecastPeriods", params.forecastPeriods);
    if (params.method) queryParams.append("method", params.method);
    if (params.confidenceLevel) queryParams.append("confidenceLevel", params.confidenceLevel);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionForecast/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConsumptionCorrelation(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionCorrelation/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConsumptionSeasonality(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append("period", params.period);
    if (params.years) queryParams.append("years", params.years);
    if (params.dateRangePeriod) queryParams.append("dateRangePeriod", params.dateRangePeriod);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionSeasonality/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConsumptionBenchmark(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append("period", params.period);
    if (params.compareWith) queryParams.append("compareWith", params.compareWith);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionBenchmark/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConsumptionRiskAssessment(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionRiskAssessment/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConsumptionPerformanceMetrics(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append("period", params.period);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetConsumptionPerformanceMetrics/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPumpEfficiencyAnalysis(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetPumpEfficiencyAnalysis/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getLeakDetectionAnalysis(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.threshold) queryParams.append("threshold", params.threshold);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetLeakDetectionAnalysis/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPumpCycleAnalysis(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetPumpCycleAnalysis/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPumpHealthMonitoring(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetPumpHealthMonitoring/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPumpOperationOptimization(userId, params = {}) {
  const token = localStorage.getItem("WATER_USER_TOKEN");

  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.period) queryParams.append("period", params.period);
    if (params.count) queryParams.append("count", params.count);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `consumption/v1/GetPumpOperationOptimization/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        access_token: token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}