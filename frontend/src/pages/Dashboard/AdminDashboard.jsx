// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Button,
//   Container,
//   Row,
//   Col,
//   Card,
//   Nav,
//   Form
// } from "react-bootstrap";
// import {
//   GearFill,
//   PeopleFill,
//   FolderFill,
//   PersonPlusFill,
//   PlusCircleFill,
//   HouseFill,
//   CashStack,
//   PencilSquare,
//   TrashFill
// } from "react-bootstrap-icons";

// import WorkerRegistrationModal from "../../pages/Employee/WorkerRegistrationModal";
// import GroupCreateModal from "../Groups/GroupCreateModal";
// import GroupEditModal from "../../pages/Groups/GroupEditModal";
// import GeneratePayroll from "../../pages/Payroll/GeneratePayroll";
// import "../../assets/css/AdminDashboard.css";

// const AdminDashboard = () => {
//   const [showEmployeeModal, setShowEmployeeModal] = useState(false);
//   const [showGroupModal, setShowGroupModal] = useState(false);
//   const [editModalShow, setEditModalShow] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [activeTab, setActiveTab] = useState("dashboard");

//   const [groups, setGroups] = useState([]);
//   const [loadingGroups, setLoadingGroups] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   const BASE_URL = import.meta.env.VITE_API_URL;

//   const fetchGroups = () => {
//     setLoadingGroups(true);
//     axios
//       .get(`${BASE_URL}backend/api/groups/view.php`, {
//         withCredentials: true,
//       })
//       .then((res) => {
//         if (res.data.success) {
//           setGroups(res.data.groups);
//         } else {
//           console.error("Failed to fetch groups:", res.data.message);
//         }
//         setLoadingGroups(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching groups:", err);
//         setLoadingGroups(false);
//       });
//   };

//   useEffect(() => {
//     fetchGroups();
//   }, []);

//   const handleDeleteGroup = async (id) => {
//     if (!window.confirm("Are you sure to delete this group?")) return;

//     try {
//       const res = await axios.post(`${BASE_URL}backend/api/groups/delete.php`, {
//         id: id,
//       }, {
//         headers: { 'Content-Type': 'application/json' },
//         withCredentials: true,
//       });

//       if (res.data.success) {
//         const updated = groups.filter(group => group.group_id !== id);
//         setGroups(updated);
//       } else {
//         alert(res.data.message);
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//     }
//   };

//   const DashboardContent = () => (
//     <div>
//       <h2 className="mb-4">Admin Dashboard</h2>
//       <Row>
//         <Col md={6} className="mb-4">
//           <Card className="h-100">
//             <Card.Body>
//               <Card.Title>Quick Actions</Card.Title>
//               <Button
//                 variant="primary"
//                 className="me-3 mb-2 d-flex align-items-center"
//                 onClick={() => setShowEmployeeModal(true)}
//               >
//                 <PersonPlusFill className="me-2" /> Register Employee
//               </Button>
//               <Button
//                 variant="success"
//                 className="d-flex align-items-center"
//                 onClick={() => setShowGroupModal(true)}
//               >
//                 <PlusCircleFill className="me-2" /> Create Group
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={6} className="mb-4">
//           <Card className="h-100">
//             <Card.Body>
//               <Card.Title>System Overview</Card.Title>
//               <Card.Text>
//                 Welcome back, Admin! You have full access to manage the system.
//               </Card.Text>
//               <ul className="list-unstyled">
//                 <li className="mb-2">
//                   <PeopleFill className="me-2" /> Manage Employees
//                 </li>
//                 <li className="mb-2">
//                   <FolderFill className="me-2" /> View Reports
//                 </li>
//                 <li>
//                   <GearFill className="me-2" /> System Settings
//                 </li>
//               </ul>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );

//   const GroupsContent = () => {
//     const filteredGroups = groups.filter(group =>
//       group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//       <div>
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h2>Group Management</h2>
//           <Button
//             variant="success"
//             onClick={() => setShowGroupModal(true)}
//             className="d-flex align-items-center"
//           >
//             <PlusCircleFill className="me-2" /> Create Group
//           </Button>
//         </div>

//         <Form.Control
//           type="text"
//           placeholder="Search group by name..."
//           className="mb-4"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />

//         {loadingGroups ? (
//           <p>Loading groups...</p>
//         ) : (
//           <Row>
//             {filteredGroups.length > 0 ? (
//               filteredGroups.map((group) => (
//                 <Col md={6} key={group.group_id} className="mb-4">
//                   <Card>
//                     <Card.Body>
//                       <Card.Title>{group.group_name}</Card.Title>
//                       <Card.Subtitle className="mb-2 text-muted">
//                         Created by: {group.created_by} <br />
//                         On: {new Date(group.created_at).toLocaleDateString()}
//                       </Card.Subtitle>
//                       <Card.Text>{group.description}</Card.Text>
//                       <strong>Members:</strong>
//                       <ul>
//                         {group.members.map((member) => (
//                           <li key={member.id}>
//                             {member.first_name} ({member.email})
//                           </li>
//                         ))}
//                       </ul>
//                       <div className="d-flex gap-2 mt-3">
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={() => {
//                             setSelectedGroup(group);
//                             setEditModalShow(true);
//                           }}
//                         >
//                           <PencilSquare className="me-2" /> Edit
//                         </Button>
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={() => handleDeleteGroup(group.group_id)}
//                         >
//                           <TrashFill className="me-2" /> Delete
//                         </Button>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))
//             ) : (
//               <p>No groups found.</p>
//             )}
//           </Row>
//         )}
//       </div>
//     );
//   };

//   const EmployeesContent = () => (
//     <div>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Employee Management</h2>
//         <Button
//           variant="primary"
//           onClick={() => setShowEmployeeModal(true)}
//           className="d-flex align-items-center"
//         >
//           <PersonPlusFill className="me-2" /> Add Employee
//         </Button>
//       </div>
//       <Card>
//         <Card.Body>
//           <p>Employee list and management tools would appear here.</p>
//         </Card.Body>
//       </Card>
//     </div>
//   );

//   const PayrollContent = () => (
//     <div>
//       <h2 className="mb-4">Payroll Management</h2>
//       <GeneratePayroll />
//     </div>
//   );

//   const SettingsContent = () => (
//     <div>
//       <h2 className="mb-4">System Settings</h2>
//       <Card>
//         <Card.Body>
//           <p>System configuration options would appear here.</p>
//         </Card.Body>
//       </Card>
//     </div>
//   );

//   return (
//     <Container fluid className="admin-dashboard">
//       <Row>
//         {/* Sidebar */}
//         <Col md={3} lg={2} className="sidebar px-0">
//           <div className="sidebar-header p-3">
//             <h4 className="text-white">🛡️ Admin Panel</h4>
//           </div>
//           <Nav variant="pills" className="flex-column">
//             <Nav.Item>
//               <Nav.Link
//                 active={activeTab === "dashboard"}
//                 onClick={() => setActiveTab("dashboard")}
//                 className="d-flex align-items-center"
//               >
//                 <HouseFill className="me-2" /> Dashboard
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 active={activeTab === "employees"}
//                 onClick={() => setActiveTab("employees")}
//                 className="d-flex align-items-center"
//               >
//                 <PeopleFill className="me-2" /> Employees
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 active={activeTab === "groups"}
//                 onClick={() => setActiveTab("groups")}
//                 className="d-flex align-items-center"
//               >
//                 <FolderFill className="me-2" /> Groups
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 active={activeTab === "payroll"}
//                 onClick={() => setActiveTab("payroll")}
//                 className="d-flex align-items-center"
//               >
//                 <CashStack className="me-2" /> Payroll
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 active={activeTab === "settings"}
//                 onClick={() => setActiveTab("settings")}
//                 className="d-flex align-items-center"
//               >
//                 <GearFill className="me-2" /> Settings
//               </Nav.Link>
//             </Nav.Item>
//           </Nav>
//         </Col>

//         {/* Main Content */}
//         <Col md={9} lg={10} className="main-content p-4">
//           {activeTab === "dashboard" && <DashboardContent />}
//           {activeTab === "employees" && <EmployeesContent />}
//           {activeTab === "groups" && <GroupsContent />}
//           {activeTab === "payroll" && <PayrollContent />}
//           {activeTab === "settings" && <SettingsContent />}

//           {/* Modals */}
//           <WorkerRegistrationModal
//             show={showEmployeeModal}
//             handleClose={() => setShowEmployeeModal(false)}
//           />
//           <GroupCreateModal
//             show={showGroupModal}
//             handleClose={() => setShowGroupModal(false)}
//           />
//           {selectedGroup && (
//             <GroupEditModal
//               show={editModalShow}
//               handleClose={() => setEditModalShow(false)}
//               groupData={selectedGroup}
//               refreshGroups={fetchGroups}
//             />
//           )}
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default AdminDashboard;
