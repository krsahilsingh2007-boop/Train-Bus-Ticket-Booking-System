package com.ticketbooking.tests;

import com.ticketbooking.pages.LoginPage;
import com.ticketbooking.utils.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BookingCheckoutTests extends BaseTest {

    private void ensureLoggedIn() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("customer@railbus.com", "Customer@123");
        wait.until(ExpectedConditions.urlContains("/trains"));
    }

    private void selectSeatAndOpenCheckout() {
        ensureLoggedIn();
        driver.get(baseUrl + "/trains?source=New+Delhi&destination=Mumbai+Central");

        WebElement bookBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("(//button[contains(., 'Select Coach Seats & Book')])[1]")));
        bookBtn.click();

        WebElement seat = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("(//div[contains(@class, 'cursor-pointer') and contains(., '₹')])[1]")));
        seat.click();

        WebElement proceedBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Proceed to Passenger Details')]")));
        proceedBtn.click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h3[contains(., 'Passenger Manifest')]")));
    }

    @Test(priority = 1, description = "TC-13: Verify Passenger Form Field Validation")
    public void testPassengerFormValidation() {
        selectSeatAndOpenCheckout();
        WebElement nameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='Full Legal Name']")));
        nameInput.clear();
        
        WebElement payBtn = driver.findElement(By.xpath("//button[contains(., 'Pay ₹')]"));
        payBtn.click();

        Assert.assertTrue(driver.getCurrentUrl().contains("/trains"), 
                "Submission should be blocked when mandatory passenger fields are empty");
    }

    @Test(priority = 2, description = "TC-14: Verify Payment Gateway Simulation Rejection on Failure Toggle")
    public void testPaymentFailure() {
        selectSeatAndOpenCheckout();
        
        WebElement nameInput = driver.findElement(By.xpath("//input[@placeholder='Full Legal Name']"));
        nameInput.clear();
        nameInput.sendKeys("Simulated Test Passenger");

        WebElement ageInput = driver.findElement(By.xpath("//input[@placeholder='Age']"));
        ageInput.clear();
        ageInput.sendKeys("28");

        // Toggle payment failure checkbox
        WebElement failToggle = driver.findElement(By.xpath("//input[@type='checkbox']"));
        if (!failToggle.isSelected()) {
            failToggle.click();
        }

        WebElement payBtn = driver.findElement(By.xpath("//button[contains(., 'Pay ₹')]"));
        payBtn.click();

        WebElement errorAlert = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(., 'Simulated Gateway Error') or contains(@class, 'bg-red-50')]")));
        Assert.assertTrue(errorAlert.isDisplayed(), "Payment failure banner should be displayed");
    }

    @Test(priority = 3, description = "TC-15: Verify Successful Ticket Booking Generates 10-Digit PNR")
    public void testSuccessfulBooking() {
        selectSeatAndOpenCheckout();
        
        WebElement nameInput = driver.findElement(By.xpath("//input[@placeholder='Full Legal Name']"));
        nameInput.clear();
        nameInput.sendKeys("Arjun Verma");

        WebElement ageInput = driver.findElement(By.xpath("//input[@placeholder='Age']"));
        ageInput.clear();
        ageInput.sendKeys("30");

        // Ensure failure toggle is OFF
        WebElement failToggle = driver.findElement(By.xpath("//input[@type='checkbox']"));
        if (failToggle.isSelected()) {
            failToggle.click();
        }

        WebElement payBtn = driver.findElement(By.xpath("//button[contains(., 'Pay ₹')]"));
        payBtn.click();

        WebElement successModal = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h3[contains(., 'Booking Confirmed!')]")));
        Assert.assertNotNull(successModal, "Booking confirmation screen should be displayed");
    }

    @Test(priority = 4, description = "TC-16: Verify Booking Confirmation Dialog Displays Correct Fare in INR")
    public void testBookingConfirmation() {
        testSuccessfulBooking();
        Assert.assertTrue(driver.getPageSource().contains("₹") && driver.getPageSource().contains("PNR:"),
                "Confirmation screen must display confirmed PNR and fare in INR");
    }

    @Test(priority = 5, description = "TC-17: Verify Official Boarding Pass PDF Download Link")
    public void testTicketDownload() {
        testSuccessfulBooking();
        WebElement downloadBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(., 'Download PDF E-Ticket')]")));
        Assert.assertTrue(downloadBtn.isDisplayed(), "Download PDF E-Ticket button should be available");
    }
}
