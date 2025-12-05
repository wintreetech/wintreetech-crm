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
} from "../../store/slices/Tasks.slice";

const MyTasks = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ read columns from redux
  const columns = useSelector(selectMyTasksColumns) || [];
  const loading = useSelector(selectTasksLoading); // we still fetch once, but we won’t show loading text.

  // ✅ debounce timer ref
  const saveTimerRef = useRef(null);

  // ✅ fetch once on mount
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

  const handleColumnsChange = (newCols) => {
    // ✅ 1. update UI immediately
    dispatch(setMyTasksColumns(newCols));

    // ✅ 2. debounce backend save + console.log
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      // console.log("✅ Final MyTasks Columns Saved:", newCols);

      dispatch(saveMyTasksColumns(newCols));
    }, 700); // wait 700ms after last interaction
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen dark:bg-gray-800 p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 flex-shrink-0">
          <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
            My Tasks
          </h1>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex min-w-[84px] items-center justify-center gap-2 h-10 px-4 text-sm font-bold tracking-[0.015em] capitalize"
          >
            <Plus size={20} />
            <span className="truncate">Add New Task</span>
          </button>
        </div>

        {/* ✅ Always render board. No loading text flash. */}
        <KanbanBoard
          initialColumns={columns}
          onColumnsChange={handleColumnsChange}
        />

        {/* ✅ If you want a tiny subtle loader only on FIRST fetch, keep this.
            It won't unmount the board and no text shown. */}
        {loading && columns.length === 0 && (
          <div className="p-2 h-screen flex justify-center items-center">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </>
  );
};

export default MyTasks;
