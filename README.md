# ToDo Task Manager

This is a learning project where I build a task manager from scratch.
I intentionally move in very small steps to keep the code history clear.
The final app will support filters, localStorage, and drag-and-drop sorting.

## Stack

- HTML
- CSS
- Vanilla JavaScript

## Build Plan (Micro Steps)

1. Create the initial project files (`index.html`, `styles.css`, `app.js`).
2. Add a simple page title and main app container.
3. Add minimal base styles for readable layout.
4. Add task input markup (text field + Add button).
5. Add an empty task list container.
6. Create initial JavaScript state (`tasks`, `filter`).
7. Wire the form submit event.
8. Add a `createTask` helper function.
9. Render tasks into the DOM.
10. Add task completion toggle logic.
11. Add task delete logic.
12. Add filter buttons (All / Active / Completed).
13. Implement filter behavior in render flow.
14. Add a "Clear completed" action.
15. Save tasks to `localStorage` after updates.
16. Restore tasks from `localStorage` on page load.
17. Add drag-and-drop events for sorting.
18. Persist reordered list to `localStorage`.
19. Polish UI and improve labels/accessibility text.

## Commit Message Examples

1. `chore: initialize todo project skeleton`
2. `feat: add app root and page heading`
3. `style: apply basic layout styles`
4. `feat: add static task input form`
5. `feat: add task list container markup`
6. `feat: add initial app state object`
7. `feat: handle new task form submission`
8. `feat: add createTask helper function`
9. `feat: render tasks into DOM`
10. `feat: support toggling task completion`
11. `feat: support deleting tasks`
12. `feat: add filter controls UI`
13. `feat: implement task filtering logic`
14. `feat: add clear completed tasks action`
15. `feat: persist tasks to localStorage`
16. `feat: hydrate tasks from localStorage on startup`
17. `feat: implement drag and drop task sorting`
18. `feat: persist reordered task list`
19. `docs: polish readme and project notes`
