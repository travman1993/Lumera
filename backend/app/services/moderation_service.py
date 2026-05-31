import re
from better_profanity import profanity

# Load the default word list once at module import
profanity.load_censor_words()

# ── Reserved usernames ────────────────────────────────────────────────────────
# Nobody can register these — they belong to the platform.
# Add any filmmaker names you want to protect here too.
RESERVED_USERNAMES: frozenset[str] = frozenset({
    # Platform identity
    "lumera", "watchlumera", "lumera_official", "lumeraofficial",
    "lumera_team", "lumerateam", "lumeera",
    # Roles that imply official status
    "admin", "administrator", "superadmin", "staff", "team",
    "official", "moderator", "mod", "support", "help",
    # System/legal
    "legal", "dmca", "abuse", "security", "privacy",
    "contact", "info", "noreply", "no_reply", "no-reply",
    "root", "system", "api", "bot",
    # Common web infrastructure squats
    "www", "mail", "smtp", "ftp", "cdn", "static", "media",
    # Impersonation of well-known filmmakers (expand as needed)
    "spielberg", "kubrick", "scorsese", "nolan", "tarantino",
    "villeneuve", "fincher", "anderson", "coppola", "lynch",
})


def is_reserved_username(username: str) -> bool:
    return username.lower().replace("-", "_") in RESERVED_USERNAMES


# ── Text content screening ────────────────────────────────────────────────────

def contains_prohibited_content(text: str) -> bool:
    """Returns True if text contains profanity or slurs."""
    if not text or not text.strip():
        return False
    return profanity.contains_profanity(text)


def screen_text(field_name: str, value: str | None) -> None:
    """Raises ValueError with a user-facing message if value is prohibited."""
    if not value:
        return
    if contains_prohibited_content(value):
        raise ValueError(f"'{field_name}' contains prohibited language.")


# ── Input length limits ───────────────────────────────────────────────────────
# Enforced here so every API route can call a single validate() function.

FIELD_LIMITS: dict[str, int] = {
    "username": 30,
    "display_name": 60,
    "bio": 500,
    "title": 120,
    "description": 3000,
    "production_story": 3000,
    "gear_used": 500,
    "location": 100,
    "duration": 30,
    "budget": 50,
    "contributor_name": 80,
    "contributor_role": 80,
}


def check_length(field_name: str, value: str | None) -> None:
    if not value:
        return
    limit = FIELD_LIMITS.get(field_name)
    if limit and len(value) > limit:
        raise ValueError(f"'{field_name}' is too long (max {limit} characters).")


def validate_text_field(field_name: str, value: str | None) -> None:
    """Combined length + profanity check for a single field."""
    check_length(field_name, value)
    screen_text(field_name, value)


# ── Username format ───────────────────────────────────────────────────────────

USERNAME_RE = re.compile(r"^[a-zA-Z0-9_.\-]+$")


def validate_username_format(username: str) -> None:
    """Raises ValueError if the username fails format, length, reserved, or profanity checks."""
    if len(username) < 3:
        raise ValueError("Username must be at least 3 characters.")
    check_length("username", username)
    if not USERNAME_RE.match(username):
        raise ValueError(
            "Username may only contain letters, numbers, underscores, periods, and hyphens."
        )
    if is_reserved_username(username):
        raise ValueError("That username is reserved and cannot be used.")
    screen_text("username", username)
