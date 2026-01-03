import { logger } from "firebase-functions/v1";
import axios from "axios";
import "dotenv/config";

const CAR_API_BASE_URL = "https://car-api2.p.rapidapi.com/api/";

const axiosCarAPIConfig = {
  method: "get",
  maxBodyLength: Infinity,
  url: CAR_API_BASE_URL,
  headers: {
    "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    "X-RapidAPI-Host": "car-api2.p.rapidapi.com",
  },
};

export const getCarModelsByBrand = async (brand: string) => {
  logger.debug("======Env variable =====", process.env.RAPID_API_KEY);
  axiosCarAPIConfig.url = `${CAR_API_BASE_URL}models?make=${brand}`;
  return await axios.request(axiosCarAPIConfig)
    .then((res) => {
      logger.debug("=====Car model Result====", res.data.data);
      return res.data.data;
    })
    .catch((err) => {
      logger.debug("===Failed to get car models", err);
      return null;
    });
};
