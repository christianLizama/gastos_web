import axios from "axios";
//import router from "@/router";
import Vue from "vue";
import store from "@/store";

const ContenedorService = {
  getContenedores: async (sortBy, sortDesc, search, page, itemsPerPage) => {
    try {
      const token = store.state.token;
      const response = await axios.get(
        `solicitud/obtenerContenedoresSolicitudes?search=${search}&page=${page}&limit=${itemsPerPage}&sortBy=${sortBy}&sortDesc=${sortDesc}`,
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response.status === 403) {
        store.dispatch("logout");
        Vue.notify({
          title: "Error",
          text: "Su sesión ha expirado",
          type: "error",
        });
      }
    }
  },

  addContenedor: async (contenedor) => {
    try {
      const token = store.state.token;
      const response = await axios.post(
        "solicitud/guardarContenedorSolicitudes",
        { contenedor: contenedor },
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response.status === 403) {
        store.dispatch("logout");
        Vue.notify({
          title: "Error",
          text: "Su sesión ha expirado",
          type: "error",
        });
      }
    }
  },
};

export default ContenedorService;
