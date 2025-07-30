import React, { useState } from "react";
import TaskList from "../../pages/Tasks/Admin/TaskList";
import TaskAssignment from "../../pages/Tasks/Admin/TaskAssignment";

const TaskContext = () => {
  const [showOnlyTaskList, setShowOnlyTaskList] = useState(false);

  const toggleView = () => {
    setShowOnlyTaskList((prev) => !prev);
  };

return (
  <div>
    {/* Header Button */}
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="mb-0">Task Management</h2>
      <button className="btn btn-primary" onClick={toggleView}>
        {showOnlyTaskList ? "Hide Task List" : "Show Task List"}
      </button>
    </div>

    {/* Conditional Rendering */}
    {!showOnlyTaskList && (
      <>
        <TaskAssignment />
      </>
    )}

    {showOnlyTaskList && <TaskList />}
  </div>
);
}

export default TaskContext;
