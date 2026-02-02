export const clearExpiredTagsInBoard = (board, taskIds) => {
  let hasChanged = false;
  const idSet = new Set(taskIds.map((id) => String(id)));

  board.columns.forEach((col) => {
    col.tasks.forEach((task) => {
      // Check both .id and ._id depending on your subdoc schema
      const currentId = String(task.id || task._id);
      if (idSet.has(currentId)) {
        task.tags = []; // Clear the tags array
        hasChanged = true;
      }
    });
  });

  if (hasChanged) {
    board.markModified("columns");
  }

  return hasChanged;
};
