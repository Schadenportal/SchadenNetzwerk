import { GeoPoint } from "firebase/firestore";

export type GeoLocationType = {
  address: string | undefined,
  geoPoint: GeoPoint | undefined
}
