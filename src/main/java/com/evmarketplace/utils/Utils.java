package com.evmarketplace.utils;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class Utils {

    public static boolean validateEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegex);
    }

    public static String formatData(String data) {
        if (data == null) {
            return null;
        }
        return data.trim();
    }

    public static LocalDate parseDate(String dateStr) throws DateTimeParseException {
        if (dateStr == null) {
            return null;
        }
        return LocalDate.parse(dateStr);
    }
}
