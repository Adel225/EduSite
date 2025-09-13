    import React, { useState, useEffect } from "react";
    import Modal from "react-modal";
    import { useConfirmation } from '../../utils/ConfirmationModal';

    Modal.setAppElement("#root");

    const API_URL = process.env.REACT_APP_API_URL;

    const toDatetimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
    };

    export function AssignmentModal({ isOpen, onClose, courseId, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        file: null,
        answerFile: null,
        startDate: '',
        endDate: '', 
        description : ''
    });
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [error, setError] = useState('');
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const { showError } = useConfirmation();
    const { showSuccess } = useConfirmation();

    // Fetch topics when modal opens
    useEffect(() => {
        if (isOpen && courseId) {
            fetchTopics();
        }
    }, [isOpen, courseId]);

    const fetchTopics = async () => {
        setLoadingTopics(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections?groupIds=${courseId}`, {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            const data = await response.json();
            if (data.message === "Sections fetched successfully") {
                setTopics(data.data || []);
            } else {
                setTopics([]);
            }
        } catch (err) {
            console.error('Error fetching topics:', err);
            setTopics([]);
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate || !formData.endDate || !selectedTopic) {
            setError('Please fill in all required fields and select a topic');
            return;
        }

        setSubmitStatus('Creating assignment...');
        setError('');

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('file', formData.file);
            if (formData.answerFile) {
                formDataToSend.append('answerFile', formData.answerFile);
            }
            formDataToSend.append('startDate', formData.startDate);
            formDataToSend.append('endDate', formData.endDate);
            formDataToSend.append('teacherNotes', formData.teacherNotes);
            formDataToSend.append('groupIds', courseId);
            
            const createResponse = await fetch(`${API_URL}/assignments/create`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}` },
                body: formDataToSend
            });

            const result = await createResponse.json();
            if (!createResponse.ok) {
                console.log(result);
                handleClose();
                setSubmitStatus('');
                await showError({
                    title: 'Error',
                    message: result.message || 'Failed to create assignment',
                    confirmText: 'Cancel'
                });
                // throw new Error(result.message || 'Failed to create assignment');
            }

        if (result.message === "Assignment created successfully") {
            try {
                // The API response structure might vary, so we need to handle different possible formats
                let assignmentId = null;
                if (result.assignment && result.assignment._id) {
                    assignmentId = result.assignment._id;
                } else if (result._id) {
                    assignmentId = result._id;
                } else if (result.id) {
                    assignmentId = result.id;
                } else {
                    console.warn('Could not find assignment ID in response for linking');
                    throw new Error('Assignment ID not found in response');
                }

                const linkResponse = await fetch(`${API_URL}/sections/${selectedTopic}/update-links`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `MonaEdu ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        itemsToAdd: [{ type: 'assignment', id: assignmentId }],
                        itemsToRemove: []
                    }),
                });
                
                if (linkResponse.ok) {
                    setSubmitStatus('');
                    onSuccess();
                    handleClose();
                    await showSuccess({
                        title: 'Success',
                        message: 'Assignment created and linked to topic successfully!',
                        confirmText: 'Great!'
                    });
                }
            } catch (linkErr) {
                console.warn('Error linking assignment to topic: ', linkErr);
                setSubmitStatus('');
                handleClose();
                await showError({
                    title: 'Error',
                    message:  `Error linking assignment to topic: ${linkErr}`,
                    confirmText: 'Cancel'
                });
            }
            
        } else {
            await showError({
                title: 'Error',
                message: 'Unexpected response format',
                confirmText: 'Cancel'
            });
            throw new Error('Unexpected response format');
        }
        } catch (err) {
            // setError(err.message || 'Error creating assignment');
            setSubmitStatus('');
            handleClose();
            await showError({
                title: 'Error',
                message: 'Error occured while creating assignment!',
                confirmText: 'Cancel'
            });
        }
    };

    const handleClose = () => {
        setFormData({ name: '', file: null, answerFile: null, startDate: '', endDate: '' });
        setSelectedTopic('');
        setSubmitStatus('');
        setError('');
        onClose();
    };

    const handleCreateTopic = async () => {
        if (!newTopicName.trim()) {
            return;
        }
        setSubmitStatus('Creating topic...');
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections/create`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTopicName,
                    description : "",
                    groupIds: [courseId]
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create topic');
            
            await fetchTopics(); 
            setSelectedTopic(result.data._id);
            setIsCreatingTopic(false);
            setNewTopicName('');
    
        } catch (err) {
            alert(`Error: ${err.message}`); 
        } finally {
            setSubmitStatus('');
        }
    };

    return (
        <Modal 
        isOpen={isOpen} 
        onRequestClose={handleClose} 
        className="form-modal" 
        overlayClassName="form-modal-overlay"
        >
        <div className="modal-header">
        <h2>Create Assignment</h2>
            <button onClick={handleClose} className="close-modal-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label>Assignment Name *</label>
                <input
                    type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter assignment name"
                        required
                    />
            </div>

            <div className="form-group">
            <label>Description *</label>
                <textarea
                    name="description"
                    value={formData.teacherNotes}
                    onChange={handleChange}
                    placeholder="Enter assignment description"
                />
            </div>

            <div className="form-group">
            <label>Assignment File (PDF) - Optional</label>
            <input
                type="file"
                name="file"
                accept=".pdf"
                onChange={handleChange}
            />
            </div>

            <div className="form-group">
            <label>Answer File (PDF) - Optional</label>
            <input
                type="file"
                name="answerFile"
                accept=".pdf"
            onChange={handleChange}
        />
            </div>

            <div className="form-group">
            <label>Start Date & Time *</label>
            <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
            onChange={handleChange}
                required
        />
            </div>

            <div className="form-group">
            <label>End Date & Time *</label>
        <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
            onChange={handleChange}
                required
            />
            </div>

            <div className="form-group">
            <label>Select Topic *</label>
            {isCreatingTopic ? (
                <div className="inline-create-topic">
                    <input
                        type="text"
                        placeholder="Enter new topic name..."
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                    />
                    <button type="button" className="save-inline-btn" onClick={handleCreateTopic}>Save</button>
                    <button type="button" className="cancel-inline-btn" onClick={() => setIsCreatingTopic(false)}>Cancel</button>
                </div>
            ) : (
                <>
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        required
                        disabled={loadingTopics}
                    >
                        <option value="">{loadingTopics ? 'Loading topics...' : 'Choose a topic'}</option>
                        {topics.map((topic) => (
                            <option key={topic._id} value={topic._id}>
                                {topic.name}
                            </option>
                        ))}
                    </select>
                    <button 
                        type="button" 
                        className="create-topic-btn"
                        onClick={() => setIsCreatingTopic(true)}
                        disabled={loadingTopics}
                    >
                        Create New Topic
                    </button>
                </>
            )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {submitStatus && <div className="submit-status">{submitStatus}</div>}

            <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
                Cancel
            </button>
            <button 
                type="submit" 
                className="submit-btn"
                disabled={submitStatus && submitStatus !== ''}
            >
                {submitStatus && submitStatus !== '' ? submitStatus : 'Create Assignment'}
            </button>
            </div>
        </form>
        </Modal>
    );
    }

    export function ExamModal({ isOpen, onClose, courseId, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        file: null,
        startDate: '',
        endDate: ''
    });
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [error, setError] = useState('');
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const { showError } = useConfirmation();
    const { showSuccess } = useConfirmation();

    // Fetch topics when modal opens
    useEffect(() => {
        if (isOpen && courseId) {
            fetchTopics();
        }
    }, [isOpen, courseId]);

    const fetchTopics = async () => {
        setLoadingTopics(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections?groupIds=${courseId}`, {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            const data = await response.json();
            if (data.message === "Sections fetched successfully") {
                setTopics(data.data || []);
            } else {
                setTopics([]);
            }
        } catch (err) {
            console.error('Error fetching topics:', err);
            setTopics([]);
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.file || !formData.startDate || !formData.endDate || !selectedTopic) {
            setError('Please fill in all required fields and select a topic');
            return;
        }

        setSubmitStatus('Creating exam...');
        setError('');

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('Name', formData.name);
            formDataToSend.append('file', formData.file);
            formDataToSend.append('startdate', formData.startDate);
            formDataToSend.append('enddate', formData.endDate);
            formDataToSend.append('groupIds', courseId);
            formDataToSend.append('allowSubmissionsAfterDueDate', false);
            

        const createResponse = await fetch(`${API_URL}/exams/create`, {
            method: 'POST',
            headers: { 'Authorization': `MonaEdu ${token}` },
            body: formDataToSend
        });

        const result = await createResponse.json();
        if (!createResponse.ok) {
            console.log(result);
            handleClose();
            setSubmitStatus('');
            await showError({
                title: 'Error',
                message: result.message || 'Failed to create exam',
                confirmText: 'Cancel'
            });
            // throw new Error(result.message || 'Failed to create exam');
        }

        if (result.message === "Exam created successfully") {
            // Link the exam to the selected topic
            try {
                // The API response structure might vary, so we need to handle different possible formats
                let examId = null;
                if (result.exam && result.exam._id) {
                    examId = result.exam._id;
                } else if (result._id) {
                    examId = result._id;
                } else if (result.id) {
                    examId = result.id;
                } else {
                    console.warn('Could not find exam ID in response for linking');
                    throw new Error('Exam ID not found in response');
                }

                const linkResponse = await fetch(`${API_URL}/sections/${selectedTopic}/update-links`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `MonaEdu ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        itemsToAdd: [{ type: 'exam', id: examId }],
                        itemsToRemove: []
                    }),
                });
                
                if (linkResponse.ok){
                    setSubmitStatus('');
                    onSuccess();
                    handleClose();
                    await showSuccess({
                        title: 'Success',
                        message: 'Exam created and linked to topic successfully!',
                        confirmText: 'Great!'
                    });
                }
            } catch (linkErr) {
                console.warn('Error linking exam to topic:', linkErr);
                setSubmitStatus('');
                handleClose();
                await showError({
                    title: 'Error',
                    message: `Error linking exam to topic: ${linkErr}`,
                    confirmText: 'Cancel'
                });
            }

        } else {
            await showError({
                title: 'Error',
                message: 'Unexpected response format',
                confirmText: 'Cancel'
            });
            throw new Error('Unexpected response format');
        }
        } catch (err) {
            // setError(err.message || 'Error creating exam');
            setSubmitStatus('');
            handleClose();
            await showError({
                title: 'Error',
                message: 'Error occured while creating exam!',
                confirmText: 'Cancel'
            });
        }
    };

    const handleClose = () => {
        setFormData({ name: '', file: null, startDate: '', endDate: '' });
        setSelectedTopic('');
        setSubmitStatus('');
        setError('');
        onClose();
    };

    const handleCreateTopic = async () => {
        if (!newTopicName.trim()) {
            return;
        }
        setSubmitStatus('Creating topic...');
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections/create`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTopicName,
                    description : "",
                    groupIds: [courseId]
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create topic');
            
            await fetchTopics(); 
            setSelectedTopic(result.data._id);
            setIsCreatingTopic(false);
            setNewTopicName('');
    
        } catch (err) {
            alert(`Error: ${err.message}`); 
        } finally {
            setSubmitStatus('');
        }
    };

    return (
        <Modal 
        isOpen={isOpen} 
        onRequestClose={handleClose} 
        className="form-modal" 
        overlayClassName="form-modal-overlay"
        >
        <div className="modal-header">
        <h2>Create Exam</h2>
            <button onClick={handleClose} className="close-modal-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
            <label>Exam Name *</label>
        <input
            type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter exam name"
                required
            />
            </div>

            <div className="form-group">
            <label>Exam File (PDF) *</label>
            <input
                type="file"
                name="file"
                accept=".pdf"
            onChange={handleChange}
                required
            />
            </div>

            <div className="form-group">
            <label>Start Date & Time *</label>
            <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
            onChange={handleChange}
                required
        />
            </div>

            <div className="form-group">
            <label>End Date & Time *</label>
        <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
            onChange={handleChange}
                required
            />
            </div>

            <div className="form-group">
            <label>Select Topic *</label>
            {isCreatingTopic ? (
                <div className="inline-create-topic">
                    <input
                        type="text"
                        placeholder="Enter new topic name..."
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                    />
                    <button type="button" className="save-inline-btn" onClick={handleCreateTopic}>Save</button>
                    <button type="button" className="cancel-inline-btn" onClick={() => setIsCreatingTopic(false)}>Cancel</button>
                </div>
            ) : (
                <>
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        required
                        disabled={loadingTopics}
                    >
                        <option value="">{loadingTopics ? 'Loading topics...' : 'Choose a topic'}</option>
                        {topics.map((topic) => (
                            <option key={topic._id} value={topic._id}>
                                {topic.name}
                            </option>
                        ))}
                    </select>
                    <button 
                        type="button" 
                        className="create-topic-btn"
                        onClick={() => setIsCreatingTopic(true)}
                        disabled={loadingTopics}
                    >
                        Create New Topic
                    </button>
                </>
            )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {submitStatus && <div className="submit-status">{submitStatus}</div>}

            <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
                Cancel
            </button>
            <button 
                type="submit" 
                className="submit-btn"
                disabled={submitStatus && submitStatus !== ''}
            >
                {submitStatus && submitStatus !== '' ? submitStatus : 'Create Exam'}
            </button>
            </div>
        </form>
        </Modal>
    );
    }

    export function MaterialModal({ isOpen, onClose, courseId, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        files: null,
        links: [''],
        publishDate: ''
    });
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [error, setError] = useState('');
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const { showError } = useConfirmation();
    const { showSuccess } = useConfirmation();

    // Fetch topics when modal opens
    useEffect(() => {
        if (isOpen && courseId) {
            fetchTopics();
        }
    }, [isOpen, courseId]);

    const fetchTopics = async () => {
        setLoadingTopics(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections?groupIds=${courseId}`, {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            const data = await response.json();
            if (data.message === "Sections fetched successfully") {
                setTopics(data.data || []);
            } else {
                setTopics([]);
            }
        } catch (err) {
            console.error('Error fetching topics:', err);
            setTopics([]);
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: files ? files : value
        }));
    };

    const handleLinkChange = (index, event) => {
        const newLinks = [...formData.links];
        newLinks[index] = event.target.value;
        setFormData(prev => ({ ...prev, links: newLinks }));
    };

    const addLinkInput = () => setFormData(prev => ({ ...prev, links: [...prev.links, ''] }));
    const removeLinkInput = (index) => setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.description || !formData.publishDate || !selectedTopic) {
            setError('Please fill in all required fields and select a topic');
            return;
        }

        setSubmitStatus('Creating material...');
        setError('');

        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        let uploadedFilesData = [];
        if (formData.files && formData.files.length > 0) {
            setSubmitStatus(`Uploading ${formData.files.length} file(s)...`);
            const uploadPromises = Array.from(formData.files).map(async (file) => {
            const getUrlResponse = await fetch(`${API_URL}/material/generate-upload-url`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileType: file.type, materialName: file.name }),
            });
            if (!getUrlResponse.ok) throw new Error(`Could not get upload URL for ${file.name}.`);
            const { uploadUrl, s3Key } = await getUrlResponse.json();
            const uploadResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
            if (uploadResponse.status !== 200) throw new Error(`Failed to upload ${file.name}.`);
            const cleanPath = new URL(uploadUrl).origin + new URL(uploadUrl).pathname;
            return { key: s3Key, path: cleanPath, originalName: file.name, fileType: file.type };
            });
            uploadedFilesData = await Promise.all(uploadPromises);
        }

        setSubmitStatus('Finalizing material...');
        
        const materialPayload = {
            name: formData.name,
            description: formData.description,
            groupIds: [courseId],
            linksArray: formData.links.filter(link => link.trim() !== ''),
            files: uploadedFilesData,
            publishDate: formData.publishDate,
        };
        
        const createResponse = await fetch(`${API_URL}/material/create`, {
            method: 'POST',
            headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(materialPayload),
        });
        
        const result = await createResponse.json();
        if (!createResponse.ok) {
            console.log(result);
            handleClose();
            setSubmitStatus('');
            await showError({
                title: 'Error',
                message: result.message || 'Failed to create material',
                confirmText: 'Cancel'
            });
            // throw new Error(result.message || 'Failed to create material.');
        }
        
        // Link the material to the selected topic
        try {
            // The API response structure might vary, so we need to handle different possible formats
            let materialId = null;
            if (result.material && result.material._id) {
                materialId = result.material._id;
            } else if (result._id) {
                materialId = result._id;
            } else if (result.id) {
                materialId = result.id;
            } else {
                console.warn('Could not find material ID in response for linking');
                throw new Error('Material ID not found in response');
            }

            const linkResponse = await fetch(`${API_URL}/sections/${selectedTopic}/update-links`, {
                method: 'PUT',
                headers: {
                    'Authorization': `MonaEdu ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemsToAdd: [{ type: 'material', id: materialId }],
                    itemsToRemove: []
                }),
            });
            
            if (linkResponse.ok) {
                setSubmitStatus('');
                onSuccess();
                handleClose();
                await showSuccess({
                    title: 'Success',
                    message: 'Material created and linked to topic successfully!',
                    confirmText: 'Great!'
                });
            }
        } catch (linkErr) {
            console.warn('Error linking material to topic:', linkErr);
            setSubmitStatus('');
            handleClose();
            await showError({
                title: 'Error',
                message:  `Error linking Material to topic: ${linkErr}`,
                confirmText: 'Cancel'
            });
        }

        } catch (err) {
            // setError(err.message || 'Error creating material');
            setSubmitStatus('');
            handleClose();
            await showError({
                title: 'Error',
                message: 'Error occured while creating material!',
                confirmText: 'Cancel'
            });
        }
    };

    const handleClose = () => {
        setFormData({ name: '', description: '', files: null, links: [''], publishDate: '' });
        setSelectedTopic('');
        setSubmitStatus('');
        setError('');
        onClose();
    };

    const handleCreateTopic = async () => {
        if (!newTopicName.trim()) {
            return;
        }
        setSubmitStatus('Creating topic...');
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections/create`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTopicName,
                    description : "",
                    groupIds: [courseId]
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create topic');
            
            await fetchTopics(); 
            setSelectedTopic(result.data._id);
            setIsCreatingTopic(false);
            setNewTopicName('');
    
        } catch (err) {
            alert(`Error: ${err.message}`); 
        } finally {
            setSubmitStatus('');
        }
    };

    return (
        <Modal 
        isOpen={isOpen} 
        onRequestClose={handleClose} 
        className="form-modal" 
        overlayClassName="form-modal-overlay"
        >
        <div className="modal-header">
        <h2>Create Material</h2>
            <button onClick={handleClose} className="close-modal-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
            <label>Material Name *</label>
        <input
            type="text"
                name="name"
                value={formData.name}
            onChange={handleChange}
                placeholder="Enter material name"
                required
        />
            </div>

            <div className="form-group">
            <label>Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                        placeholder="Enter material description"
                        required
                    />
            </div>

            <div className="form-group">
            <label>Publish Date & Time *</label>
            <input
                type="datetime-local"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                required
            />
            </div>

            <div className="form-group">
                <label>Select Topic *</label>
                {isCreatingTopic ? (
                    <div className="inline-create-topic">
                        <input
                            type="text"
                            placeholder="Enter new topic name..."
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                        />
                        <button type="button" className="save-inline-btn" onClick={handleCreateTopic}>Save</button>
                        <button type="button" className="cancel-inline-btn" onClick={() => setIsCreatingTopic(false)}>Cancel</button>
                    </div>
                ) : (
                    <>
                        <select
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            required
                            disabled={loadingTopics}
                        >
                            <option value="">{loadingTopics ? 'Loading topics...' : 'Choose a topic'}</option>
                            {topics.map((topic) => (
                                <option key={topic._id} value={topic._id}>
                                    {topic.name}
                                </option>
                            ))}
                        </select>
                        <button 
                            type="button" 
                            className="create-topic-btn"
                            onClick={() => setIsCreatingTopic(true)}
                            disabled={loadingTopics}
                        >
                            Create New Topic
                        </button>
                    </>
                )}
            </div>

            <div className="form-group">
            <label>Material Files *</label>
            <input
                type="file"
                name="files"
                multiple
                onChange={handleChange}
                required
            />
            </div>

            <div className="form-group">
            <label>YouTube Links (Optional)</label>
            {formData.links.map((link, index) => (
                <div key={index} className="link-input-group">
                <input
                    type="url"
                    placeholder="https://example.com/..."
                    value={link}
                    onChange={(e) => handleLinkChange(index, e)}
                />
                {formData.links.length > 1 && (
                    <button 
                    type="button" 
                    className="remove-link-btn" 
                    onClick={() => removeLinkInput(index)}
                    >
                    ×
                    </button>
                )}
                </div>
            ))}
            <button type="button" className="add-link-btn" onClick={addLinkInput}>
                + Add another link
            </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {submitStatus && <div className="submit-status">{submitStatus}</div>}

            <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
                Cancel
            </button>
            <button 
                type="submit" 
                className="submit-btn"
                disabled={submitStatus && submitStatus !== ''}
            >
                {submitStatus && submitStatus !== '' ? submitStatus : 'Create Material'}
            </button>
            </div>
        </form>
        </Modal>
    );
    }
