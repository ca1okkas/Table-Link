import { verifyToken } from './auth.js';
import { db } from './db.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });

  const session = verifyToken(token);
  if (!session) return res.status(401).json({ error: 'Sessão inválida ou expirada.' });

  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(session.userId);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

  req.user = user;
  req.sid  = session.sid;
  next();
}
