<template>
  <v-app>
    <navbar-component v-if="token"></navbar-component>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import NavbarComponent from './components/NavbarComponent.vue';
import { mapState } from 'vuex';

export default {
  components: { NavbarComponent },
  name: 'App',

  data: () => ({
    //
  }),
  computed:{
    ...mapState(["token"]),
  },
};
</script>
