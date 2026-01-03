import { setGlobalOptions } from "firebase-functions/v2/options";
import "dotenv/config";

setGlobalOptions({
  region: "europe-west3",
  timeoutSeconds: 60,
  maxInstances: 10,
  memory: "1GiB",
});

export * from "./views";
