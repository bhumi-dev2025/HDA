import { getTodayLog, updateDailyLog } from "./TrackerService";
import { TaskItem } from "../types";

const MAX_TASKS = 3;

// ─── ADD tasks (max 3 total) ──────────────────────────────────────────────────
export async function addTasksToDailyLog(
  newTasks: { text: string }[]
): Promise<{ success: boolean; merged: TaskItem[]; error?: string }> {

  const todayLog = await getTodayLog();
  const existingTodos: TaskItem[] = todayLog?.todo_list ?? [];

  const filledExisting = existingTodos.filter((t) => t.text.trim() !== "");

  if (filledExisting.length >= MAX_TASKS) {
    return {
      success: false,
      merged: existingTodos,
      error: `Todo list is full (${MAX_TASKS}/${MAX_TASKS} tasks). Please remove a task first.`,
    };
  }

  const canAdd = MAX_TASKS - filledExisting.length;
  const tasksToAdd = newTasks.slice(0, canAdd);
  const skipped = newTasks.length - tasksToAdd.length;

  const uniqueTasksToAdd = tasksToAdd.filter((newTask) => {
    const newText = newTask.text.toLowerCase().trim();
    return !filledExisting.some(
      (existing) => existing.text.toLowerCase().trim() === newText
    );
  });

  if (uniqueTasksToAdd.length === 0 && skipped === 0) {
    return {
      success: false,
      merged: existingTodos,
      error: "These tasks are already in your todo list.",
    };
  }

  const formattedNew: TaskItem[] = uniqueTasksToAdd.map((t) => ({
    text: t.text,
    isDone: false,
  }));

  const mergedTasks: TaskItem[] = [...filledExisting, ...formattedNew];

  await updateDailyLog("todo", mergedTasks);

  let error: string | undefined;
  if (skipped > 0) {
    error = `Only ${uniqueTasksToAdd.length} task(s) added. Max ${MAX_TASKS} tasks allowed. ${skipped} task(s) skipped.`;
  }

  return { success: true, merged: mergedTasks, error };
}

// ─── REMOVE tasks by name (or all) ───────────────────────────────────────────
export async function removeTasksFromDailyLog(
  tasksToRemove: { text: string }[],
  removeAll: boolean
): Promise<{ success: boolean; remaining: TaskItem[]; removedCount: number }> {

  const todayLog = await getTodayLog();
  const existingTodos: TaskItem[] = todayLog?.todo_list ?? [];

  if (existingTodos.length === 0) {
    return { success: false, remaining: [], removedCount: 0 };
  }

  let remaining: TaskItem[];

  if (removeAll) {
    remaining = [];
  } else {
    const removeTexts = tasksToRemove.map((t) => t.text.toLowerCase());
    remaining = existingTodos.filter((task) => {
      const taskText = task.text.toLowerCase();
      return !removeTexts.some((r) => taskText.includes(r) || r.includes(taskText));
    });
  }

  const removedCount = existingTodos.length - remaining.length;

  await updateDailyLog("todo", remaining);

  return { success: true, remaining, removedCount };
}
