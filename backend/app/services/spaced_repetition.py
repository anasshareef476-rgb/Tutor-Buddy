"""
SM-2 Spaced Repetition Algorithm Service
Returns: (next_interval, next_ease_factor, next_repetitions, next_review_date)
"""
from datetime import datetime, timedelta

def sm2(quality: int, repetitions: int, ease_factor: float, interval: int):
    """
    quality: 0-5 rating (0=Again, 2=Hard, 4=Good, 5=Easy)
    """
    if quality < 3:
        # Failed: reset
        repetitions = 0
        interval = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * ease_factor)
        repetitions += 1

    ease_factor = max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    next_review = datetime.utcnow() + timedelta(days=interval)

    return interval, ease_factor, repetitions, next_review

RATING_MAP = {"again": 0, "hard": 2, "good": 4, "easy": 5}
