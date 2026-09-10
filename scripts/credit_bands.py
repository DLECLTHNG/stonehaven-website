# -*- coding: utf-8 -*-
"""Single source of truth for the credit-score dropdown used on every form
(owner spec 2026-09-10): ten 20-point bands from 850-780 to 619-600, plus a
neutral placeholder so an untouched select never reports a real band."""
BANDS = ["850-780", "779-760", "759-740", "739-720", "719-700", "699-680", "679-660", "659-640", "639-620", "619-600"]

def options(lang="en"):
    ph = "Select a range" if lang == "en" else "Seleccione un rango"
    return ('<option value="not-sure" selected>%s</option>' % ph) + ''.join('<option value="%s">%s</option>' % (b, b) for b in BANDS)
