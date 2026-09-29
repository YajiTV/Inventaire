from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.common import ErrorResponse
from app.schemas.user import UserRead
from app.services import auth_service

settings = get_settings()

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
    responses={401: {"model": ErrorResponse}},
)


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 24 * 3600,
        path="/auth",
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in",
    responses={401: {"model": ErrorResponse, "description": "Invalid email or password"}},
)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    """
    Authenticates with an email and a password.

    The response body carries a short-lived access token, meant to be kept in
    memory on the client (never in localStorage or sessionStorage) and sent
    as `Authorization: Bearer <token>` on every subsequent request. A
    longer-lived refresh token is set alongside it as an httpOnly, Secure,
    SameSite=Strict cookie, scoped to the `/auth` path: it never appears in
    the response body and is never readable from client-side JavaScript.
    """
    try:
        user = auth_service.authenticate(db, payload.email, payload.password)
    except auth_service.InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides") from exc

    access_token, refresh_token = auth_service.issue_tokens(user)
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token, expires_in=settings.access_token_expire_minutes * 60)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Renew the access token",
    responses={401: {"model": ErrorResponse, "description": "Missing, expired or invalid refresh cookie"}},
)
def refresh(request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    """
    Issues a new access token from the refresh token cookie set by `/auth/login`.

    Meant to be called once the access token has expired (or is about to),
    instead of asking the user to log in again. Requires no request body: the
    refresh token travels only as the httpOnly cookie, sent automatically by
    the browser. The refresh token itself is not renewed by this call: the
    same one is reused until it expires (no rotation in this project).
    """
    refresh_token = request.cookies.get(settings.refresh_cookie_name)
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expiree")

    try:
        access_token = auth_service.refresh_access_token(db, refresh_token)
    except auth_service.InvalidSessionError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expiree") from exc

    return TokenResponse(access_token=access_token, expires_in=settings.access_token_expire_minutes * 60)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Log out",
)
def logout(response: Response) -> None:
    """
    Clears the refresh token cookie.

    The client is expected to drop its in-memory access token at the same
    time. The access token itself is not blacklisted: it stays valid, on the
    server side, until its own short expiry runs out.
    """
    response.delete_cookie(settings.refresh_cookie_name, path="/auth")


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get the current user",
)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    """Returns the account behind the access token sent in the `Authorization` header."""
    return current_user
