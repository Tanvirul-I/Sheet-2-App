const { verifyToken } = require("../controllers/authController");

const requireAuth = async (req, res, next) => {
        try {
                const authHeader = req.headers.authorization || "";
                const token = authHeader.startsWith("Bearer ")
                        ? authHeader.substring(7)
                        : null;

                if (!token) {
                        return res.status(401).json({
                                success: false,
                                error: "Authentication token is missing.",
                        });
                }

                const decoded = await verifyToken(token);

                if (!decoded) {
                        return res.status(401).json({
                                success: false,
                                error: "Invalid authentication token.",
                        });
                }

                req.user = decoded;
                next();
        } catch (err) {
                console.error(err);
                return res.status(401).json({
                        success: false,
                        error: "Unable to authenticate request.",
                });
        }
};

module.exports = requireAuth;
