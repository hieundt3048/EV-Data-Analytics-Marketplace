public class Utils {

    public static boolean validateEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }

    public static String formatCurrency(double amount) {
        java.text.NumberFormat currencyFormat = java.text.NumberFormat.getCurrencyInstance();
        return currencyFormat.format(amount);
    }

    public static String sanitizeInput(String input) {
        return input != null ? input.trim().replaceAll("[^a-zA-Z0-9 ]", "") : "";
    }
}