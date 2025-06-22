import React, { useState } from 'react';
import DashboardSection from './DashboardSection';
import '../styles/Dashboard.css';
import Sidebar from './Sidebar';
import Header from './header';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const assignmentsData = [
    { grade: 'Grade 12', count: 2, type: ' Assignments', },
    { grade: 'Grade 11', count: 1, type: ' Assignment', },
    { grade: 'Grade 10', count: 3, type: ' Assignments' , },
    { grade: 'Grade 9', count: 1, type: ' Assignment' , },
  ];

  const examsData = [
    { grade: 'Grade 12', count: 3, type: ' Exams' },
    { grade: 'Grade 11', count: 10, type: ' Exams' },
    { grade: 'Grade 10', count: 4, type: ' Exams' },
    { grade: 'Grade 9', count: 1, type: ' Exam' },
  ];

  const materialsData = [
    { grade: 'Grade 12', count: 2, type: ' Files' },
    { grade: 'Grade 11', count: 1, type: ' File' },
    { grade: 'Grade 10', count: 3, type: ' Files' },
    { grade: 'Grade 9', count: 1, type: ' File' },
  ];

  const groupsData = [
    { grade: 'Grade 12', count: 2, type: ' Groups' },
    { grade: 'Grade 11', count: 1, type: ' Group' },
    { grade: 'Grade 10', count: 3, type: ' Groups' },
    { grade: 'Grade 9', count: 1, type: ' Group' },
  ];

  return (
    <div className="dashboard-container">
      <Header onHamburgerClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard">
        <div className="dashboard-row">
          <DashboardSection title="Assignments" data={assignmentsData} />
          <hr className='vertical'></hr>
          <DashboardSection title="Materials" data={materialsData} />
        </div>
        
        <hr className='horizontal-line'></hr>

        <div className="dashboard-row">
          <DashboardSection title="Exams" data={examsData} />
          <hr className='vertical'></hr>
          <DashboardSection title="Groups" data={groupsData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;