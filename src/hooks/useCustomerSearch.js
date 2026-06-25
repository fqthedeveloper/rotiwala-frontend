import { useCallback, useState } from "react";
import Swal from "sweetalert2";
import { searchCustomer } from "../service/walkInService";

const normalizePhone = (value) => {
  if (!value) return "";
  let phone = value.trim().replace(/[^\d+]/g, "");
  if (phone.startsWith("91") && !phone.startsWith("+91")) {
    phone = `+${phone}`;
  }
  if (!phone.startsWith("+91")) {
    phone = `+91${phone.replace(/^\+/, "")}`;
  }
  return phone;
};

export default function useCustomerSearch() {
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (phone) => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      Swal.fire("Warning", "Please enter a valid phone number.", "warning");
      return null;
    }

    try {
      setLoading(true);
      const customer = await searchCustomer(normalizedPhone);
      return {
        customer,
        normalizedPhone,
      };
    } catch (error) {
      Swal.fire("Error", "Unable to search for customer.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    search,
  };
}
