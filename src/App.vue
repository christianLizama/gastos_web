<template>
  <v-app>
    <notifications position="bottom center" width="80%" />
    <!-- <notifications position="bottom center" >
      <template slot="body" slot-scope="{ item, close }">
        <div class="my-notification">
          <p class="title">
            {{ item.title }}
          </p>
          <button class="close" @click="close">
            <i class="fa fa-fw fa-close"></i>
          </button>
          <div v-html="props.item.text" />
        </div>
      </template>
    </notifications> -->
    <navbar-component v-if="token"></navbar-component>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavbarComponent from "./components/NavbarComponent.vue";
import { mapState } from "vuex";

export default {
  components: { NavbarComponent },
  name: "App",

  data: () => ({
    //
  }),
  computed: {
    ...mapState(["token"]),
  },
};
</script>
