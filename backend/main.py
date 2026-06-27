from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
import os, uuid, bcrypt, jwt, psycopg2, psycopg2.extras

load_dotenv()

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SECRET_KEY        = os.getenv("SECRET_KEY", "hu-super-secret-key-change-in-prod-2024")
TOKEN_EXPIRE_DAYS = int(os.getenv("TOKEN_EXPIRE_DAYS", 7))
UPLOAD_DIR        = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    ""
)

ALLOWED_IMAGES = {"image/jpeg","image/png","image/gif","image/webp"}
ALLOWED_VIDEOS = {"video/mp4","video/webm","video/quicktime"}
MAX_FILE_BYTES = 50 * 1024 * 1024

# ─── APP ───────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=os.getenv("ALLOWED_ORIGINS","*").split(","))

# ─── DB HELPERS ────────────────────────────────────────────────────────────────
def get_db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)

def db_one(sql, params=()):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchone()
    finally:
        conn.close()

def db_all(sql, params=()):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        conn.close()

def db_run(sql, params=()):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def safe_user(u) -> dict:
    if not u: return {}
    u = dict(u)
    u.pop("password", None)
    for k, v in u.items():
        if isinstance(v, datetime):
            u[k] = v.isoformat()
    return u

def post_with_author(post) -> dict:
    if not post: return {}
    post = dict(post)
    for k, v in post.items():
        if isinstance(v, datetime): post[k] = v.isoformat()
    a = db_one("SELECT id,name,specialty,avatar_url,is_verified FROM users WHERE id=%s",
               (post.get("user_id"),)) or {}
    post["author"] = {
        "id":        str(a.get("id","")),
        "name":      a.get("name","Unknown"),
        "specialty": a.get("specialty",""),
        "avatar":    a.get("avatar_url",""),
        "verified":  bool(a.get("is_verified", False)),
    }
    return post

# ─── JWT ───────────────────────────────────────────────────────────────────────
def make_token(user_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"]).get("sub")
    except Exception:
        return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth  = request.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        uid = decode_token(token)
        if not uid:
            return jsonify({"error": "Invalid or expired token. Please log in again."}), 401
        user = db_one("SELECT * FROM users WHERE id=%s", (uid,))
        if not user:
            return jsonify({"error": "User not found"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

# ─── DB INIT ───────────────────────────────────────────────────────────────────
def init_db():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id          VARCHAR(36)   NOT NULL PRIMARY KEY,
                    name        VARCHAR(120)  NOT NULL,
                    email       VARCHAR(180)  NOT NULL UNIQUE,
                    password    VARCHAR(255)  NOT NULL,
                    specialty   VARCHAR(100)  DEFAULT 'General User',
                    hospital    VARCHAR(150)  DEFAULT '',
                    bio         TEXT,
                    avatar_url  VARCHAR(500)  DEFAULT '',
                    is_verified BOOLEAN       DEFAULT FALSE,
                    balance     NUMERIC(10,2) DEFAULT 0.00,
                    hu_coins    INT           DEFAULT 500,
                    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
                    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id          VARCHAR(36)   NOT NULL PRIMARY KEY,
                    user_id     VARCHAR(36)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    content     TEXT          NOT NULL,
                    media_url   VARCHAR(500)  DEFAULT '',
                    media_type  VARCHAR(20)   DEFAULT '',
                    category    VARCHAR(80)   DEFAULT 'General Wellness',
                    likes       INT           DEFAULT 0,
                    views       INT           DEFAULT 0,
                    revenue     NUMERIC(10,2) DEFAULT 0.00,
                    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
                );
            """)
        conn.commit()
        print("✅ PostgreSQL tables ready")
    finally:
        conn.close()

# ─── SERVE UPLOADS ─────────────────────────────────────────────────────────────
@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
@app.route("/")
@app.route("/api/health")
def health():
    try:
        db_one("SELECT 1")
        db_status = "connected ✅"
    except Exception as e:
        db_status = f"error: {e}"
    return jsonify({
        "status":    "ok",
        "database":  db_status,
        "message":   "Healthy Universe API 🏥",
        "version":   "2.0.0"
    })

# ══════════════════════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data      = request.get_json(force=True) or {}
    name      = (data.get("name")      or "").strip()
    email     = (data.get("email")     or "").strip().lower()
    password  =  data.get("password")  or ""
    specialty =  data.get("specialty") or "General User"
    hospital  =  data.get("hospital")  or ""

    if not name:
        return jsonify({"detail": "Full name is required"}), 400
    if not email or "@" not in email:
        return jsonify({"detail": "Valid email address is required"}), 400
    if len(password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters"}), 400

    if db_one("SELECT id FROM users WHERE email=%s", (email,)):
        return jsonify({"detail": "This email is already registered. Please log in."}), 400

    uid    = str(uuid.uuid4())
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    db_run(
        """INSERT INTO users (id, name, email, password, specialty, hospital)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (uid, name, email, hashed, specialty, hospital)
    )

    user  = safe_user(db_one("SELECT * FROM users WHERE id=%s", (uid,)))
    token = make_token(uid)
    return jsonify({
        "access_token": token,
        "token_type":   "bearer",
        "user":         user,
        "message":      f"Welcome to Healthy Universe, {name}! 🎉"
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json(force=True, silent=True) or {}
    email    = (data.get("email") or data.get("username") or "").strip().lower()
    password =  data.get("password") or ""

    if not email or not password:
        return jsonify({"detail": "Email and password are required"}), 400

    user = db_one("SELECT * FROM users WHERE email=%s", (email,))
    if not user:
        return jsonify({"detail": "No account found with this email. Please sign up."}), 401
    if not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"detail": "Incorrect password. Please try again."}), 401

    u     = safe_user(user)
    token = make_token(u["id"])
    return jsonify({
        "access_token": token,
        "token_type":   "bearer",
        "user":         u,
        "message":      f"Welcome back, {u['name']}! 👋"
    })


@app.route("/api/auth/me")
@require_auth
def get_me():
    return jsonify(safe_user(request.current_user))


@app.route("/api/auth/update", methods=["PUT"])
@require_auth
def update_profile():
    data      = request.get_json(force=True) or {}
    uid       = str(request.current_user["id"])
    name      = (data.get("name") or "").strip()
    specialty =  data.get("specialty") or request.current_user.get("specialty","")
    hospital  =  data.get("hospital")  or ""
    bio       =  data.get("bio")       or ""

    if not name:
        return jsonify({"detail": "Name cannot be empty"}), 400

    db_run(
        "UPDATE users SET name=%s, specialty=%s, hospital=%s, bio=%s WHERE id=%s",
        (name, specialty, hospital, bio, uid)
    )
    user = safe_user(db_one("SELECT * FROM users WHERE id=%s", (uid,)))
    return jsonify({"user": user, "message": "Profile updated successfully ✅"})


@app.route("/api/auth/change-password", methods=["PUT"])
@require_auth
def change_password():
    data         = request.get_json(force=True) or {}
    old_password =  data.get("old_password") or ""
    new_password =  data.get("new_password") or ""
    uid          =  str(request.current_user["id"])

    if not old_password or not new_password:
        return jsonify({"detail": "Both old and new passwords are required"}), 400
    if len(new_password) < 6:
        return jsonify({"detail": "New password must be at least 6 characters"}), 400

    user = db_one("SELECT password FROM users WHERE id=%s", (uid,))
    if not bcrypt.checkpw(old_password.encode(), user["password"].encode()):
        return jsonify({"detail": "Current password is incorrect"}), 401

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db_run("UPDATE users SET password=%s WHERE id=%s", (hashed, uid))
    return jsonify({"message": "Password changed successfully 🔐"})


# ══════════════════════════════════════════════════════════════════════════════
#  POST ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/posts/create", methods=["POST"])
@require_auth
def create_post():
    content  = (request.form.get("content") or "").strip()
    category =  request.form.get("category") or "General Wellness"
    media    =  request.files.get("media")
    uid      =  str(request.current_user["id"])

    if not content and not media:
        return jsonify({"detail": "Please add text or media to your post"}), 400

    media_url = ""; media_type = ""
    if media and media.filename:
        ct = media.content_type or ""
        if ct not in (ALLOWED_IMAGES | ALLOWED_VIDEOS):
            return jsonify({"detail": "Only images and videos are allowed"}), 400
        file_bytes = media.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "File too large (max 50MB)"}), 400
        ext   = os.path.splitext(media.filename)[1] or ".bin"
        fname = str(uuid.uuid4()) + ext
        with open(os.path.join(UPLOAD_DIR, fname), "wb") as f:
            f.write(file_bytes)
        media_url  = f"/uploads/{fname}"
        media_type = "image" if ct in ALLOWED_IMAGES else "video"

    post_id = str(uuid.uuid4())
    db_run(
        """INSERT INTO posts (id, user_id, content, media_url, media_type, category)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (post_id, uid, content, media_url, media_type, category)
    )
    post = db_one("SELECT * FROM posts WHERE id=%s", (post_id,))
    return jsonify(post_with_author(post)), 201


@app.route("/api/posts")
def get_posts():
    limit  = min(int(request.args.get("limit",  20)), 100)
    offset = int(request.args.get("offset", 0))
    posts  = db_all(
        "SELECT * FROM posts ORDER BY created_at DESC LIMIT %s OFFSET %s",
        (limit, offset)
    )
    return jsonify([post_with_author(p) for p in posts])


@app.route("/api/posts/mine")
@require_auth
def get_my_posts():
    uid   = str(request.current_user["id"])
    posts = db_all(
        "SELECT * FROM posts WHERE user_id=%s ORDER BY created_at DESC", (uid,)
    )
    return jsonify([post_with_author(p) for p in posts])


@app.route("/api/posts/<post_id>/like", methods=["POST"])
@require_auth
def like_post(post_id):
    if not db_one("SELECT id FROM posts WHERE id=%s", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404
    db_run("UPDATE posts SET likes=likes+1 WHERE id=%s", (post_id,))
    updated = db_one("SELECT likes FROM posts WHERE id=%s", (post_id,))
    return jsonify({"likes": updated["likes"]})


@app.route("/api/posts/<post_id>", methods=["DELETE"])
@require_auth
def delete_post(post_id):
    uid  = str(request.current_user["id"])
    post = db_one("SELECT id,user_id FROM posts WHERE id=%s", (post_id,))
    if not post:
        return jsonify({"detail": "Post not found"}), 404
    if str(post["user_id"]) != uid:
        return jsonify({"detail": "You can only delete your own posts"}), 403
    db_run("DELETE FROM posts WHERE id=%s", (post_id,))
    return jsonify({"message": "Post deleted"})


# ─── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*50)
    print("  🏥  Healthy Universe API  v2.0  ")
    print("="*50)
    print("🐘 Connecting to PostgreSQL (Supabase)...")
    try:
        init_db()
        port  = int(os.getenv("PORT", 8000))
        debug = os.getenv("FLASK_ENV", "development") == "development"
        print(f"📡 Running on http://localhost:{port}")
        print(f"🔧 Debug mode: {'ON' if debug else 'OFF'}")
        print("="*50 + "\n")
        app.run(host="0.0.0.0", port=port, debug=debug)
    except Exception as e:
        print(f"\n❌ Startup failed: {e}")
        print("👉 Check DATABASE_URL is correct in .env\n")