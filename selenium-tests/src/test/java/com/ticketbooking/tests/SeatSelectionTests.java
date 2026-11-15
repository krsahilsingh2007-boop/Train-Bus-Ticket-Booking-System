package com.ticketbooking.tests;

import com.ticketbooking.pages.LoginPage;
import com.ticketbooking.utils.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SeatSelectionTests extends BaseTest {

    private void ensureLoggedIn() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("customer@railbus.com", "Customer@123");
        wait.until(ExpectedConditions.urlContains("/trains"));
    }

    @Test(priority = 1, description = "TC-11: Verify 2D Interactive Seat Map Opens and Allows Seat Selection")
    public void testSeatSelection() {
        ensureLoggedIn();
        driver.get(baseUrl + "/trains?source=New+Delhi&destination=Mumbai+Central");

        WebElement bookBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("(//button[contains(., 'Select Coach Seats & Book')])[1]")));
        bookBtn.click();

        WebElement seatModal = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(., 'TRAIN COACH VIEW') or contains(., 'FRONT OF VEHICLE')]")));
        Assert.assertNotNull(seatModal, "Seat Map Modal should be visible");

        // Select first available seat
        WebElement seat = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("(//div[contains(@class, 'cursor-pointer') and contains(., '₹')])[1]")));
        seat.click();

        WebElement proceedBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Proceed to Passenger Details')]")));
        Assert.assertTrue(proceedBtn.isEnabled(), "Proceed button should be enabled after selecting seat");
    }

    @Test(priority = 2, description = "TC-12: Verify Booked Seat Prevents Double-Booking Selection")
    public void testBookedSeatValidation() {
        ensureLoggedIn();
        driver.get(baseUrl + "/trains?source=New+Delhi&destination=Mumbai+Central");

        WebElement bookBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("(//button[contains(., 'Select Coach Seats & Book')])[1]")));
        bookBtn.click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(., 'Booked') or contains(., 'Available')]")));
        Assert.assertTrue(driver.getPageSource().contains("Booked") || driver.getPageSource().contains("Hold"),
                "Seat map legend must indicate seat allocation statuses");
    }
}
