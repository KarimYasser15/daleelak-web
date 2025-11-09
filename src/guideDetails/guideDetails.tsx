import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./guideDetails.css";

interface User {
    id: number;
    fullName: string;
}

interface Comment {
    id: number;
    content: string;
    upVotes: number;
    downVotes: number;
    createdBy: User;
}

interface Guide {
    id: number;
    title: string;
    description: string;
    location?: string;
    notes?: string;
    upVotes: number;
    downVotes: number;
    createdBy: User;
}

export default function GuideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;

    const [guide, setGuide] = useState<Guide | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${userData?.accessToken}`,
        },
    });

    // Fetch guide details
    const fetchGuide = async () => {
        try {
            setIsLoading(true);
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}user/${userData.id}/guide/${id}`;
            const res = await axios.get(endpoint, getAuthConfig());
            setGuide(res.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch comments for this guide
    const fetchComments = async () => {
        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}user/${userData.id}/guide/${id}/comment`;
            const res = await axios.get(endpoint, getAuthConfig());
            setComments(res.data);
        } catch (err: any) {
            console.error("Failed to fetch comments:", err);
        }
    };

    const handleVote = async (type: "upvote" | "downvote") => {
        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}user/${userData.id}/guide/${id}/${type}`;
            await axios.patch(endpoint, {}, getAuthConfig());
            fetchGuide();
        } catch (err: any) {
            alert(err.response?.data?.message || "Vote failed");
        }
    };

    const handleCommentVote = async (commentId: number, type: "upvote" | "downvote") => {
        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}guide/${id}/comment/${commentId}/${type}`;
            await axios.post(endpoint, {}, getAuthConfig());
            fetchComments();
        } catch (err: any) {
            alert(err.response?.data?.message || "Vote failed");
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}user/${userData.id}/guide/${id}/comment`;
            await axios.post(endpoint, { content: commentText }, getAuthConfig());
            setCommentText("");
            fetchComments();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add comment");
        }
    };

    useEffect(() => {
        fetchGuide();
        fetchComments();
    }, [id]);

    if (isLoading) return <div className="loading">Loading guide...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!guide) return <div className="empty">Guide not found</div>;

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const logoutEndPoint = `${import.meta.env.VITE_BACKEND_URL}auth/logout`;
            await axios.post(logoutEndPoint, {}, getAuthConfig());
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="guide-details-page">
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-brand">
                        <span className="brand-name">Daleelak</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/home" className="nav-link">Browse</Link>
                        <Link to="/create-guide" className="nav-link">Create Guide</Link>
                    </div>
                    <div className="nav-actions">
                        <button onClick={handleLogout} className="sign-in-btn">
                            {isLoading ? "Logging out..." : "Sign Out"}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="guide-details-container">
                <h1 className="guide-title">{guide.title}</h1>
                <p className="guide-author">By {guide.createdBy.fullName}</p>
                <p className="guide-description">{guide.description}</p>

                {guide.location && <p><strong>Location:</strong> {guide.location}</p>}
                {guide.notes && <p><strong>Notes:</strong> {guide.notes}</p>}

                <div className="vote-section">
                    <button onClick={() => handleVote("upvote")} className="vote-btn">👍 {guide.upVotes}</button>
                    <button onClick={() => handleVote("downvote")} className="vote-btn">👎 {guide.downVotes}</button>
                </div>

                <hr />

                <div className="comments-section">
                    <h2>Comments</h2>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-card">
                                <p className="comment-author">{comment.createdBy.fullName}:</p>
                                <p>{comment.content}</p>
                                <div className="comment-votes">
                                    <button onClick={() => handleCommentVote(comment.id, "upvote")} className="comment-btn">
                                        👍 {comment.upVotes}
                                    </button>
                                    <button onClick={() => handleCommentVote(comment.id, "downvote")} className="comment-btn">
                                        👎 {comment.downVotes}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No comments yet.</p>
                    )}

                    <form onSubmit={handleAddComment} className="comment-form">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            required
                        />
                        <button type="submit" className="add-comment-btn">Add Comment</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
