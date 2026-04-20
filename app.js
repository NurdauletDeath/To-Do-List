const STORAGE_KEY = "todo-task-manager-state-v1";

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
const dragState = {
  draggedTaskId: null,
};

if (taskForm && taskInput && taskList && taskFilters) {
  hydrateStateFromStorage();
  taskForm.addEventListener("submit", handleTaskSubmit);
  taskList.addEventListener("change", handleTaskToggle);
  taskList.addEventListener("click", handleTaskDelete);
  taskList.addEventListener("dragstart", handleTaskDragStart);
  taskList.addEventListener("dragover", handleTaskDragOver);
  taskList.addEventListener("drop", handleTaskDrop);
  taskList.addEventListener("dragend", handleTaskDragEnd);
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
  persistStateToStorage();

  taskInput.value = "";
  taskInput.focus();
  renderTasks();
}

function createTask(title) {
  return {
    id: createTaskId(),
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
  if (isDragEnabled()) {
    taskItem.classList.add("task-item-draggable");
    taskItem.draggable = true;
  }

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
  persistStateToStorage();
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
  persistStateToStorage();
  renderTasks();
}

function handleClearCompleted() {
  const completedCount = getCompletedTaskCount();
  if (completedCount === 0) {
    return;
  }

  state.tasks = state.tasks.filter((task) => !task.completed);
  persistStateToStorage();
  renderTasks();
}

function handleTaskDragStart(event) {
  if (!isDragEnabled()) {
    event.preventDefault();
    return;
  }

  const draggedItem = getClosestTaskItem(event.target);
  if (!draggedItem) {
    event.preventDefault();
    return;
  }

  const taskId = draggedItem.dataset.taskId;
  if (!taskId) {
    event.preventDefault();
    return;
  }

  dragState.draggedTaskId = taskId;
  draggedItem.classList.add("task-item-dragging");

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId);
  }
}

function handleTaskDragOver(event) {
  if (!isDragEnabled() || !dragState.draggedTaskId) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }

  const overItem = getClosestTaskItem(event.target);
  clearDropTargetClass();

  if (!overItem) {
    return;
  }

  const overTaskId = overItem.dataset.taskId;
  if (!overTaskId || overTaskId === dragState.draggedTaskId) {
    return;
  }

  overItem.classList.add("task-item-drop-target");
}

function handleTaskDrop(event) {
  if (!isDragEnabled()) {
    return;
  }

  event.preventDefault();
  const draggedTaskId = getDraggedTaskId(event);
  if (!draggedTaskId) {
    clearDragState();
    return;
  }

  const droppedOnItem = getClosestTaskItem(event.target);
  if (droppedOnItem && droppedOnItem.dataset.taskId === draggedTaskId) {
    clearDragState();
    return;
  }

  const dropTargetTaskId = droppedOnItem ? droppedOnItem.dataset.taskId || null : null;
  let didReorder = false;

  if (dropTargetTaskId) {
    didReorder = moveTaskBefore(draggedTaskId, dropTargetTaskId);
  } else {
    didReorder = moveTaskToEnd(draggedTaskId);
  }

  clearDragState();

  if (!didReorder) {
    return;
  }

  persistStateToStorage();
  renderTasks();
}

function handleTaskDragEnd() {
  clearDragState();
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
  persistStateToStorage();
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

function isDragEnabled() {
  return state.filter === "all";
}

function isSupportedFilter(value) {
  return value === "all" || value === "active" || value === "completed";
}

function createTaskId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hydrateStateFromStorage() {
  try {
    const rawStoredState = localStorage.getItem(STORAGE_KEY);
    if (!rawStoredState) {
      return;
    }

    const parsedState = JSON.parse(rawStoredState);
    if (!parsedState || typeof parsedState !== "object") {
      return;
    }

    state.tasks = sanitizeStoredTasks(parsedState.tasks);
    if (isSupportedFilter(parsedState.filter)) {
      state.filter = parsedState.filter;
    }
  } catch (error) {
    console.warn("Unable to load todo state from localStorage.", error);
  }
}

function persistStateToStorage() {
  const stateToStore = {
    tasks: state.tasks,
    filter: state.filter,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
  } catch (error) {
    console.warn("Unable to save todo state to localStorage.", error);
  }
}

function sanitizeStoredTasks(rawTasks) {
  if (!Array.isArray(rawTasks)) {
    return [];
  }

  return rawTasks
    .map(normalizeStoredTask)
    .filter((task) => task !== null);
}

function normalizeStoredTask(rawTask) {
  if (!rawTask || typeof rawTask !== "object") {
    return null;
  }

  const title = typeof rawTask.title === "string" ? rawTask.title.trim() : "";
  if (!title) {
    return null;
  }

  const id = typeof rawTask.id === "string" && rawTask.id
    ? rawTask.id
    : createTaskId();

  return {
    id,
    title,
    completed: Boolean(rawTask.completed),
  };
}

function getClosestTaskItem(target) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const taskItem = target.closest(".task-item");
  if (!(taskItem instanceof HTMLLIElement)) {
    return null;
  }

  return taskItem;
}

function getDraggedTaskId(event) {
  if (dragState.draggedTaskId) {
    return dragState.draggedTaskId;
  }

  if (!event.dataTransfer) {
    return null;
  }

  const transferredId = event.dataTransfer.getData("text/plain");
  return transferredId || null;
}

function moveTaskBefore(draggedTaskId, targetTaskId) {
  if (draggedTaskId === targetTaskId) {
    return false;
  }

  const fromIndex = state.tasks.findIndex((task) => task.id === draggedTaskId);
  const toIndex = state.tasks.findIndex((task) => task.id === targetTaskId);
  if (fromIndex < 0 || toIndex < 0) {
    return false;
  }

  const [movedTask] = state.tasks.splice(fromIndex, 1);
  const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  state.tasks.splice(adjustedIndex, 0, movedTask);
  return true;
}

function moveTaskToEnd(draggedTaskId) {
  const fromIndex = state.tasks.findIndex((task) => task.id === draggedTaskId);
  if (fromIndex < 0 || fromIndex === state.tasks.length - 1) {
    return false;
  }

  const [movedTask] = state.tasks.splice(fromIndex, 1);
  state.tasks.push(movedTask);
  return true;
}

function clearDragState() {
  dragState.draggedTaskId = null;

  clearDropTargetClass();
  const draggingItem = taskList.querySelector(".task-item-dragging");
  if (draggingItem) {
    draggingItem.classList.remove("task-item-dragging");
  }
}

function clearDropTargetClass() {
  const dropTarget = taskList.querySelector(".task-item-drop-target");
  if (dropTarget) {
    dropTarget.classList.remove("task-item-drop-target");
  }
}
