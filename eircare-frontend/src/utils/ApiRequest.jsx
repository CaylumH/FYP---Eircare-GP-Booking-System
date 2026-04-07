export const apiRequest = async (url, requestOptions = {}) => {

    const response = await fetch(url, requestOptions);

    if (!response.ok) {

        const responseText = await response.text();

        console.error("API request failed ", responseText);

        let message = responseText;

        try {

            const parsed = JSON.parse(responseText);

            if (parsed.message) message = parsed.message;
        } catch (_) {}

        const error = new Error(message);
        
        error.status = response.status;
        throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return null;
};