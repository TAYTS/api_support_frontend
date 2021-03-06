import axios from "../../axios/loginAxios";

const state = {
  id_user_hash: "",
  access_token: "",
  refresh_token: "",
  username: ""
};

const actions = {
  login({ commit }, payload) {
    return axios
      .post("/users/login", payload)
      .then(response => {
        if (
          response.status === 200 &&
          response.data.id_user_hash &&
          response.data.username
        ) {
          const id_user_hash = response.data.id_user_hash;
          const username = response.data.username;
          commit("storeCredentials", { id_user_hash, username });
          localStorage.setItem("remember", payload.remember);
          return 1;
        } else {
          deleteAllCookies();
          return 0;
        }
      })
      .catch(() => {
        return 0;
      });
  },
  authenticate({ commit }) {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    commit("storeCredentials", { id_user_hash: "" });
    let status;
    if (access_token) {
      const remember = localStorage.getItem("remember");
      if (remember === "true") {
        return axios
          .get("/users/refresh", {
            headers: {
              "X-CSRF-TOKEN": refresh_token
            }
          })
          .then(response => {
            if (
              response.status === 200 &&
              response.data.id_user_hash &&
              response.data.username
            ) {
              const id_user_hash = response.data.id_user_hash;
              const username = response.data.username;
              commit("storeCredentials", { id_user_hash, username });
              return 1;
            } else {
              deleteAllCookies();
              return 0;
            }
          })
          .catch(() => {
            deleteAllCookies();
            return 0;
          });
      } else {
        return axios
          .get("/users/authenticate", {
            headers: {
              "X-CSRF-TOKEN": access_token
            }
          })
          .then(response => {
            if (
              response.status === 200 &&
              response.data.id_user_hash &&
              response.data.username
            ) {
              const id_user_hash = response.data.id_user_hash;
              const username = response.data.username;
              commit("storeCredentials", { id_user_hash, username });
              return 1;
            } else {
              deleteAllCookies();
              return 0;
            }
          })
          .catch(() => {
            deleteAllCookies();
            return 0;
          });
      }
    } else {
      status = 0;
      return new Promise(resolve => {
        resolve(status);
      });
    }
  },
  logout() {
    return axios
      .post("/users/logout")
      .then(response => {
        if (response.status === 200 && response.data.status === 1) {
          // Clean local storage
          localStorage.clear();
          return 1;
        } else {
          return 0;
        }
      })
      .catch(() => {
        return 0;
      });
  },
  register(context, payload) {
    return axios
      .post("/users/register", payload)
      .then(response => {
        if (response.status === 201) {
          return 1;
        } else {
          deleteAllCookies();
          return 0;
        }
      })
      .catch(() => {
        return 0;
      });
  }
};

const mutations = {
  storeCredentials(state, { id_user_hash, username }) {
    // Get the CSRF cookies
    const cookies = document.cookie.split(";");
    // Create the regx pattern to extract the csrf token
    const pattern1 = /csrf_access_token=(.*)/;
    const pattern2 = /csrf_refresh_token=(.*)/;

    // Create a buffer for storing the tokens
    let access_token = "";
    let refresh_token = "";

    // Loop and save the token to respective buffer
    for (var i = 0; i < cookies.length; i++) {
      if (cookies[i].match(pattern1)) {
        access_token = cookies[i].match(pattern1)[1];
      }
      if (cookies[i].match(pattern2)) {
        refresh_token = cookies[i].match(pattern2)[1];
      }
    }
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("username", username);
    state.access_token = access_token;
    state.refresh_token = refresh_token;
    state.id_user_hash = id_user_hash;
    state.username = username;
  }
};

const getters = {
  getUser: state => {
    return state.id_user_hash;
  },
  getUsername: state => {
    return state.username;
  }
};

/*
 * Helper functions
 */
function deleteAllCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export const user = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
