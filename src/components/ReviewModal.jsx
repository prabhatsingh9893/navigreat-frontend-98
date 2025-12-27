import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const ReviewModal = ({ mentorId, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mentorId, rating, comment })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Review Submitted!");
                onClose();
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative animate-in fade-in zoom-in duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-center mb-2">Rate Your Session</h2>
                <p className="text-gray-500 text-center text-sm mb-6">How was your mentorship experience?</p>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                size={32}
                                className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    rows="3"
                    placeholder="Write a short review (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </div>
    );
};

export default ReviewModal;
