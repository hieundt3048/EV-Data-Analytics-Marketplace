import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DataConsumerTest {
    private DataConsumer dataConsumer;

    @BeforeEach
    void setUp() {
        dataConsumer = new DataConsumer("1", "Test Consumer");
    }

    @Test
    void testSearchData() {
        // Assuming searchData returns a list of data
        List<Data> results = dataConsumer.searchData("EV data");
        assertNotNull(results);
        assertFalse(results.isEmpty());
    }

    @Test
    void testPurchaseData() {
        boolean purchaseResult = dataConsumer.purchaseData("dataId123");
        assertTrue(purchaseResult);
    }

    @Test
    void testAccessAPI() {
        String apiResponse = dataConsumer.accessAPI();
        assertNotNull(apiResponse);
        assertEquals("API Access Granted", apiResponse);
    }
}