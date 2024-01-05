import axios from "axios";

const UserService = {
  getUsers: async (token) => {
    try {
      const response = await axios.get("usuario/obtenerUsuarios", {
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

  getConductores: async (token, mes) => {
    try {
      const response = await axios.get(`usuario/obtenerConductores?mes=${mes}`, {
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

  async obtenerUsuariosPorEmpresa(empresa, token) {
    try {
      const response = await axios.get(`usuario/obtenerConductoresPorEmpresa/${empresa}`, {
        headers: {
          'token': token,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error(error);
      throw error; // Maneja o propaga el error según sea necesario
    }
  }

  // Otras funciones relacionadas con usuarios
};

export default UserService;
