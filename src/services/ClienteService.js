import axios from "axios";
//import router from "@/router";
import Vue from "vue";
import store from "@/store";
import router from "@/router";

const clienteService = {
  obtenerClientesTRN: async () => {
    try {
      const token = store.state.token;

      const response = await axios.get("clientes/obtenerClientesTRN", {
        headers: {
          token: token,
        },
      });
      return response;
    } catch (error) {
      if (error.response.status === 403) {
        store.dispatch("logout");
        Vue.notify({
          title: "Error",
          text: "Su sesión ha expirado",
          type: "error",
        });
      } else if (error.response.status === 401) {
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tiene permisos para realizar esta acción",
          type: "error",
        });
      }
    }
  },
  obtenerClientesTIR: async () => {
    try {
      const token = store.state.token;
      const response = await axios.get("clientes/obtenerClientesTIR", {
        headers: {
          token: token,
        },
      });
      return response;
    } catch (error) {
      if (error.response.status === 403) {
        store.dispatch("logout");
        Vue.notify({
          title: "Error",
          text: "Su sesión ha expirado",
          type: "error",
        });
      } else if (error.response.status === 401) {
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tiene permisos para realizar esta acción",
          type: "error",
        });
      }
    }
  },
  
  obtenerPedidosClienteTRN: async (idCliente) => {
    try {
      const token = store.state.token;
      //Enviar el id cliente como query param
      const response = await axios.get(
        `clientes/obtenerPedidosClienteTRN/?idCliente=${idCliente}`,
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
      } else if (error.response.status === 401) {
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tiene permisos para realizar esta acción",
          type: "error",
        });
      }
    }
  },

  obtenerPedidosConductorTRN : async (rut) => {
    try {
      const token = store.state.token;
      //Enviar el id cliente como query param
      const response = await axios.get(
        `clientes/obtenerPedidosConductorTRN?rut=${rut}`,
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
      } else if (error.response.status === 401) {
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tiene permisos para realizar esta acción",
          type: "error",
        });
      }
    }
  }

};

export default clienteService;
