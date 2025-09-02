// src/components/courses/Stream.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/stream.css';
import { useConfirmation } from '../../utils/ConfirmationModal';

const API_URL = process.env.REACT_APP_API_URL;


const Stream = () => {
    const { courseId } = useParams();
    const [inviteCode, setInviteCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showError } = useConfirmation();
    const [buttonText, setButtonText] = useState('Copy Code');

    const extractCodeFromUrl = (url) => {
        try {
            const urlParts = url.split('/');
            return urlParts[urlParts.length - 1];
        } catch {
            return null;
        }
    };

    const fetchInviteLink = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/invite/link?groupid=${courseId}`, {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            if (response.status === 404) { 
                setInviteCode(null);
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch invite link.');
            
            const data = await response.json();
            if (data.inviteLink) {
                setInviteCode(extractCodeFromUrl(data.inviteLink));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchInviteLink();
    }, [fetchInviteLink]);

    const handleGenerateLink = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/invite/create`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupid: courseId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to generate link.');
            
            fetchInviteLink();
        } catch (err) {
            await showError({
                title: 'Error generating link',
                message: err.message || 'An error occured while generating link',
                confirmText: 'Cancel'
            });
        }
    };

    const handleCopyLink = () => {
        const fullLink = `${inviteCode}`;
        navigator.clipboard.writeText(fullLink)
        .then(() => {
            setButtonText('Copied!');
            setTimeout(() => {
                setButtonText('Copy Code');
            }, 3000);
        })
            .catch(() => alert('Failed to copy code.'));
    };

    return (
        <div className="stream-page">
            <div className="course-code-panel">
                <div className="course-code-header">
                    <h3>Course Code</h3>
                    {loading ? null : inviteCode ? (
                        <div>
                            <button className="copy-link-btn" onClick={handleCopyLink} >{buttonText}</button>
                            <button className="regenerate-link-btn" onClick={handleGenerateLink} >Regenerate Link</button>
                        </div>
                    ) : ( 
                        <button className="generate-link-btn" onClick={handleGenerateLink}>Generate Invite Link</button>
                    )}
                </div>
                {loading ? <p>Loading invite code...</p> : (
                    inviteCode ? <div className="course-code-display">{inviteCode}</div> : <p>No active invite link. Generate one to invite students.</p>
                )}
            </div>
            
            {/* <div className="stream-feed">
                <h3>Recent Activity</h3>
                <div className="stream-item">
                    <div className="stream-item-icon">A</div>
                    <div className="stream-item-content">
                        <p className="item-title">Teacher posted a new assignment: Algebra Homework 1</p>
                        <p className="item-date">Aug 20, 2025</p>
                    </div>
                </div>
            </div> */}

        </div>
    );
};

export default Stream;