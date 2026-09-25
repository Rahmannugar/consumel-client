const uppercasePattern = /[A-Z]/;
const numberPattern = /[0-9]/;
const specialCharacterPattern = /[^\p{L}\p{N}\s]/u;

export function passwordValidationMessage(password: string): string | null {
  if (password.length < 12 || password.length > 128) {
    return "Use a password between 12 and 128 characters.";
  }
  if (!uppercasePattern.test(password)) {
    return "Add at least one uppercase letter.";
  }
  if (!numberPattern.test(password)) {
    return "Add at least one number.";
  }
  if (!specialCharacterPattern.test(password)) {
    return "Add at least one special character.";
  }
  return null;
}
