import admin from 'firebase-admin';

let initialized = false;

const initializeAdmin = () => {
  if (initialized || admin.apps.length) {
    initialized = true;
    return true;
  }

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : null;

    admin.initializeApp({
      credential: serviceAccount
        ? admin.credential.cert(serviceAccount)
        : admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id
    });
    initialized = true;
    return true;
  } catch {
    return false;
  }
};

export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header.' });
  }

  if (!initializeAdmin()) {
    return res.status(503).json({ success: false, error: 'Authentication service is not configured.' });
  }

  try {
    req.user = await admin.auth().verifyIdToken(header.slice(7));
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};
