const state = {
  tasks: [],
  filter: "all",
};

const appRoot = document.querySelector("#todo-app");

if (appRoot) {
  console.log("State initialized:", state);
}
