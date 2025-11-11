import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../api/client";
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
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const userId = userData?.id;

    const fetchGuide = useCallback(
        async (withSpinner = false) => {
            if (!userId || !id) return;

            try {
                if (withSpinner) setIsPageLoading(true);
                const endpoint = `user/${userId}/guide/${id}`;
                const res = await apiClient.get<Guide>(endpoint);
                setGuide(res.data);
                setError(null);
            } catch (err: any) {
                const message = err?.response?.data?.message ?? err?.message ?? "Failed to load guide";
                setError(message);
            } finally {
                if (withSpinner) setIsPageLoading(false);
            }
        },
        [id, userId],
    );

    const fetchComments = useCallback(async () => {
        if (!userId || !id) return;

        try {
            const endpoint = `user/${userId}/guide/${id}/comment`;
            const res = await apiClient.get<Comment[]>(endpoint);
            setComments(res.data);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        }
    }, [id, userId]);

    const handleVote = async (type: "upvote" | "downvote") => {
        try {
            if (!userId || !id) return;
            const endpoint = `user/${userId}/guide/${id}/${type}`;
            await apiClient.patch(endpoint, {});
            await fetchGuide();
        } catch (err: any) {
            alert(err.response?.data?.message || "Vote failed");
        }
    };

    const handleCommentVote = async (commentId: number, type: "upVote" | "downVote") => {
        try {
            if (!id) return;
            const endpoint = `user/${userId}/guide/${id}/comment/${commentId}/${type}`;
            await apiClient.patch(endpoint, {});
            await fetchComments();
        } catch (err: any) {
            alert(err.response?.data?.message || "Vote failed");
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!userId || !id) return;

        try {
            setIsCommentSubmitting(true);
            const endpoint = `user/${userId}/guide/${id}/comment`;
            await apiClient.post(endpoint, { content: commentText });
            setCommentText("");
            await fetchComments();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add comment");
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    useEffect(() => {
        if (!userId) {
            navigate("/login");
            return;
        }

        fetchGuide(true);
        fetchComments();
    }, [fetchComments, fetchGuide, navigate, userId]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await apiClient.post("auth/logout", {});
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoggingOut(false);
        }
    };

    let content;

    if (isPageLoading) {
        content = (
            <div className="loading-state">
                <div className="spinner" />
                <p>Loading guide details...</p>
            </div>
        );
    } else if (error) {
        content = (
            <div className="error-state">
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button className="retry-btn" onClick={() => fetchGuide(true)}>
                    Try Again
                </button>
            </div>
        );
    } else if (!guide) {
        content = (
            <div className="empty-state">
                <h2>Guide not found</h2>
                <p>The guide you are looking for may have been removed.</p>
                <Link to="/home" className="link-btn">
                    Back to guides
                </Link>
            </div>
        );
    } else {
        content = (
            <>
                <section className="guide-hero">
                    <div className="guide-breadcrumb">
                        <Link to="/home">← Back to Guides</Link>
                    </div>
                    <div className="guide-hero-card">
                        <div className="guide-hero-content">
                            <span className="eyebrow">Guide Overview</span>
                            <h1 className="guide-title">{guide.title}</h1>
                            <div className="guide-meta">
                                <span className="meta-chip">
                                    <span className="meta-icon">👤</span>
                                    {guide.createdBy.fullName}
                                </span>
                                {guide.location && (
                                    <span className="meta-chip">
                                        <span className="meta-icon">📍</span>
                                        {guide.location}
                                    </span>
                                )}
                            </div>
                            <p className="guide-description">{guide.description}</p>

                            {guide.notes && (
                                <div className="guide-notes">
                                    <h3>Pro Tips</h3>
                                    <p>{guide.notes}</p>
                                </div>
                            )}
                        </div>
                        <aside className="guide-stats-card">
                            <h3>Community Feedback</h3>
                            <div className="score-card">
                                <span className="score-value">{guide.upVotes + guide.downVotes}</span>
                                <span className="score-label">Overall score</span>
                            </div>
                            <div className="vote-actions">
                                <button onClick={() => handleVote("upvote")} className="vote-btn primary">
                                    👍 {guide.upVotes}
                                </button>
                                <button onClick={() => handleVote("downvote")} className="vote-btn subtle">
                                    👎 {guide.downVotes}
                                </button>
                            </div>
                            <p className="vote-hint">Share how helpful you found this guide.</p>
                        </aside>
                    </div>
                </section>

                <section className="comments-section">
                    <div className="section-header">
                        <div>
                            <h2>Community Discussion</h2>
                            <p className="section-subtitle">
                                {comments.length === 0
                                    ? "Be the first to share your experience."
                                    : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
                            </p>
                        </div>
                    </div>

                    {comments.length > 0 ? (
                        <div className="comments-list">
                            {comments.map((comment) => (
                                <article key={comment.id} className="comment-card">
                                    <div className="comment-header">
                                        <div className="comment-author">
                                            <span className="avatar">💬</span>
                                            <div>
                                                <p className="author-name">{comment.createdBy.fullName}</p>
                                                <span className="author-role">Community member</span>
                                            </div>
                                        </div>
                                        <div className="comment-votes">
                                            <button
                                                onClick={() => handleCommentVote(comment.id, "upVote")}
                                                className="comment-btn positive"
                                            >
                                                👍 {comment.upVotes}
                                            </button>
                                            <button
                                                onClick={() => handleCommentVote(comment.id, "downVote")}
                                                className="comment-btn negative"
                                            >
                                                👎 {comment.downVotes}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="comment-body">{comment.content}</p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-comments">
                            <p>No comments yet. Start the conversation below.</p>
                        </div>
                    )}

                    <form onSubmit={handleAddComment} className="comment-form">
                        <label htmlFor="comment" className="form-label">
                            Add your perspective
                        </label>
                        <textarea
                            id="comment"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share tips, updates, or personal experience..."
                            required
                            rows={4}
                            disabled={isCommentSubmitting}
                        />
                        <div className="form-actions">
                            <button type="submit" className="add-comment-btn" disabled={isCommentSubmitting}>
                                {isCommentSubmitting ? "Posting..." : "Post Comment"}
                            </button>
                        </div>
                    </form>
                </section>
            </>
        );
    }

    return (
        <div className="guide-details-page">
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
                        <Link to="/home" className="nav-link">Browse</Link>
                        <Link to="/create-guide" className="nav-link">Create Guide</Link>
                    </div>
                    <div className="nav-actions">
                        <button onClick={handleLogout} className="sign-in-btn">
                            {isLoggingOut ? "Logging out..." : "Sign Out"}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="guide-details-content">
                {content}
            </main>
        </div>
    );
}
