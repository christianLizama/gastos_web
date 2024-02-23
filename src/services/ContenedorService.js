import axios from "axios";
//import router from "@/router";
import Vue from "vue";
import store from "@/store";
import router from "@/router";

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
        throw error;
      }
      else if(error.response.status === 401){
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tiene permisos para acceder a esta página",
          type: "error",
        }); 
        throw error;
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
      else if(error.response.status === 401){
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tiene permisos para realizar esta acción",
          type: "error",
        }); 
      }
    }
  },
};

export default ContenedorService;
