import { getIO } from "../socket/index.js";

export const emitEvent = ({ room, event, payload }) => {
  const io = getIO();
  if (room) io.to(room).emit(event, payload);
  else io.emit(event, payload);
};
