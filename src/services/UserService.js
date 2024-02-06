import axios from "axios";
import store from "@/store";
import router from "@/router";
import Vue from 'vue';

const UserService = {

  getUserFromExternalApi: async (rut, empresa) => {
    try {
      const token = store.state.token;
  
      const response = await axios.get("usuario/obtenerUsuarioApiExterna", {
        params: {
          rut: rut,
          empresa: empresa,
        },
        headers: {
          token: token,
        },
      });
  
      return response.data;
    } catch (error) {
      console.error(error);
      throw error; // Maneja o propaga el error según sea necesario
    }
  },
  
  addUser: async (user) => {
    try {
      const token = store.state.token;
      const response = await axios.post("usuario/registrar", user, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response.status === 403) {
        store.dispatch("logout");
        throw new Error(
          "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión."
        );
      } else if (error.response.status === 400) {
        if (error.response.data.message === "El correo ya existe") {
          throw new Error("El correo ya existe");
        } else {
          throw new Error("Error de validación");
        }
      } else {
        throw new Error("Error al crear el usuario");
      }
    }
  },

  updateUser: async (user) => {
    try {
      const token = store.state.token;
      const response = await axios.put(`usuario/actualizarUsuarioPorId/${user._id}`, user, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (error) {
      // Manejar excepciones específicas que provienen de UserService.updateUser
      if (
        error.response.data.message ===
        "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión."
      ) {
        // Cerrar sesión u otra acción
        throw new Error(error.response.data.message);
      } else if (error.response.data.message === "El correo ya existe") {
        throw new Error(error.response.data.message);
      } else if (error.response.data.message === "Todos los campos son obligatorios") {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Error al actualizar el usuario");
      }
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = store.state.token;
      const response = await axios.delete(
        `usuario/eliminarUsuarioPorId/${userId}`,
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        store.dispatch("logout");
        throw new Error(
          "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión."
        );
      } else {
        throw new Error("Error al eliminar el usuario");
      }
    }
  },

  getUsers: async (sortBy, sortDesc, search, page, itemsPerPage) => {
    try {
      const token = store.state.token;

      const response = await axios.get(
        `usuario/obtenerUsuarios?search=${search}&page=${page}&limit=${itemsPerPage}&sortBy=${sortBy}&sortDesc=${sortDesc}`,
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      if(error.response.status === 401){
        //Emitir notificación de que no tiene permisos
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tienes permisos para acceder a esta página",
          type: "error",
        });
      }
      if (error.response.status === 403) {
        store.dispatch("logout");
      }
      throw error;
    }
  },

  getUserById: async (userId, token) => {
    try {
      const response = await axios.get("/usuario/${userId}", {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error; // Maneja o propaga el error según sea necesario
    }
  },

  getConductores: async (token, mes, annio, empresa) => {
    try {
      const response = await axios.get(
        `usuario/obtenerConductores?mes=${mes}&annio=${annio}&empresa=${empresa}`,
        {
          headers: {
            token: token,
          },
        }
      );

      return response.data;
    } catch (error) {
      if(error.response.status === 401){
        //Emitir notificación de que no tiene permisos
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tienes permisos para acceder a esta página",
          type: "error",
        });
      }
      if (error.response.status === 403) {
        store.dispatch("logout");
      }
    }
  },

  async obtenerUsuariosPorEmpresa(empresa, token) {
    try {
      const response = await axios.get(
        `usuario/obtenerConductoresPorEmpresa/${empresa}`,
        {
          headers: {
            token: token,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      if(error.response.status === 401){
        //Emitir notificación de que no tiene permisos
        router.push({ name: "home" });
        Vue.notify({
          title: "Error",
          text: "No tienes permisos para acceder a esta página",
          type: "error",
        });
      }
      if (error.response.status === 403) {
        store.dispatch("logout");
      }
    }
  },

  async eliminarEvento(idUser, fecha, token) {
    try {
      const datos = {
        idUser: idUser,
        fecha: fecha,
      };
      const response = await axios.post("evento/eliminarEvento/", datos, {
        headers: {
          token: token,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response.status === 403) {
        return [];
      }
      throw error; // Maneja o propaga el error según sea necesario
    }
  },

  async descargarExcel(token, empresa,fechaInicio, fechaTermino) {
    try {
      const response = await axios.get(`usuario/contarEventosEmpresa?empresa=${empresa}&fechaInicio=${fechaInicio}&fechaTermino=${fechaTermino}`, {
        headers: {
          token: token,
        },
        responseType: 'arraybuffer',
      });
      
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        Vue.notify({
          title: "Error",
          text: "No tienes permisos para descargar este archivo",
          type: "error",
        });
      }
      else if (error.response.status === 403) {
        store.dispatch("logout");
      }
      console.log(error); // Maneja o propaga el error según sea necesario
    }
  }

  // Otras funciones relacionadas con usuarios
};

export default UserService;
