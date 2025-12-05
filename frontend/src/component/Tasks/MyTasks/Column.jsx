import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

const Column = ({ column, title, onTaskExpand }) => {
  return (
    <div className="bg-gray-100 rounded-xl p-2 flex flex-col gap-2 h-full dark:bg-gray-900 overflow-hidden">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2 transition-colors duration-200 p-1 flex-1 ${
              snapshot.isDraggingOver
                ? "bg-gray-200/70 dark:bg-gray-700/70 rounded-lg"
                : ""
            }`}
            style={{ minHeight: "100%" }}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onExpand={() => onTaskExpand(task, column.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
