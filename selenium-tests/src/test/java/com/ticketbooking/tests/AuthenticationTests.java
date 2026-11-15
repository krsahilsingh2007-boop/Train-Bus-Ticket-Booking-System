package com.ticketbooking.tests;

import com.ticketbooking.pages.LoginPage;
import com.ticketbooking.utils.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AuthenticationTests extends BaseTest {

    @Test(priority = 1, description = "TC-02: Verify Customer Login with Valid Credentials")
    public void testValidLogin() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("customer@railbus.com", "Customer@123");

        wait.until(ExpectedConditions.urlContains("/trains"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/trains") || driver.getCurrentUrl().contains("/"),
                "User should be redirected to portal after successful login");
    }

    @Test(priority = 2, description = "TC-03: Verify Login Rejection with Invalid Credentials")
    public void testInvalidLogin() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("invalid@railbus.com", "WrongPassword!99");

        Assert.assertTrue(loginPage.isErrorMessageDisplayed(),
                "Error alert should be displayed for invalid credentials");
    }

    @Test(priority = 3, description = "TC-04: Verify Admin Login and Administrative Access")
    public void testAdminLogin() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("admin@railbus.com", "Admin@123");

        wait.until(ExpectedConditions.urlContains("/admin"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin"),
                "Admin user should be directed to administrative dashboard");
    }

    @Test(priority = 4, description = "TC-05: Verify User Registration with New Unique Account")
    public void testUserRegistration() {
        driver.get(baseUrl + "/register");
        long timestamp = System.currentTimeMillis();
        String uniqueEmail = "qa.tester." + timestamp + "@railbus.com";

        driver.findElement(By.xpath("//input[@placeholder='Full Name' or @type='text']")).sendKeys("QA Automation User");
        driver.findElement(By.xpath("//input[@type='email']")).sendKeys(uniqueEmail);
        driver.findElement(By.xpath("//input[@type='tel']")).sendKeys("9876543210");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("TestPassword@123");
        driver.findElement(By.xpath("//button[@type='submit']")).click();

        wait.until(ExpectedConditions.urlContains("/trains"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/trains") || driver.getCurrentUrl().contains("/"),
                "User should be registered and navigated to portal");
    }

    @Test(priority = 5, description = "TC-08: Verify User Logout Clears Authentication Session")
    public void testLogout() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("customer@railbus.com", "Customer@123");

        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(., 'Sign Out') or @title='Sign Out' or @title='Logout']"))).click();
        wait.until(ExpectedConditions.urlContains("/login"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"),
                "User should be returned to login screen after logout");
    }

    @Test(priority = 6, description = "TC-09: Verify Unauthorized Route Access Redirects to Login Gate")
    public void testUnauthorizedAccess() {
        driver.manage().deleteAllCookies();
        driver.get(baseUrl + "/my-bookings");
        
        wait.until(ExpectedConditions.urlContains("/login"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"),
                "Protected route should redirect unauthenticated users to login");
    }
}
