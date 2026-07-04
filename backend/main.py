from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
import os, uuid, bcrypt, jwt, psycopg2, psycopg2.extras

load_dotenv()

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SECRET_KEY        = os.getenv("SECRET_KEY", "hu-super-secret-key-change-in-prod-2024")
TOKEN_EXPIRE_DAYS = int(os.getenv("TOKEN_EXPIRE_DAYS", 1))
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
# def init_db():
#     conn = get_db()
#     try:
#         with conn.cursor() as cur:
#             cur.execute("""
#                 CREATE TABLE IF NOT EXISTS users (
#                     id          VARCHAR(36)   NOT NULL PRIMARY KEY,
#                     name        VARCHAR(120)  NOT NULL,
#                     email       VARCHAR(180)  NOT NULL UNIQUE,
#                     password    VARCHAR(255)  NOT NULL,
#                     specialty   VARCHAR(100)  DEFAULT 'General User',
#                     hospital    VARCHAR(150)  DEFAULT '',
#                     bio         TEXT,
#                     avatar_url  VARCHAR(500)  DEFAULT '',
#                     is_verified BOOLEAN       DEFAULT FALSE,
#                     balance     NUMERIC(10,2) DEFAULT 0.00,
#                     hu_coins    INT           DEFAULT 500,
#                     created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
#                     updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
#                 );
#             """)
#             cur.execute("""
#                 CREATE TABLE IF NOT EXISTS posts (
#                     id          VARCHAR(36)   NOT NULL PRIMARY KEY,
#                     user_id     VARCHAR(36)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
#                     content     TEXT          NOT NULL,
#                     media_url   VARCHAR(500)  DEFAULT '',
#                     media_type  VARCHAR(20)   DEFAULT '',
#                     category    VARCHAR(80)   DEFAULT 'General Wellness',
#                     likes       INT           DEFAULT 0,
#                     views       INT           DEFAULT 0,
#                     revenue     NUMERIC(10,2) DEFAULT 0.00,
#                     created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
#                 );
#             """)
#         conn.commit()
#         print("✅ PostgreSQL tables ready")
#     finally:
#         conn.close()
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

            # ── NEW: ADS ENGINE TABLES ──────────────────────────────────────
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_campaigns (
                    id               VARCHAR(36)   NOT NULL PRIMARY KEY,
                    user_id          VARCHAR(36)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name             VARCHAR(150)  NOT NULL,
                    objective        VARCHAR(40)   DEFAULT 'awareness',
                    status           VARCHAR(20)   DEFAULT 'active',
                    budget           NUMERIC(10,2) NOT NULL DEFAULT 0,
                    spent            NUMERIC(10,2) NOT NULL DEFAULT 0,
                    bid_amount       NUMERIC(10,2) NOT NULL DEFAULT 2.00,
                    target_specialty VARCHAR(100)  DEFAULT 'All',
                    target_location  VARCHAR(100)  DEFAULT 'All',
                    start_date       DATE          DEFAULT CURRENT_DATE,
                    end_date         DATE,
                    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_creatives (
                    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
                    campaign_id VARCHAR(36)  NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
                    headline    VARCHAR(150) NOT NULL,
                    body_text   TEXT         DEFAULT '',
                    image_url   VARCHAR(500) DEFAULT '',
                    cta_text    VARCHAR(40)  DEFAULT 'Learn More',
                    cta_link    VARCHAR(500) DEFAULT '',
                    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_impressions (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    campaign_id VARCHAR(36) NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
                    creative_id VARCHAR(36) NOT NULL,
                    user_id     VARCHAR(36),
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_clicks (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    campaign_id VARCHAR(36) NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
                    creative_id VARCHAR(36) NOT NULL,
                    user_id     VARCHAR(36),
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            # ── END NEW TABLES ───────────────────────────────────────────────

        conn.commit()
        print("✅ PostgreSQL tables ready")
    finally:
        conn.close()

# ─── STARTUP ───────────────────────────────────────────────────────────────────
with app.app_context():
    try:
        init_db()
        print("✅ DB initialized on startup")
    except Exception as e:
        print(f"⚠️ DB init error: {e}")
        
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


# ══════════════════════════════════════════════════════════════════════════════
#  ADS ENGINE — campaigns, creatives, serving, tracking
# ══════════════════════════════════════════════════════════════════════════════

def campaign_with_stats(c) -> dict:
    if not c: return {}
    c = dict(c)
    for k, v in c.items():
        if isinstance(v, datetime): c[k] = v.isoformat()
    imp = db_one("SELECT COUNT(*) AS n FROM ad_impressions WHERE campaign_id=%s", (c["id"],))
    clk = db_one("SELECT COUNT(*) AS n FROM ad_clicks WHERE campaign_id=%s", (c["id"],))
    impressions = imp["n"] if imp else 0
    clicks      = clk["n"] if clk else 0
    ctr = round((clicks / impressions) * 100, 2) if impressions else 0.0
    creative = db_one("SELECT * FROM ad_creatives WHERE campaign_id=%s ORDER BY created_at DESC LIMIT 1", (c["id"],))
    if creative:
        creative = dict(creative)
        for k, v in creative.items():
            if isinstance(v, datetime): creative[k] = v.isoformat()
    c["impressions"] = impressions
    c["clicks"]      = clicks
    c["ctr"]         = ctr
    c["remaining"]   = round(float(c["budget"]) - float(c["spent"]), 2)
    c["creative"]    = creative or {}
    return c


@app.route("/api/ads/campaigns", methods=["POST"])
@require_auth
def create_campaign():
    uid = str(request.current_user["id"])

    name       = (request.form.get("name") or "").strip()
    objective  = request.form.get("objective") or "awareness"
    budget     = request.form.get("budget")
    bid_amount = request.form.get("bid_amount") or "2.00"
    specialty  = request.form.get("target_specialty") or "All"
    location   = request.form.get("target_location") or "All"
    end_date   = request.form.get("end_date") or None

    headline  = (request.form.get("headline") or "").strip()
    body_text = request.form.get("body_text") or ""
    cta_text  = request.form.get("cta_text") or "Learn More"
    cta_link  = request.form.get("cta_link") or ""
    image     = request.files.get("image")

    if not name:
        return jsonify({"detail": "Campaign name is required"}), 400
    if not headline:
        return jsonify({"detail": "Ad headline is required"}), 400
    try:
        budget = float(budget)
        bid_amount = float(bid_amount)
    except (TypeError, ValueError):
        return jsonify({"detail": "Budget and bid amount must be numbers"}), 400
    if budget <= 0:
        return jsonify({"detail": "Budget must be greater than 0"}), 400

    image_url = ""
    if image and image.filename:
        ct = image.content_type or ""
        if ct not in ALLOWED_IMAGES:
            return jsonify({"detail": "Ad creative must be an image (jpg/png/gif/webp)"}), 400
        file_bytes = image.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "Image too large (max 50MB)"}), 400
        ext   = os.path.splitext(image.filename)[1] or ".jpg"
        fname = str(uuid.uuid4()) + ext
        with open(os.path.join(UPLOAD_DIR, fname), "wb") as f:
            f.write(file_bytes)
        image_url = f"/uploads/{fname}"

    cid = str(uuid.uuid4())
    db_run(
        """INSERT INTO ad_campaigns
           (id, user_id, name, objective, budget, bid_amount, target_specialty, target_location, end_date)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (cid, uid, name, objective, budget, bid_amount, specialty, location, end_date)
    )
    crid = str(uuid.uuid4())
    db_run(
        """INSERT INTO ad_creatives (id, campaign_id, headline, body_text, image_url, cta_text, cta_link)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (crid, cid, headline, body_text, image_url, cta_text, cta_link)
    )

    campaign = db_one("SELECT * FROM ad_campaigns WHERE id=%s", (cid,))
    return jsonify(campaign_with_stats(campaign)), 201


@app.route("/api/ads/campaigns/mine")
@require_auth
def my_campaigns():
    uid = str(request.current_user["id"])
    rows = db_all("SELECT * FROM ad_campaigns WHERE user_id=%s ORDER BY created_at DESC", (uid,))
    return jsonify([campaign_with_stats(r) for r in rows])


@app.route("/api/ads/campaigns/<campaign_id>/status", methods=["PUT"])
@require_auth
def update_campaign_status(campaign_id):
    uid  = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    status = data.get("status")
    if status not in ("active", "paused"):
        return jsonify({"detail": "Status must be 'active' or 'paused'"}), 400

    c = db_one("SELECT id, user_id FROM ad_campaigns WHERE id=%s", (campaign_id,))
    if not c:
        return jsonify({"detail": "Campaign not found"}), 404
    if str(c["user_id"]) != uid:
        return jsonify({"detail": "Not your campaign"}), 403

    db_run("UPDATE ad_campaigns SET status=%s WHERE id=%s", (status, campaign_id))
    return jsonify({"message": "Campaign " + status})


@app.route("/api/ads/campaigns/<campaign_id>", methods=["DELETE"])
@require_auth
def delete_campaign(campaign_id):
    uid = str(request.current_user["id"])
    c = db_one("SELECT id, user_id FROM ad_campaigns WHERE id=%s", (campaign_id,))
    if not c:
        return jsonify({"detail": "Campaign not found"}), 404
    if str(c["user_id"]) != uid:
        return jsonify({"detail": "Not your campaign"}), 403
    db_run("DELETE FROM ad_campaigns WHERE id=%s", (campaign_id,))
    return jsonify({"message": "Campaign deleted"})


@app.route("/api/ads/serve")
def serve_ad():
    """Pick one eligible active ad to show in the feed."""
    row = db_one(
        """SELECT c.*, cr.id AS creative_id, cr.headline, cr.body_text,
                  cr.image_url, cr.cta_text, cr.cta_link
           FROM ad_campaigns c
           JOIN ad_creatives cr ON cr.campaign_id = c.id
           WHERE c.status = 'active'
             AND c.spent < c.budget
             AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
           ORDER BY RANDOM()
           LIMIT 1"""
    )
    if not row:
        return jsonify(None)
    row = dict(row)
    for k, v in row.items():
        if isinstance(v, datetime): row[k] = v.isoformat()
    advertiser = db_one("SELECT name, avatar_url FROM users WHERE id=%s", (row["user_id"],)) or {}
    row["advertiser_name"] = advertiser.get("name", "Sponsored")
    return jsonify(row)


@app.route("/api/ads/impression", methods=["POST"])
def log_impression():
    data = request.get_json(force=True) or {}
    campaign_id = data.get("campaign_id")
    creative_id = data.get("creative_id")
    if not campaign_id or not creative_id:
        return jsonify({"detail": "campaign_id and creative_id required"}), 400

    auth  = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    uid   = decode_token(token) if token else None

    db_run(
        "INSERT INTO ad_impressions (id, campaign_id, creative_id, user_id) VALUES (%s,%s,%s,%s)",
        (str(uuid.uuid4()), campaign_id, creative_id, uid)
    )
    return jsonify({"message": "logged"})


@app.route("/api/ads/click", methods=["POST"])
def log_click():
    data = request.get_json(force=True) or {}
    campaign_id = data.get("campaign_id")
    creative_id = data.get("creative_id")
    if not campaign_id or not creative_id:
        return jsonify({"detail": "campaign_id and creative_id required"}), 400

    auth  = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    uid   = decode_token(token) if token else None

    campaign = db_one("SELECT * FROM ad_campaigns WHERE id=%s", (campaign_id,))
    if not campaign:
        return jsonify({"detail": "Campaign not found"}), 404

    db_run(
        "INSERT INTO ad_clicks (id, campaign_id, creative_id, user_id) VALUES (%s,%s,%s,%s)",
        (str(uuid.uuid4()), campaign_id, creative_id, uid)
    )

    new_spent = float(campaign["spent"]) + float(campaign["bid_amount"])
    db_run("UPDATE ad_campaigns SET spent=%s WHERE id=%s", (new_spent, campaign_id))

    if new_spent >= float(campaign["budget"]):
        db_run("UPDATE ad_campaigns SET status='paused' WHERE id=%s", (campaign_id,))

    return jsonify({"message": "logged", "spent": new_spent})

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