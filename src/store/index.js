import Vue from 'vue'
import Vuex from 'vuex'
import router from "../router";
import { jwtDecode } from "jwt-decode";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("token") || "",
    user: {},
  },
  getters: {
    getToken: state => state.token,
    getUser: state => state.user,
  },
  mutations: {
    setToken: (state, token) => {
      state.token = token;
    },
    setUser: (state, user) => {
      state.user = user;
    },
    logout: state => {
      state.token = "";
    }
  },
  actions: {
    setToken: ({ commit }, token) => {
      commit("setToken", token);
      const user = jwtDecode(token);
      commit("setUser", user);
      localStorage.setItem("token", token);
    },
    logout: ({ commit }) => {
      commit("logout");
      localStorage.removeItem("token");
      commit("setUser", {});
      //Verificar si ya está en la página de login
      if (router.currentRoute.name !== "login"){
        router.push("/login");
      }
    }
  },
  modules: {
  }
})
