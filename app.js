const state = {
  tasks: [],
  filter: "all",
};

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");

if (taskForm && taskInput && taskList) {
  taskForm.addEventListener("submit", handleTaskSubmit);
  taskList.addEventListener("change", handleTaskToggle);
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
  if (task.completed) {
    taskItem.classList.add("task-item-completed");
  }
  taskItem.dataset.taskId = task.id;

  const taskLabel = document.createElement("label");
  taskLabel.className = "task-item-main";

  const taskToggle = document.createElement("input");
  taskToggle.type = "checkbox";
  taskToggle.className = "task-toggle";
  taskToggle.checked = task.completed;
  taskToggle.dataset.taskId = task.id;
  taskToggle.setAttribute("aria-label", `Mark "${task.title}" as completed`);

  const taskTitle = document.createElement("span");
  taskTitle.className = "task-title";
  taskTitle.textContent = task.title;

  taskLabel.append(taskToggle, taskTitle);
  taskItem.append(taskLabel);
  return taskItem;
}

function handleTaskToggle(event) {
  const changedElement = event.target;
  if (!(changedElement instanceof HTMLInputElement)) {
    return;
  }

  if (!changedElement.classList.contains("task-toggle")) {
    return;
  }

  const taskId = changedElement.dataset.taskId;
  if (!taskId) {
    return;
  }

  const targetTask = state.tasks.find((task) => task.id === taskId);
  if (!targetTask) {
    return;
  }

  targetTask.completed = changedElement.checked;
  renderTasks();
}
