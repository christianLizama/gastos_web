import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import Notifications from 'vue-notification'

Vue.config.productionTip = false
Vue.use(Notifications);

axios.defaults.baseURL = process.env.VUE_APP_SERVER_URL;

// Verifica si existe un token en el almacenamiento local
const token = localStorage.getItem('token');

if (token) {
  // Si hay un token, actualiza el estado de autenticación en Vuex
  store.dispatch('setToken', token);
}

// Verificamos si el token existe
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.getToken;

  if (requiresAuth && !isAuthenticated) {
    next('/login'); // Si requiere autenticación y no está autenticado, ir a la página de login
  } else if (to.path === '/login' && isAuthenticated) {
    next('/'); // Si intenta acceder a la página de login estando autenticado, redirigir a la página principal
  } else {
    next(); // Permitir la navegación
  }
});


new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
