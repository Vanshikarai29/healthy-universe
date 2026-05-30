from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from functools import wraps
import sqlite3, os, uuid, bcrypt, jwt

# ─── CONFIG ────────────────────────────────────────────────────────────────────
# SECRET_KEY         = "healthy-universe-secret-2024"
SECRET_KEY  = "healthy-universe-super-secret-key-2024-do-not-share"
TOKEN_EXPIRE_DAYS  = 7
UPLOAD_DIR         = os.path.join(os.path.dirname(__file__), "uploads")
DB_PATH            = os.path.join(os.path.dirname(__file__), "healthy_universe.db")

os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app, origins="*")

ALLOWED_IMAGES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_VIDEOS = {"video/mp4", "video/webm", "video/quicktime"}
MAX_FILE_SIZE  = 50 * 1024 * 1024   # 50 MB

# ─── DATABASE ──────────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def db_one(sql, params=()):
    with get_db() as c:
        row = c.execute(sql, params).fetchone()
    return dict(row) if row else None

def db_all(sql, params=()):
    with get_db() as c:
        rows = c.execute(sql, params).fetchall()
    return [dict(r) for r in rows]

def db_run(sql, params=()):
    with get_db() as c:
        c.execute(sql, params)
        c.commit()

def init_db():
    with get_db() as c:
        c.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                email       TEXT UNIQUE NOT NULL,
                password    TEXT NOT NULL,
                specialty   TEXT DEFAULT 'General User',
                hospital    TEXT DEFAULT '',
                bio         TEXT DEFAULT '',
                avatar_url  TEXT DEFAULT '',
                is_verified INTEGER DEFAULT 0,
                balance     REAL    DEFAULT 0.0,
                hu_coins    INTEGER DEFAULT 500,
                created_at  TEXT    DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS posts (
                id          TEXT PRIMARY KEY,
                user_id     TEXT NOT NULL,
                content     TEXT NOT NULL,
                media_url   TEXT DEFAULT '',
                media_type  TEXT DEFAULT '',
                category    TEXT DEFAULT 'General Wellness',
                likes       INTEGER DEFAULT 0,
                views       INTEGER DEFAULT 0,
                revenue     REAL    DEFAULT 0.0,
                created_at  TEXT    DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        """)
        c.commit()

init_db()

# ─── HELPERS ───────────────────────────────────────────────────────────────────
def safe_user(u):
    u = dict(u)
    u.pop("password", None)
    return u

def make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_token_from_request():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        user_id = decode_token(token)
        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401
        user = db_one("SELECT * FROM users WHERE id = ?", (user_id,))
        if not user:
            return jsonify({"error": "User not found"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def post_with_author(post):
    a = db_one("SELECT * FROM users WHERE id = ?", (post["user_id"],)) or {}
    post["author"] = {
        "id":        a.get("id", ""),
        "name":      a.get("name", "Unknown"),
        "specialty": a.get("specialty", ""),
        "avatar":    a.get("avatar_url", ""),
        "verified":  bool(a.get("is_verified", 0)),
    }
    return post

# ─── STATIC FILES (uploads) ────────────────────────────────────────────────────
@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Healthy Universe API is running! 🏥"})

# ─── AUTH: SIGNUP ──────────────────────────────────────────────────────────────
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data      = request.get_json(force=True) or {}
    name      = (data.get("name") or "").strip()
    email     = (data.get("email") or "").strip().lower()
    password  = data.get("password") or ""
    specialty = data.get("specialty") or "General User"
    hospital  = data.get("hospital") or ""

    if not name or not email or not password:
        return jsonify({"detail": "Name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters"}), 400
    if db_one("SELECT id FROM users WHERE email = ?", (email,)):
        return jsonify({"detail": "Email already registered"}), 400

    uid      = str(uuid.uuid4())
    hashed   = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    db_run(
        "INSERT INTO users (id,name,email,password,specialty,hospital) VALUES (?,?,?,?,?,?)",
        (uid, name, email, hashed, specialty, hospital)
    )
    user  = safe_user(db_one("SELECT * FROM users WHERE id = ?", (uid,)))
    token = make_token(uid)
    return jsonify({"access_token": token, "token_type": "bearer", "user": user}), 201

# ─── AUTH: LOGIN ───────────────────────────────────────────────────────────────
@app.route("/api/auth/login", methods=["POST"])
def login():
    # Support JSON body
    data     = request.get_json(force=True, silent=True) or {}
    email    = (data.get("email") or data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    # Fallback to form data (OAuth2 style)
    if not email:
        email    = (request.form.get("username") or "").strip().lower()
        password = request.form.get("password") or ""

    if not email or not password:
        return jsonify({"detail": "Email and password are required"}), 400

    user = db_one("SELECT * FROM users WHERE email = ?", (email,))
    if not user:
        return jsonify({"detail": "Invalid email or password"}), 401

    if not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"detail": "Invalid email or password"}), 401

    token = make_token(user["id"])
    return jsonify({"access_token": token, "token_type": "bearer", "user": safe_user(user)})

# ─── AUTH: ME ──────────────────────────────────────────────────────────────────
@app.route("/api/auth/me")
@require_auth
def get_me():
    return jsonify(safe_user(request.current_user))

# ─── POSTS: CREATE ─────────────────────────────────────────────────────────────
@app.route("/api/posts/create", methods=["POST"])
@require_auth
def create_post():
    content  = (request.form.get("content") or "").strip()
    category = request.form.get("category") or "General Wellness"
    media    = request.files.get("media")

    if not content and not media:
        return jsonify({"detail": "Post content or media is required"}), 400

    media_url  = ""
    media_type = ""

    if media and media.filename:
        ct = media.content_type or ""
        if ct not in (ALLOWED_IMAGES | ALLOWED_VIDEOS):
            return jsonify({"detail": "Only images and videos are allowed"}), 400

        file_bytes = media.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            return jsonify({"detail": "File too large (max 50MB)"}), 400

        ext      = os.path.splitext(media.filename)[1] or ".bin"
        filename = str(uuid.uuid4()) + ext
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(file_bytes)

        media_url  = f"/uploads/{filename}"
        media_type = "image" if ct in ALLOWED_IMAGES else "video"

    post_id = str(uuid.uuid4())
    db_run(
        "INSERT INTO posts (id,user_id,content,media_url,media_type,category) VALUES (?,?,?,?,?,?)",
        (post_id, request.current_user["id"], content, media_url, media_type, category)
    )
    post = db_one("SELECT * FROM posts WHERE id = ?", (post_id,))
    return jsonify(post_with_author(post)), 201

# ─── POSTS: GET FEED ───────────────────────────────────────────────────────────
@app.route("/api/posts")
def get_posts():
    limit  = int(request.args.get("limit",  20))
    offset = int(request.args.get("offset",  0))
    posts  = db_all(
        "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (limit, offset)
    )
    return jsonify([post_with_author(p) for p in posts])

# ─── POSTS: LIKE ───────────────────────────────────────────────────────────────
@app.route("/api/posts/<post_id>/like", methods=["POST"])
@require_auth
def like_post(post_id):
    if not db_one("SELECT id FROM posts WHERE id = ?", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404
    db_run("UPDATE posts SET likes = likes + 1 WHERE id = ?", (post_id,))
    updated = db_one("SELECT likes FROM posts WHERE id = ?", (post_id,))
    return jsonify({"likes": updated["likes"]})

# ─── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🏥 Healthy Universe API starting...")
    print("📡 Running on http://localhost:8000\n")
    app.run(host="0.0.0.0", port=8000, debug=True)