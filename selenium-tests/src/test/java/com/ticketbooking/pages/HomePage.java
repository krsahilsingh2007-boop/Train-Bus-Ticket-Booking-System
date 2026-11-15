package com.ticketbooking.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class HomePage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Locators
    private By heroHeading = By.tagName("h1");
    private By trainTabButton = By.xpath("//button[contains(., 'Book Train Tickets')]");
    private By busTabButton = By.xpath("//button[contains(., 'Book Intercity Buses')]");
    private By sourceInput = By.xpath("//input[@placeholder='Origin Station or City']");
    private By destinationInput = By.xpath("//input[@placeholder='Destination Station or City']");
    private By dateInput = By.xpath("//input[@type='date']");
    private By searchButton = By.xpath("//button[contains(., 'Search Available')]");
    private By swapButton = By.xpath("//button[@title='Swap Source and Destination']");

    public HomePage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void open(String url) {
        driver.get(url);
        wait.until(ExpectedConditions.visibilityOfElementLocated(heroHeading));
    }

    public String getHeroHeadingText() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(heroHeading)).getText();
    }

    public void selectTrainTab() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(trainTabButton));
        btn.click();
    }

    public void selectBusTab() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(busTabButton));
        btn.click();
    }

    public void enterOrigin(String origin) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(sourceInput));
        input.clear();
        input.sendKeys(origin);
    }

    public void enterDestination(String destination) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(destinationInput));
        input.clear();
        input.sendKeys(destination);
    }

    public void clickSearch() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(searchButton));
        btn.click();
    }

    public void swapStations() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(swapButton));
        btn.click();
    }
}
