import Vue from "vue";
import Vuex from "vuex";
import { user } from "./user/user";
import { tickets } from "./tickets/tickets.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user,
    tickets
  }
});
