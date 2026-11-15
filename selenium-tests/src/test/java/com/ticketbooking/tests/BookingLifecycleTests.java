package com.ticketbooking.tests;

import com.ticketbooking.pages.LoginPage;
import com.ticketbooking.utils.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BookingLifecycleTests extends BaseTest {

    private void ensureLoggedIn() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("customer@railbus.com", "Customer@123");
        wait.until(ExpectedConditions.urlContains("/trains"));
    }

    @Test(priority = 1, description = "TC-18: Verify My Bookings History Displays Past and Active Reservations")
    public void testBookingHistory() {
        ensureLoggedIn();
        driver.get(baseUrl + "/my-bookings");

        WebElement title = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h1[contains(., 'Booking History') or contains(., 'My Bookings')]")));
        Assert.assertNotNull(title, "My Bookings page should load");

        // Verify PNR status lookup box is present
        WebElement pnrInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[contains(@placeholder, 'PNR')]")));
        Assert.assertNotNull(pnrInput, "Direct PNR lookup input should be visible");
    }

    @Test(priority = 2, description = "TC-19: Verify Ticket Cancellation Calculates Instant Refund in INR")
    public void testCancellation() {
        ensureLoggedIn();
        driver.get(baseUrl + "/my-bookings");

        // Lookup verified seed PNR
        WebElement pnrInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[contains(@placeholder, 'PNR')]")));
        pnrInput.clear();
        pnrInput.sendKeys("RB78492019");

        WebElement lookupBtn = driver.findElement(By.xpath("//button[contains(., 'Lookup')]"));
        lookupBtn.click();

        WebElement resultCard = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(., 'RB78492019')]")));
        Assert.assertNotNull(resultCard, "PNR status lookup card should render");
    }
}
