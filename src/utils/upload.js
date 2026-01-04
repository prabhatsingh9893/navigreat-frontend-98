import { API_BASE_URL } from '../config';

/**
 * Uploads a file (image or video) to Cloudinary via the backend.
 * @param {File} file - The file object to upload.
 * @returns {Promise<{url: string, type: string}>} - The URL and type of the uploaded resource.
 */
export const uploadToCloudinary = async (file) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("User not authenticated");

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Upload failed");
        }

        return {
            url: data.url,
            type: data.type
        };
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};
