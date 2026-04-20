const state = {
  tasks: [],
  filter: "all",
};

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskFilters = document.querySelector("#task-filters");
const filterButtons = document.querySelectorAll(".filter-button");
const clearCompletedButton = document.querySelector("#clear-completed");

if (taskForm && taskInput && taskList && taskFilters) {
  taskForm.addEventListener("submit", handleTaskSubmit);
  taskList.addEventListener("change", handleTaskToggle);
  taskList.addEventListener("click", handleTaskDelete);
  taskFilters.addEventListener("click", handleFilterChange);
  if (clearCompletedButton) {
    clearCompletedButton.addEventListener("click", handleClearCompleted);
  }
  updateFilterButtons();
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
  updateClearCompletedButton();
  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "task-empty";
    emptyItem.textContent = getEmptyStateText();
    taskList.append(emptyItem);
    return;
  }

  const listFragment = document.createDocumentFragment();

  visibleTasks.forEach((task) => {
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

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task-delete";
  deleteButton.dataset.taskId = task.id;
  deleteButton.setAttribute("aria-label", `Delete task "${task.title}"`);
  deleteButton.textContent = "Delete";

  taskItem.append(taskLabel, deleteButton);
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

function handleTaskDelete(event) {
  const clickedElement = event.target;
  if (!(clickedElement instanceof HTMLElement)) {
    return;
  }

  const deleteButton = clickedElement.closest(".task-delete");
  if (!(deleteButton instanceof HTMLButtonElement)) {
    return;
  }

  const taskId = deleteButton.dataset.taskId;
  if (!taskId) {
    return;
  }

  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  renderTasks();
}

function handleClearCompleted() {
  const completedCount = getCompletedTaskCount();
  if (completedCount === 0) {
    return;
  }

  state.tasks = state.tasks.filter((task) => !task.completed);
  renderTasks();
}

function handleFilterChange(event) {
  const clickedElement = event.target;
  if (!(clickedElement instanceof HTMLElement)) {
    return;
  }

  const filterButton = clickedElement.closest(".filter-button");
  if (!(filterButton instanceof HTMLButtonElement)) {
    return;
  }

  const nextFilter = filterButton.dataset.filter;
  if (!isSupportedFilter(nextFilter)) {
    return;
  }

  state.filter = nextFilter;
  updateFilterButtons();
  renderTasks();
}

function getVisibleTasks() {
  if (state.filter === "active") {
    return state.tasks.filter((task) => !task.completed);
  }

  if (state.filter === "completed") {
    return state.tasks.filter((task) => task.completed);
  }

  return state.tasks;
}

function getEmptyStateText() {
  if (state.filter === "active") {
    return "No active tasks.";
  }

  if (state.filter === "completed") {
    return "No completed tasks.";
  }

  return "No tasks yet. Add your first task.";
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isCurrent = button.dataset.filter === state.filter;
    button.classList.toggle("is-active", isCurrent);
  });
}

function updateClearCompletedButton() {
  if (!clearCompletedButton) {
    return;
  }

  const completedCount = getCompletedTaskCount();
  clearCompletedButton.disabled = completedCount === 0;
  clearCompletedButton.textContent = completedCount > 0
    ? `Clear completed (${completedCount})`
    : "Clear completed";
}

function getCompletedTaskCount() {
  return state.tasks.reduce((count, task) => {
    return task.completed ? count + 1 : count;
  }, 0);
}

function isSupportedFilter(value) {
  return value === "all" || value === "active" || value === "completed";
}
