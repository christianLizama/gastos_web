import axios from "axios";
//import router from "@/router";
import Vue from "vue";
import store from "@/store";
import router from "@/router";

const solicitudService = {
  updateSolicitudes: async (solicitudes) => {
    try {
      const token = store.state.token;
      
      const response = await axios.put(
        "solicitud/actualizarSolicitudes",
        { solicitudes: solicitudes },
        {
          headers: {
            token: token,
          },
        }
      );
      return response;
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

  updateSolicitud: async (solicitud) => {
    try {
      const token = store.state.token;
      const response = await axios.post(
        "solicitud/actualizarSolicitud",
        { solicitud: solicitud },
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

export default solicitudService;
