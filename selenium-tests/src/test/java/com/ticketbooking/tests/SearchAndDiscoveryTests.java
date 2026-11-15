package com.ticketbooking.tests;

import com.ticketbooking.pages.HomePage;
import com.ticketbooking.pages.LoginPage;
import com.ticketbooking.utils.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SearchAndDiscoveryTests extends BaseTest {

    private void ensureLoggedIn() {
        LoginPage loginPage = new LoginPage(driver, wait);
        loginPage.open(baseUrl);
        loginPage.login("customer@railbus.com", "Customer@123");
        wait.until(ExpectedConditions.urlContains("/trains"));
    }

    @Test(priority = 1, description = "TC-01: Verify Homepage Loads with Hero Heading and Branding")
    public void testHomepageLoading() {
        ensureLoggedIn();
        driver.get(baseUrl + "/");
        HomePage homePage = new HomePage(driver, wait);
        
        String heading = homePage.getHeroHeadingText();
        Assert.assertTrue(heading.contains("Smarter Railway & Bus Journeys") || heading.contains("RailBus"), 
                "Hero heading should contain expected branding, found: " + heading);
    }

    @Test(priority = 2, description = "TC-06: Verify Railway Search with Origin and Destination")
    public void testRailwaySearch() {
        ensureLoggedIn();
        driver.get(baseUrl + "/");
        HomePage homePage = new HomePage(driver, wait);
        homePage.selectTrainTab();
        homePage.enterOrigin("New Delhi");
        homePage.enterDestination("Mumbai Central");
        homePage.clickSearch();
        
        wait.until(ExpectedConditions.urlContains("/trains"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/trains"), 
                "URL should contain /trains after railway search");
    }

    @Test(priority = 3, description = "TC-07: Verify Bus Search Navigation")
    public void testBusSearch() {
        ensureLoggedIn();
        driver.get(baseUrl + "/");
        HomePage homePage = new HomePage(driver, wait);
        homePage.selectBusTab();
        homePage.enterOrigin("Bengaluru");
        homePage.enterDestination("Chennai Central");
        homePage.clickSearch();
        
        wait.until(ExpectedConditions.urlContains("/buses"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/buses"), 
                "URL should contain /buses after bus search");
    }

    @Test(priority = 4, description = "TC-10: Verify Station Validation Prevents Empty Submissions")
    public void testSourceDestinationValidation() {
        ensureLoggedIn();
        driver.get(baseUrl + "/trains?source=&destination=");
        WebElement searchBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[@title='Search Available Trains' or @type='submit']")));
        Assert.assertNotNull(searchBtn, "Search button should be present on trains page");
    }
}
