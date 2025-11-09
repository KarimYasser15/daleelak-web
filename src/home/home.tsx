import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

interface Guide {
    id: number;
    title: string;
    description: string;
    upVotes: number;
    downVotes: number;
    createdBy: User;
    location?: string;
    notes?: string;
}
interface User {
    id: number;
    fullName: string;
    email: string;
}

function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [errors, setErrors] = useState<string | null>(null);
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;

    // Create axios config with auth header
    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${userData?.accessToken}`,
        },
    });

    const fetchGuides = async () => {
        if (!userData) return;
        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}user/${userData.id}/guide/`;
            const res = await axios.get(endpoint, getAuthConfig());
            setGuides(res.data);
        } catch (err: any) {
            setErrors(err.message);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, []);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const logoutEndPoint = `${import.meta.env.VITE_BACKEND_URL}auth/logout`;
            await axios.post(logoutEndPoint, {}, getAuthConfig());
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err: any) {
            setErrors(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleCardClick = (guide: Guide) => {
        setSelectedGuide(guide);
    };

    const closeModal = () => {
        setSelectedGuide(null);
    };


    return (
        <div className="home">
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
                        <Link to="/browse" className="nav-link active">Browse</Link>
                        <Link to="/create-guide" className="nav-link">Create Guide</Link>
                    </div>
                    <div className="nav-actions">
                        <button onClick={handleLogout} className="sign-in-btn">
                            {isLoading ? "Logging out..." : "Sign Out"}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="main-content">
                <div className="content-header">
                    <h1>Browse</h1>
                    <p className="subtitle">All available guides</p>
                </div>


                <div className="results-info">
                    <span className="results-count">{guides.length} results</span>
                </div>

                <div className="guides-grid">
                    {guides.map((guide) => (
                        <div
                            key={guide.id}
                            className="guide-item"
                            onClick={() => handleCardClick(guide)}
                        >
                            <div className="guide-header">
                                <h2 className="guide-title">
                                    {guide.title}
                                    <span className="verified-badge">✓</span>
                                </h2>
                            </div>

                            <p className="guide-description">{guide.description}</p>

                            {guide.createdBy && (
                                <div className="guide-author">
                                    <div className="author-avatar">👤</div>
                                    <span className="author-name">{guide.createdBy.fullName}</span>
                                </div>
                            )}

                            <div className="modal-votes">

                                👍 Upvote ({guide.upVotes})

                                👎 Downvote ({guide.downVotes})
                            </div>
                        </div>
                    ))}
                </div>


                {guides.length === 0 && (
                    <div className="empty-state">
                        <p>No guides found. Try adjusting your search.</p>
                    </div>
                )}
            </div>

            {selectedGuide && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>

                        <div className="modal-header">
                            <h2 className="modal-title">
                                {selectedGuide.title}
                                <span className="verified-badge">✓</span>
                            </h2>
                            {selectedGuide.createdBy && (
                                <div className="guide-author">
                                    <div className="author-avatar">👤</div>
                                    <span className="author-name">{selectedGuide.createdBy?.fullName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;