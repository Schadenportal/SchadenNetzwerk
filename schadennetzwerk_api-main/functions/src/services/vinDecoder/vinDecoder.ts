import { sha1 } from "./sha1";
import { logger } from "firebase-functions/v1";
import axios from "axios";
import "dotenv/config";

export const vinDecoder = async (id: string, vin: string) => {
  const apiKey = process.env.VINCARIO_API_KEY;
  const secretKey = process.env.VINCARIO_SECRET_KEY;

  const apiPrefix = "https://api.vindecoder.eu/3.2";
  const action = (id === "info") ? "decode/info" : id;

  const hash = sha1((vin ? vin + "|" : "") + id + "|" + apiKey + "|" + secretKey).substring(0, 10);
  const path = apiPrefix + "/" + apiKey + "/" + hash + "/" + action + (vin ? "/" + vin : "") + ".json";

  return await axios.get(path)
    .then((res) => {
      logger.debug("===VinDecoder Res===", res.data);
      return res.data;
    })
    .catch((err) => {
      logger.debug("===Vin Decoder Error===", err);
      return null;
    });
};
