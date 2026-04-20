const state = {
  tasks: [],
  filter: "all",
};

const appRoot = document.querySelector("#todo-app");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");

if (appRoot) {
  console.log("State initialized:", state);
}

if (taskForm && taskInput) {
  taskForm.addEventListener("submit", handleTaskSubmit);
}

function handleTaskSubmit(event) {
  event.preventDefault();

  const rawValue = taskInput.value.trim();
  if (!rawValue) {
    return;
  }

  const newTask = createTask(rawValue);
  console.log("Task object created:", newTask);
}

function createTask(title) {
  return {
    id: Date.now().toString(),
    title,
    completed: false,
  };
}
