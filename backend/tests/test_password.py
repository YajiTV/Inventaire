from app.services.password import hash_password, verify_password


def test_hash_password_produces_argon2_hash() -> None:
    hashed = hash_password("s3cret-pass")
    assert hashed.startswith("$argon2id$")


def test_verify_password_accepts_correct_password() -> None:
    hashed = hash_password("s3cret-pass")
    assert verify_password("s3cret-pass", hashed) is True


def test_verify_password_rejects_wrong_password() -> None:
    hashed = hash_password("s3cret-pass")
    assert verify_password("wrong-pass", hashed) is False


def test_hash_password_uses_random_salt() -> None:
    assert hash_password("s3cret-pass") != hash_password("s3cret-pass")
