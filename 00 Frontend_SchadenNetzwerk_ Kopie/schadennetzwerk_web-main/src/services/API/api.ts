import axios from "axios";

import { API_ROOT } from "src/utils/common";

export const ScanVehicleDoc = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("doc", file);
    const res = await axios.post(`${API_ROOT()}scan_doc`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    return res.data;
  } catch (error) {
    return null;
  }
}
