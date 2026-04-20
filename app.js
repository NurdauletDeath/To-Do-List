const state = {
  tasks: [],
  filter: "all",
};

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");

if (taskForm && taskInput && taskList) {
  taskForm.addEventListener("submit", handleTaskSubmit);
  renderTasks();
}

function handleTaskSubmit(event) {
  event.preventDefault();

  const rawValue = taskInput.value.trim();
  if (!rawValue) {
    return;
  }

  const newTask = createTask(rawValue);
  state.tasks.push(newTask);

  taskInput.value = "";
  taskInput.focus();
  renderTasks();
}

function createTask(title) {
  return {
    id: Date.now().toString(),
    title,
    completed: false,
  };
}

function renderTasks() {
  taskList.innerHTML = "";

  if (state.tasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "task-empty";
    emptyItem.textContent = "No tasks yet. Add your first task.";
    taskList.append(emptyItem);
    return;
  }

  const listFragment = document.createDocumentFragment();

  state.tasks.forEach((task) => {
    listFragment.append(createTaskListItem(task));
  });

  taskList.append(listFragment);
}

function createTaskListItem(task) {
  const taskItem = document.createElement("li");
  taskItem.className = "task-item";
  taskItem.dataset.taskId = task.id;
  taskItem.textContent = task.title;
  return taskItem;
}
