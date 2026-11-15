package com.ticketbooking.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Locators
    private By emailInput = By.xpath("//input[@type='email']");
    private By passwordInput = By.xpath("//input[@type='password']");
    private By submitButton = By.xpath("//button[@type='submit']");
    private By customerDemoButton = By.xpath("//button[contains(., 'Fill Demo: Customer')]");
    private By adminDemoButton = By.xpath("//button[contains(., 'Fill Demo: Admin')]");
    private By errorMessage = By.xpath("//div[contains(@class, 'bg-red-50')]");
    private By registerLink = By.xpath("//a[contains(@href, '/register')]");

    public LoginPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void open(String url) {
        driver.get(url + "/login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(submitButton));
    }

    public void enterEmail(String email) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        input.clear();
        input.sendKeys(email);
    }

    public void enterPassword(String password) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput));
        input.clear();
        input.sendKeys(password);
    }

    public void clickSubmit() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(submitButton));
        btn.click();
    }

    public void clickCustomerDemo() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(customerDemoButton));
        btn.click();
    }

    public void clickAdminDemo() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(adminDemoButton));
        btn.click();
    }

    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickSubmit();
    }

    public boolean isErrorMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
