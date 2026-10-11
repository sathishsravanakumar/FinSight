"""
Luhn algorithm implementation for payment card validation.

The Luhn algorithm (ISO/IEC 7812) is used to validate identification numbers
such as credit card numbers, IMEI numbers, and NPI numbers.

Algorithm steps:
1. Starting from the rightmost digit (check digit), double every second digit.
2. If doubling produces a number > 9, subtract 9.
3. Sum all digits.
4. If the total modulo 10 is 0, the number is valid.
"""
import re
from typing import Tuple


# ── IIN / BIN ranges for card network detection ────────────────────────────
# Sources: ISO 7812, Visa/MC/Amex/RuPay published BIN ranges
_CARD_PATTERNS = [
    ("Amex",        r"^3[47][0-9]{13}$"),
    ("Visa",        r"^4[0-9]{12}(?:[0-9]{3})?(?:[0-9]{3})?$"),
    ("Mastercard",  r"^(?:5[1-5][0-9]{14}|2(?:2[2-9][1-9]|[3-6][0-9]{2}|7[01][0-9]|720)[0-9]{12})$"),
    ("RuPay",       r"^(?:6(?:0[0-3]|52[1-9]|53[0-9]|54[0-9]|55[0-5])[0-9]{13}|81[0-9]{14}|82[01][0-9]{13}|508[0-9]{13})$"),
    ("Discover",    r"^6(?:011|5[0-9]{2})[0-9]{12}$"),
    ("Maestro",     r"^(?:5018|5020|5038|6304|6759|6761|6763)[0-9]{8,15}$"),
    ("UnionPay",    r"^62[0-9]{14,17}$"),
]


def luhn_check(card_number: str) -> bool:
    """
    Validate a card number using the Luhn algorithm.

    Args:
        card_number: Digits only (no spaces or dashes).

    Returns:
        True if valid, False otherwise.
    """
    if not card_number.isdigit():
        return False
    if len(card_number) < 13 or len(card_number) > 19:
        return False

    digits = [int(d) for d in card_number]
    # Double every second digit from the right (skip the check digit)
    for i in range(len(digits) - 2, -1, -2):
        digits[i] *= 2
        if digits[i] > 9:
            digits[i] -= 9

    return sum(digits) % 10 == 0


def detect_card_network(card_number: str) -> str:
    """
    Detect the card network from the IIN/BIN prefix.

    Returns the network name or 'Unknown'.
    """
    for name, pattern in _CARD_PATTERNS:
        if re.match(pattern, card_number):
            return name
    return "Unknown"


def mask_card_number(card_number: str) -> str:
    """
    Mask the card number, showing only the last 4 digits.
    e.g. "4111111111111111" → "**** **** **** 1111"
    """
    last4 = card_number[-4:]
    hidden = len(card_number) - 4
    groups = []
    masked = "*" * hidden + last4
    # Group in blocks of 4
    for i in range(0, len(masked), 4):
        groups.append(masked[i:i+4])
    return " ".join(groups)


def validate_card(raw_number: str) -> Tuple[bool, str, str, str, str]:
    """
    Full card validation: strip → Luhn → network detection → masking.

    Returns:
        (is_valid, network, masked_number, last4, message)
    """
    # Strip whitespace and dashes
    clean = re.sub(r"[\s\-]", "", raw_number)

    if not clean.isdigit():
        return False, "Unknown", "", "", "Card number must contain digits only."

    if len(clean) < 13 or len(clean) > 19:
        return False, "Unknown", "", "", f"Invalid card length ({len(clean)} digits). Expected 13–19."

    network = detect_card_network(clean)
    masked = mask_card_number(clean)
    last4 = clean[-4:]
    valid = luhn_check(clean)

    if valid:
        msg = f"✓ Valid {network} card ending in {last4}."
    else:
        msg = "✗ Invalid card number (Luhn check failed). Please verify and re-enter."

    return valid, network, masked, last4, msg


# ── Test vectors (known valid/invalid numbers) ─────────────────────────────
_TEST_VECTORS = [
    ("4111111111111111", True,  "Visa"),
    ("4111111111111112", False, "Visa"),
    ("5500005555555559", True,  "Mastercard"),
    ("378282246310005",  True,  "Amex"),
    ("6011111111111117", True,  "Discover"),
    ("1234567890123456", False, "Unknown"),
]


def run_tests() -> bool:
    """Run built-in test vectors and return True if all pass."""
    all_pass = True
    for number, expected_valid, expected_network in _TEST_VECTORS:
        is_valid, network, masked, last4, msg = validate_card(number)
        status = "PASS" if is_valid == expected_valid else "FAIL"
        if status == "FAIL":
            all_pass = False
        print(f"  [{status}] {number} → valid={is_valid} (expected {expected_valid}), network={network}")
    return all_pass


if __name__ == "__main__":
    print("Running Luhn algorithm test vectors:")
    passed = run_tests()
    print("All tests passed!" if passed else "Some tests FAILED!")
