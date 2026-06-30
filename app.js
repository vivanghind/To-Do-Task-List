const btnAddTask = document.querySelector("#addTask");
const taskInput = document.querySelector("#task");
const dueDate = document.querySelector("#dueDate");
const priority = document.querySelector("#priority");
const taskList = document.querySelector("#taskList");
const TASKS_KEY = "tasks";
const btnClearAllTasks = document.querySelector("#clearAllTasks");
const deleteModal = document.querySelector("#deleteModal");
const editModal = document.querySelector("#editModal");
const deleteAllTasksModal = document.querySelector("#deleteAllModal");
const btnDeleteAllAgree = document.querySelector("#deleteAllAgree");
const btnDeleteAgree = document.querySelector("#deleteAgree");
const btnEditAgree = document.querySelector("#editAgree");
const txtFilterText = document.querySelector("#filterText");
const filterPriority = document.querySelector("#filterPriority");

const btnApplyFilter = document.querySelector("#btnApplyFilter");
const btnClearFilter = document.querySelector("#btnClearFilter");

let tasks = getTasksFromLocalStorage();
const filters = {
  text: "",
  priority: null,
};

// Main
registerEvents();
createTasks();

// On Load
document.addEventListener("DOMContentLoaded", function () {
  // Materialize Select Initialization
  let elems = document.querySelectorAll("select");
  let instances = M.FormSelect.init(elems);
  elems = document.querySelectorAll(".datepicker");
  instances = M.Datepicker.init(elems);
  elems = document.querySelectorAll(".modal");
  instances = M.Modal.init(elems);
  elems = document.querySelectorAll(".collapsible");
  instances = M.Collapsible.init(elems);
});

function registerEvents() {
  btnAddTask.addEventListener("click", handleAddTask);
  btnClearAllTasks.addEventListener("click", handleClearAllTasks);
  btnDeleteAllAgree.addEventListener("click", handleDeleteAllAgree);
  taskList.addEventListener("click", handleDeleteApproval);
  taskList.addEventListener("click", handleEditApproval);
  btnDeleteAgree.addEventListener("click", handleDeleteTask);
  // txtFilterText.addEventListener('keyup', handleFilter); // we have changed the logic!
  btnApplyFilter.addEventListener("click", handleApplyFilters);
  btnClearFilter.addEventListener("click", handleClearFilters);
}

/***** HELPERS *****/
function validate(text) {
  if (text === "") {
    M.toast({
      html: "Task Name is Mandatory!",
      classes: "rounded red",
    });

    return false;
  }
  return true;
}

function show(el) {
  el.style.display = "block";
}

function hide(el) {
  el.style.display = "none";
}

function openDeleteAllTasksModal() {
  const instance = M.Modal.getInstance(deleteAllTasksModal);
  instance.open();
}

function openDeleteModal() {
  const instance = M.Modal.getInstance(deleteModal);
  instance.open();
}
function openEditModal() {
  const instance = M.Modal.getInstance(editModal);
  instance.open();
}

function getTasksFromLocalStorage() {
  const temp = JSON.parse(localStorage.getItem(TASKS_KEY)) ?? [];
  return temp.map((t) => ({ ...t, isVisible: true }));
}

function setTasksToLocalStorage(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function capitalize(text) {
  return text.slice(0, 1).toUpperCase() + text.slice(1);
}

function clearAllInputFields() {
  taskInput.value = "";
  taskInput.nextElementSibling.classList.remove("active");
  dueDate.value = null;
  dueDate.nextElementSibling.classList.remove("active");
  priority.value = "";
  M.FormSelect.init(priority);
  M.Datepicker.init(dueDate);
}

/******* EVENT HANDLERS *******/

function handleClearFilters(evt) {
  txtFilterText.value = "";
  filterPriority.value = "";
  M.FormSelect.init(filterPriority);
  handleApplyFilters(evt);
}

function handleApplyFilters(evt) {
  evt.preventDefault();

  filters.text = txtFilterText.value;
  filters.priority = filterPriority.value || null;

  applyFilters();
}

function handleFilter(evt) {
  const key = evt.target.value;
  const taskListItems = Array.from(taskList.children);
  taskListItems.forEach((t) =>
    t.firstChild.textContent.includes(key) ? show(t) : hide(t),
  );
}
function handleAddTask(evt) {
  evt.preventDefault();

  const taskValue = taskInput.value.trim();
  const dueDateValue = dueDate.value;
  const priorityValue = priority.value;
  if (validate(taskValue)) {
    const taskObj = createTaskObject(taskValue, dueDateValue, priorityValue);
    createTask(taskObj);
    saveTask(taskObj);
  }
}

function handleDeleteApproval(evt) {
  evt.preventDefault();
  let taskId;
  if (evt.target.classList.contains("delete-item")) {
    taskId = evt.target.getAttribute("data-task-id");
    btnDeleteAgree.dataset.taskId = taskId;
    openDeleteModal();
  } else if (evt.target.parentElement.classList.contains("delete-item")) {
    taskId = evt.target.parentElement.dataset.taskId;
    btnDeleteAgree.dataset.taskId = taskId;
    openDeleteModal();
  }
}

function handleEditApproval(evt) {
  evt.preventDefault();
  let taskId;
  console.log("Hejldbha");
  if (evt.target.classList.contains("edit-item")) {
    taskId = evt.target.getAttribute("data-task-id");
    btnEditAgree.dataset.taskId = taskId;
    openEditModal();
  } else if (evt.target.parentElement.classList.contains("edit-item")) {
    taskId = evt.target.parentElement.dataset.taskId;
    btnEditAgree.dataset.taskId = taskId;
    openEditModal();
  }
}

function handleDeleteAllAgree(evt) {
  removeAllTasksFromList();
  localStorage.setItem(TASKS_KEY, JSON.stringify([]));
}
function handleClearAllTasks(evt) {
  evt.preventDefault();
  openDeleteAllTasksModal();
}

function handleDeleteTask(evt) {
  const taskId = evt.target.dataset.taskId;
  deleteTask(taskId);
}

/******* TASK MANAGEMENT ******/
function createTaskObject(taskValue, dueDateValue, priorityValue) {
  const id = Math.floor(Math.random() * 9000000 + 1000000);
  return {
    id,
    value: taskValue,
    dueDate: dueDateValue,
    priority: priorityValue,
    isVisible: true,
  };
}

function deleteTask(taskId) {
  taskId = Number(taskId);

  //Remove from Storage
  const localStorageTasks = getTasksFromLocalStorage();
  const updatedStorageTasks = localStorageTasks.filter((t) => t.id !== taskId);
  setTasksToLocalStorage(updatedStorageTasks);

  // Remove From UI
  const taskListItems = taskList.children;
  for (let i = 0; i < taskListItems.length; i++) {
    const taskElementId = Number(taskListItems[i].dataset.taskId);
    if (taskElementId === taskId) {
      taskListItems[i].remove();
    }
  }
}

function saveTask(taskObj) {
  const tasks = getTasksFromLocalStorage();
  tasks.push(taskObj);
  setTasksToLocalStorage(tasks);
}

function createTask(taskObj) {
  const { id, value, dueDate, priority, isVisible } = taskObj;

  if (!isVisible) return;
  const li = document.createElement("li");
  li.classList.add("collection-item");
  li.dataset.taskId = id;
  li.appendChild(document.createTextNode(value));

  const span = document.createElement("span");
  span.className = `priority ${priority}`;

  span.textContent = capitalize(priority);

  const small = document.createElement("small");
  small.setAttribute("style", "margin-left: .5rem;");
  small.innerHTML = dueDate && `<strong>Due Date:</strong> ${dueDate}`;

  const deleteLink = document.createElement("a");
  deleteLink.setAttribute("href", "#");
  deleteLink.setAttribute("data-task-id", id);
  deleteLink.className = "delete-item secondary-content";
  deleteLink.innerHTML = '<i class="fa fa-trash"></i>';

  const editLink = document.createElement("a");
  editLink.setAttribute("href", "#");
  editLink.setAttribute("data-task-id", id);
  editLink.className = "edit-item secondary-content";
  editLink.innerHTML = '<i class="fa fa-pencil"></i>';

  li.appendChild(span);
  li.appendChild(small);
  li.appendChild(deleteLink);
  li.appendChild(editLink);

  taskList.appendChild(li);

  clearAllInputFields();
}

function applyFilters() {
  tasks.forEach((t) => {
    if (t.value.includes(filters.text)) {
      t.isVisible = true;
    } else {
      t.isVisible = false;
    }
  });

  tasks.forEach((t) => {
    if (t.isVisible) {
      if (filters.priority != null && t.priority !== filters.priority) {
        t.isVisible = false;
      }
    }
  });
  removeAllTasksFromList();
  createTasks();
}

function createTasks() {
  const filteredTasks = tasks.filter((t) => t.isVisible);
  filteredTasks.length !== 0
    ? filteredTasks.forEach((t) => createTask(t))
    : (taskList.innerHTML = "No Tasks Found...");
}

function removeAllTasksFromList() {
  while (taskList.firstChild) {
    taskList.firstChild.remove();
  }
}
