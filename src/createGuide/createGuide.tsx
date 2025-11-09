import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./createGuide.css";

function CreateGuide() {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        notes: ""
    });

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${userData?.accessToken}`,
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            setErrors("Title is required");
            return;
        }
        if (!formData.description.trim()) {
            setErrors("Description is required");
            return;
        }
        if (!formData.location.trim()) {
            setErrors("Location is required");
            return;
        }

        setIsLoading(true);
        setErrors(null);
        setSuccessMessage(null);

        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}user/${userData.id}/guide/`;
            await axios.post(endpoint, formData, getAuthConfig());

            setSuccessMessage("Guide created successfully!");

            // Reset form
            setFormData({
                title: "",
                description: "",
                location: "",
                notes: ""
            });

            navigate("/home");
        } catch (err: any) {
            setErrors(err.response?.data?.message || err.message || "Failed to create guide");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const logoutEndPoint = `${import.meta.env.VITE_BACKEND_URL}auth/logout`;
            await axios.post(logoutEndPoint, {}, getAuthConfig());
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err: any) {
            console.error("Logout error:", err);
        }
    };

    return (
        <div className="create-guide-page">
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="logo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#c89844" strokeWidth="2" />
                                <path d="M8 12h8M12 8v8" stroke="#c89844" strokeWidth="2" />
                            </svg>
                        </div>
                        <span className="brand-name">Daleelak</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/home" className="nav-link ">Browse</Link>
                        <Link to="/create-guide" className="nav-link active">Create Guide</Link>
                    </div>
                    <div className="nav-actions">
                        <button onClick={handleLogout} className="sign-in-btn">
                            {isLoading ? "Logging out..." : "Sign Out"}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="create-guide-content">
                <div className="create-guide-container">
                    <div className="create-guide-header">
                        <h1>Create a New Guide</h1>
                        <p className="subtitle">Share your knowledge and help others navigate services</p>
                    </div>

                    {errors && (
                        <div className="alert alert-error">
                            <span>{errors}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="alert alert-success">
                            <span className="alert-icon">✓</span>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form className="create-guide-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">
                                Guide Title <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., How to Renew Your National ID Card"
                                className="form-input"
                                disabled={isLoading}
                            />
                            <span className="field-hint">Give your guide a clear, descriptive title</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide a detailed description of what this guide covers..."
                                className="form-textarea"
                                rows={5}
                                disabled={isLoading}
                            />
                            <span className="field-hint">Explain what users will learn from this guide</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">
                                Location <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g., Cairo, Giza, Alexandria"
                                className="form-input"
                                disabled={isLoading}
                            />
                            <span className="field-hint">Where is this service or process available?</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">
                                Additional Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Add any important tips, warnings, or additional information..."
                                className="form-textarea"
                                rows={4}
                                disabled={isLoading}
                            />
                            <span className="field-hint">Include helpful tips</span>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate("/home")}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating Guide..." : "Create Guide"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateGuide;