import React, { useState } from "react";
import { Button } from "react-bootstrap";
import TaskProgressModal from "../../pages/Tasks/Workers/TaskProgressModal";
import WorkersTasks from "../../pages/Tasks/Workers/WorkersTasks";

const WorkerDashboard = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container mt-5">
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Update Task Progress
      </Button>

      <TaskProgressModal
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
      <WorkersTasks />
    </div>
  );
};

export default WorkerDashboard;
