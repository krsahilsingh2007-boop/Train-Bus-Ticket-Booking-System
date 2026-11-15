package com.ticketbooking.utils;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class TestListener implements ITestListener {

    @Override
    public void onTestStart(ITestResult result) {
        System.out.println("[TEST STARTED] " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        System.out.println("[TEST PASSED] " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        System.err.println("[TEST FAILED] " + result.getMethod().getMethodName() + " - Reason: " + result.getThrowable().getMessage());
        Object testInstance = result.getInstance();
        if (testInstance instanceof BaseTest) {
            WebDriver driver = ((BaseTest) testInstance).getDriver();
            if (driver != null) {
                captureScreenshot(driver, result.getMethod().getMethodName());
            }
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        System.out.println("[TEST SKIPPED] " + result.getMethod().getMethodName());
    }

    @Override
    public void onStart(ITestContext context) {
        System.out.println("=== Starting Suite: " + context.getName() + " ===");
    }

    @Override
    public void onFinish(ITestContext context) {
        System.out.println("=== Completed Suite: " + context.getName() + " ===");
    }

    private void captureScreenshot(WebDriver driver, String methodName) {
        try {
            TakesScreenshot ts = (TakesScreenshot) driver;
            File src = ts.getScreenshotAs(OutputType.FILE);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            Path destDir = Paths.get("target", "screenshots");
            Files.createDirectories(destDir);
            Path dest = destDir.resolve(methodName + "_" + timestamp + ".png");
            Files.copy(src.toPath(), dest);
            System.out.println("[SCREENSHOT CAPTURED] " + dest.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("[SCREENSHOT ERROR] Could not save screenshot: " + e.getMessage());
        }
    }
}
