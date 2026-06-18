import { useQuery } from "@tanstack/react-query";

import api from "../service/api";

export const useProducts =
() => {

  return useQuery({

    queryKey: ["products"],

    queryFn: async () => {

      const response =
        await api.get("/products");

      return response.data;
    }

  });
};