import React, { useEffect, useState, useMemo } from "react";
import { Plus, SquareKanban } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import KanbanBoard from "../../component/Tasks/MyTasks/KanbanBoard";
import AddTaskModal from "../../component/Tasks/MyTasks/AddTaskModal";

import {
  fetchMyTasks,
  createMyTasksSpace,
  setMyTasksColumns,
  updateTask,
  selectMyTasksColumns,
  selectTasksLoading,
} from "../../store/slices/Tasks.slice";
import { selectCurrentUser } from "../../store/slices/Auth.slice";

const MyTasks = () => {
  const dispatch = useDispatch();

  // 1. Selectors & Destructuring
  const currentUser = useSelector(selectCurrentUser);
  const loading = useSelector(selectTasksLoading);
  const myTasksState = useSelector(selectMyTasksColumns);

  // 2. Local State
  const [modal, setModal] = useState({
    isOpen: false,
    task: null,
    columnId: null,
  });

  // 3. Computed Data (Memoized for performance)
  const columns = useMemo(() => {
    return Array.isArray(myTasksState)
      ? myTasksState
      : myTasksState?.columns || [];
  }, [myTasksState]);

  const user = useMemo(
    () => ({
      id: currentUser?.id,
      username: currentUser?.username,
    }),
    [currentUser]
  );

  // 4. Initial Mount Fetch
  useEffect(() => {
    if (user.id) {
      dispatch(fetchMyTasks({ userId: user.id, username: user.username }));
    }
  }, [dispatch, user.id, user.username]);

  // 5. Modal Helpers
  const openModal = (task = null, columnId = null) => {
    setModal({ isOpen: true, task, columnId });
  };

  const closeModal = () => {
    setModal({ isOpen: false, task: null, columnId: null });
  };

  // 6. Logic Handlers (Wrapped in standard naming)
  const handleAddTask = (newTaskData) => {
    const newTask = {
      id: crypto.randomUUID(),
      ...newTaskData,
      tags: newTaskData.tags || [],
      assignees: newTaskData.assignees || [],
      attachments: [],
    };

    const nextCols = columns.map((c) =>
      c.id === "todo" ? { ...c, tasks: [newTask, ...(c.tasks || [])] } : c
    );

    dispatch(setMyTasksColumns(nextCols));
    closeModal();
  };

  const handleUpdateTask = (updatedTaskData) => {
    if (!modal.task || !modal.columnId) return;

    dispatch(
      updateTask({
        scope: "mytasks",
        columnId: modal.columnId,
        taskId: modal.task.id,
        updates: updatedTaskData,
      })
    );
    closeModal();
  };

  const handleCreateSpace = async () => {
    const newCols = [
      { id: "todo", tasks: [] },
      { id: "inprogress", tasks: [] },
      { id: "completed", tasks: [] },
    ];

    try {
      dispatch(setMyTasksColumns(newCols));
      const result = dispatch(
        createMyTasksSpace({ user, columns: newCols })
      ).unwrap();

      toast.success("Space created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create space");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-800 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
          My Tasks
        </h1>

        {columns.length > 0 && (
          <button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center gap-2 h-10 px-4 text-sm font-bold capitalize"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add New Task</span>
          </button>
        )}
      </div>

      {/* Main Content View */}
      <main>
        {loading && columns.length === 0 ? (
          <div className="h-[60vh] flex justify-center items-center">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : columns.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
            <SquareKanban size={60} className="text-gray-800" />
            <p className="text-gray-500 dark:text-gray-400">
              No board found for your tasks.
              <br />
              You can create your personal board
            </p>
            <button
              onClick={handleCreateSpace}
              className="btn btn-primary flex items-center gap-2 h-10 px-4"
            >
              <Plus size={20} />
              <span>Create My Tasks Space</span>
            </button>
          </div>
        ) : (
          <KanbanBoard
            initialColumns={columns}
            onColumnsChange={(newCols) => dispatch(setMyTasksColumns(newCols))}
            onEditTask={openModal}
            scope="mytasks"
          />
        )}
      </main>

      {/* Modal Components */}
      <AddTaskModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onSubmit={modal.task ? handleUpdateTask : handleAddTask}
        initialTask={modal.task}
        submitLabel={modal.task ? "Update Task" : "Add Task"}
      />
    </div>
  );
};

export default MyTasks;
