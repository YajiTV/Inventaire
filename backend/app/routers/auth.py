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


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    """Returns an access token and sets the refresh token cookie."""
    try:
        user = auth_service.authenticate(db, payload.email, payload.password)
    except auth_service.InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides") from exc

    access_token, refresh_token = auth_service.issue_tokens(user)
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token, expires_in=settings.access_token_expire_minutes * 60)


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    """Issues a new access token from the refresh token cookie."""
    refresh_token = request.cookies.get(settings.refresh_cookie_name)
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expiree")

    try:
        access_token = auth_service.refresh_access_token(db, refresh_token)
    except auth_service.InvalidSessionError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expiree") from exc

    return TokenResponse(access_token=access_token, expires_in=settings.access_token_expire_minutes * 60)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(settings.refresh_cookie_name, path="/auth")


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
