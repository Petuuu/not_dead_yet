import axios from "axios";

export default async function handler(req, res) {
    const backendUrl =
        process.env.BACKEND_URL;

    if (!backendUrl) {
        return res.status(500).json({
            error: "BACKEND_URL is not configured",
        });
    }

    const path = Array.isArray(req.query.path)
        ? req.query.path.join("/")
        : req.query.path || "";
    const query = { ...req.query };
    delete query.path;

    try {
        const response = await axios({
            method: req.method,
            url: `${backendUrl.replace(/\/$/, "")}/${path}`,
            params: query,
            data: req.body,
            headers: {
                "content-type": req.headers["content-type"],
                accept: req.headers.accept,
            },
            validateStatus: () => true,
        });

        return res.status(response.status).send(response.data);
    } catch (error) {
        console.error("Backend proxy request failed:", error.message);
        return res.status(502).json({ error: "Backend request failed" });
    }
}
