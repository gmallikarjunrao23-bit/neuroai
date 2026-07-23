"""Supabase integration service."""

from app.core.config import settings
from supabase import create_client, Client
from typing import Optional

_supabase: Optional[Client] = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return _supabase


def get_supabase_admin() -> Client:
    """Get supabase client with service role for admin operations."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
