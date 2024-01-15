import axios from "axios";
import store from "@/store";

const UserService = {

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
      if(error.response.status === 403){
        store.dispatch("logout");
        throw new Error("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      }
      else if(error.response.status === 400){
        if(error.response.data.message === "El correo ya existe"){
          throw new Error("El correo ya existe");
        }
        else{
          throw new Error("Error de validación");
        }
        
      }
      else{
        throw new Error("Error al crear el usuario");
      }
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = store.state.token;
      const response = await axios.delete(`usuario/eliminarUsuarioPorId/${userId}`, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        store.dispatch("logout");
        throw new Error("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      } else {
        throw new Error("Error al eliminar el usuario");
      }
    }
  },

  getUsers: async (sortBy, sortDesc,search,page,itemsPerPage) => {
    try {
      const token = store.state.token;
      
      const response = await axios.get(`usuario/obtenerUsuarios?search=${search}&page=${page}&limit=${itemsPerPage}&sortBy=${sortBy}&sortDesc=${sortDesc}`, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (error) {
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
      const response = await axios.get(`usuario/obtenerConductores?mes=${mes}&annio=${annio}&empresa=${empresa}`, {
        headers: {
          token: token,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response.status === 403) {
        store.dispatch("logout");
      }
    }
  },

  async obtenerUsuariosPorEmpresa(empresa, token) {
    try {
      const response = await axios.get(`usuario/obtenerConductoresPorEmpresa/${empresa}`, {
        headers: {
          'token': token,
        },
      });
      return response.data.data;
    } catch (error) {
      if (error.response.status === 403) {
        store.dispatch("logout");
      }
    }
  },

  async eliminarEvento(idUser,fecha, token) {
    try {

      const datos = {
        idUser: idUser,
        fecha: fecha,
      }
      const response = await axios.post("evento/eliminarEvento/",datos, {
        headers: {
          'token': token,
        },
      });
      
      return response.data;
    } catch (error) {
      if (error.response.status === 403) {
        return [];
      }
      throw error; // Maneja o propaga el error según sea necesario
    }
  }

  // Otras funciones relacionadas con usuarios
};

export default UserService;
