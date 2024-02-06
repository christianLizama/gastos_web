import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendarioEventos',
    name: 'calendarioEventos',
    component: () => import(/* webpackChunkName: "about" */ '../views/CalendarioEventosView.vue'),

  },
  {
    path: '*',
    name: "notFound",
    component: () => import(/* webpackChunkName: "notFound" */ '../views/NotFoundView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/gestionUsuarios',
    name: 'gestionUsuarios',
    component: () => import(/* webpackChunkName: "about" */ '../views/GestionUsuariosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/solicitudDinero',
    name: 'solicitudDinero',
    component: () => import(/* webpackChunkName: "about" */ '../views/SolicitudDineroView.vue'),

  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
