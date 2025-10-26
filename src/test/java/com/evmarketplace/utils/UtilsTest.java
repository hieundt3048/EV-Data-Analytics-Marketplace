package com.evmarketplace.utils;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class UtilsTest {

    @Test
    void testValidateEmail() {
        assertTrue(Utils.validateEmail("test@example.com"));
        assertFalse(Utils.validateEmail("invalid-email"));
    }

    @Test
    void testFormatData() {
        String input = "  Sample Data  ";
        String expected = "Sample Data";
        assertEquals(expected, Utils.formatData(input));
    }

    @Test
    void testParseDate() {
        String dateStr = "2023-10-01";
        LocalDate expectedDate = LocalDate.of(2023, 10, 1);
        assertEquals(expectedDate, Utils.parseDate(dateStr));
    }

    @Test
    void testParseDateInvalid() {
        String invalidDateStr = "invalid-date";
        assertThrows(DateTimeParseException.class, () -> {
            Utils.parseDate(invalidDateStr);
        });
    }
}