import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import KanbanBoard from "../../component/Tasks/MyTasks/KanbanBoard";
import AddTaskModal from "../../component/Tasks/MyTasks/AddTaskModal";

import {
  fetchMyTasks,
  setMyTasksColumns,
  addMyTask,
  saveMyTasksColumns,
  selectMyTasksColumns,
  selectTasksLoading,
  updateTask, // ✅ NEW: thunk you will add in Tasks.slice.js
} from "../../store/slices/Tasks.slice";

const MyTasks = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ NEW: edit state
  const [editingTask, setEditingTask] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);

  // ✅ safe selector usage (supports both array OR {columns: []})
  const myTasksState = useSelector(selectMyTasksColumns);
  const columns = Array.isArray(myTasksState)
    ? myTasksState
    : myTasksState?.columns || [];

  const loading = useSelector(selectTasksLoading);

  const saveTimerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  const handleAddTask = (newTaskData) => {
    const newTask = {
      id: crypto.randomUUID(),
      ...newTaskData,
      tags: newTaskData.tags || [],
      assignees: newTaskData.assignees || [],
      attachments: [],
    };

    dispatch(addMyTask({ columnId: "todo", task: newTask }));
    setIsModalOpen(false);
  };

  // ✅ NEW: update existing task
  const handleUpdateTask = (updatedTaskData) => {
    if (!editingTask || !editingColumnId) return;

    dispatch(
      updateTask({
        scope: "mytasks",
        columnId: editingColumnId,
        taskId: editingTask.id,
        updates: updatedTaskData,
      })
    );

    // close + reset edit state
    setIsModalOpen(false);
    setEditingTask(null);
    setEditingColumnId(null);
  };

  const handleColumnsChange = (newCols) => {
    dispatch(setMyTasksColumns(newCols));

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      dispatch(saveMyTasksColumns(newCols));
    }, 700);
  };

  const handleCreateMyTasksSpace = () => {
    const newCols = [
      { id: "todo", tasks: [] },
      { id: "inprogress", tasks: [] },
      { id: "completed", tasks: [] },
    ];
    dispatch(setMyTasksColumns(newCols));
    dispatch(saveMyTasksColumns(newCols));
  };

  // ✅ NEW: open edit modal from KanbanBoard
  const openEditModal = (task, columnId) => {
    setEditingTask(task);
    setEditingColumnId(columnId);
    setIsModalOpen(true);
  };

  // ✅ NEW: close modal & reset edit mode
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setEditingColumnId(null);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen dark:bg-gray-800 p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 flex-shrink-0">
          <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
            My Tasks
          </h1>

          {columns.length > 0 && (
            <button
              onClick={() => {
                setEditingTask(null);
                setEditingColumnId(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary flex min-w-[84px] items-center justify-center gap-2 h-10 px-4 text-sm font-bold tracking-[0.015em] capitalize"
            >
              <Plus size={20} />
              <span className="truncate">Add New Task</span>
            </button>
          )}
        </div>

        {columns.length === 0 && !loading && (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <button
              onClick={handleCreateMyTasksSpace}
              className="btn btn-primary flex min-w-[84px] items-center justify-center gap-2 h-10 px-4 text-sm font-bold tracking-[0.015em] capitalize"
            >
              <Plus size={20} />
              <span className="truncate">Create My Tasks Space</span>
            </button>
          </div>
        )}

        {columns.length > 0 && (
          <KanbanBoard
            initialColumns={columns}
            onColumnsChange={handleColumnsChange}
            onEditTask={openEditModal} // ✅ NEW
            scope="mytasks"
          />
        )}

        {loading && columns.length === 0 && (
          <div className="p-2 h-screen flex justify-center items-center">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask} // ✅ NEW
        initialTask={editingTask} // ✅ NEW
        submitLabel={editingTask ? "Update Task" : "Create Task"} // ✅ NEW
      />
    </>
  );
};

export default MyTasks;
