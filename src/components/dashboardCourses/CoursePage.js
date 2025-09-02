// src/components/courses/CoursePage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/coursePage.css';

// Import the new tab components
import Stream from './Stream';
import Classwork from './Classwork';
import People from './People';

const API_URL = process.env.REACT_APP_API_URL;

const CoursePage = () => {
    const { courseId } = useParams();
        const [course, setCourse] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [activeTab, setActiveTab] = useState('classwork');

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/group/id?_id=${courseId}`, {
                    headers: { 'Authorization': `MonaEdu ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch course details.');
                
                const data = await response.json();
                if (data.Message === "Done") {
                    setCourse(data.group);
                } else {
                    throw new Error(data.Message || "Could not find course.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [courseId]);

    if (loading) return <div>Loading Course...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!course) return <div>Course not found.</div>;


    return (
        <div className="course-page-container">

            <nav className="course-navigation">
                <button 
                    className={`nav-tab-btn ${activeTab === 'stream' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('stream')}
                >
                    Stream
                </button>
                <button 
                    className={`nav-tab-btn ${activeTab === 'classwork' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('classwork')}
                >
                    Classwork
                </button>
                <button 
                    className={`nav-tab-btn ${activeTab === 'people' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('people')}
                >
                    People
                </button>
            </nav>

            <div className="course-content">
                {activeTab === 'stream' && <Stream />}
                {activeTab === 'classwork' && <Classwork />}
                {activeTab === 'people' && <People />}
            </div>
        </div>
    );
};

export default CoursePage;